"""Telegram-пульт Нейрофермы ТРИЗНЕС на aiogram 3.x."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message
from dotenv import load_dotenv
from supabase import Client, create_client

from gemini_service import generate_shorts_ideas

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
CREATOR_ROLES = {"admin", "administrator", "creator", "создатель", "администратор"}

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не задан в .env")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL и SUPABASE_KEY обязательны в .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
router = Router()


class NeuroFarmStates(StatesGroup):
    waiting_for_archive = State()


def public_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Чёрная клубная карта", callback_data="black_card")],
            [InlineKeyboardButton(text="Проверить доступ", callback_data="check_access")],
        ]
    )


def creator_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Нейро-Архив", callback_data="neuro_archive")],
            [InlineKeyboardButton(text="Проверить доступ", callback_data="check_access")],
        ]
    )


def processing_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Нарезать на 3 Shorts", callback_data="process_shorts")],
            [InlineKeyboardButton(text="Наложить музыку PINK NOIZE", callback_data="process_music")],
            [InlineKeyboardButton(text="Сделать субтитры", callback_data="process_subtitles")],
            [InlineKeyboardButton(text="Новый архив", callback_data="neuro_archive")],
        ]
    )


async def get_profile(telegram_user_id: int) -> dict[str, Any] | None:
    """Читает профиль в отдельном потоке: supabase-py API синхронный."""
    def query() -> dict[str, Any] | None:
        response = (
            supabase.table("profiles")
            .select("role, first_name, username, status")
            .eq("telegram_user_id", telegram_user_id)
            .maybe_single()
            .execute()
        )
        return response.data

    return await asyncio.to_thread(query)


async def is_creator(telegram_user_id: int) -> bool:
    profile = await get_profile(telegram_user_id)
    role = str((profile or {}).get("role", "")).strip().lower()
    return role in CREATOR_ROLES


async def send_access_menu(message: Message) -> None:
    if await is_creator(message.from_user.id):
        await message.answer(
            "Пульт Нейрофермы активен. Выберите канал управления.",
            reply_markup=creator_menu(),
        )
        return
    await message.answer(
        "Добро пожаловать в ТРИЗНЕС. Чёрная карта открывает вход в живой город и медиа-архив.",
        reply_markup=public_menu(),
    )


@router.message(CommandStart())
async def start_handler(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        "ТРИЗНЕС ONLINE\n\n"
        "Ты входишь в новую реальность. Здесь архив превращается в эфир, а идея — в движение.",
    )
    await send_access_menu(message)


@router.message(Command("menu"))
async def menu_handler(message: Message, state: FSMContext) -> None:
    await state.clear()
    await send_access_menu(message)


@router.callback_query(F.data == "black_card")
async def black_card_handler(callback: CallbackQuery) -> None:
    await callback.answer()
    await callback.message.answer(
        "Чёрная клубная карта — ключ в экосистему ТРИЗНЕС.\n"
        "Для подключения напиши администратору: @danielsassis_bot",
        reply_markup=public_menu(),
    )


@router.callback_query(F.data == "check_access")
async def check_access_handler(callback: CallbackQuery) -> None:
    await callback.answer("Проверяю доступ...")
    profile = await get_profile(callback.from_user.id)
    if profile and str(profile.get("role", "")).lower() in CREATOR_ROLES:
        await callback.message.answer("Доступ создателя подтверждён.", reply_markup=creator_menu())
    else:
        await callback.message.answer("Профиль найден, но доступ к пульту Нейрофермы пока закрыт.", reply_markup=public_menu())


@router.callback_query(F.data == "neuro_archive")
async def neuro_archive_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await callback.answer()
    if not await is_creator(callback.from_user.id):
        await callback.message.answer("Этот канал доступен только создателям ТРИЗНЕС.", reply_markup=public_menu())
        return
    await state.set_state(NeuroFarmStates.waiting_for_archive)
    await callback.message.answer(
        "Нейро-Архив открыт. Пришли ссылку на сырое видео, расшифровку или описание материала.\n\n"
        "После этого я соберу три монтажные концепции с таймкодами, хуками и субтитрами.\n"
        "Для отмены напиши /cancel."
    )


@router.message(Command("cancel"))
@router.message(NeuroFarmStates.waiting_for_archive, F.text.casefold() == "отмена")
async def cancel_archive_handler(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("Канал Нейро-Архива закрыт.", reply_markup=creator_menu() if await is_creator(message.from_user.id) else public_menu())


@router.message(NeuroFarmStates.waiting_for_archive, F.text)
async def archive_input_handler(message: Message, state: FSMContext) -> None:
    if not await is_creator(message.from_user.id):
        await state.clear()
        await message.answer("Доступ к Нейро-Архиву отозван.", reply_markup=public_menu())
        return

    material = message.text.strip()
    await state.update_data(archive_source=material)
    await message.answer("Материал принят. Нейросеть собирает монтажные траектории...")
    try:
        ideas = await generate_shorts_ideas(material)
    except Exception:
        logger.exception("Gemini generation failed for user %s", message.from_user.id)
        await message.answer("Ключи нейросети сейчас заняты. Попробуй повторить через минуту.", reply_markup=creator_menu())
        return

    await state.set_state(NeuroFarmStates.waiting_for_archive)
    await message.answer(ideas, reply_markup=processing_menu())


@router.callback_query(F.data.startswith("process_"))
async def processing_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await callback.answer()
    if not await is_creator(callback.from_user.id):
        await state.clear()
        await callback.message.answer("Доступ к пульту закрыт.", reply_markup=public_menu())
        return
    action_names = {
        "process_shorts": "нарезка на 3 Shorts",
        "process_music": "наложение музыки PINK NOIZE",
        "process_subtitles": "создание субтитров",
    }
    action = action_names.get(callback.data, "обработка")
    await callback.message.answer(
        f"Команда «{action}» принята. Следующий шаг — подключить worker медиа-обработки к этой кнопке.\n"
        "Материал сохранён в текущей FSM-сессии.",
        reply_markup=processing_menu(),
    )


async def main() -> None:
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dispatcher = Dispatcher()
    dispatcher.include_router(router)
    try:
        await dispatcher.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
