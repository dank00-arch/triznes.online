"""
TELEGRAM REALTIME BRIDGE (AIOGRAM 3.x)
Шлюз связи живых игроков Сочи и нейроассистентов (Триснас / Аполлон) с 3D-картой.
"""
import os
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from supabase import create_client, Client
from neuro_assistants_router import NeuroCoreRouter

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "your-telegram-bot-token")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
core_router = NeuroCoreRouter(supabase)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(F.location)
async def handle_live_location(message: types.Message):
    """
    Когда реальный персонаж в Сочи отправляет геопозицию в Telegram,
    его 3D-голограмма мгновенно перемещается на карте Двух Миров.
    """
    lat = message.location.latitude
    lng = message.location.longitude
    handle = message.from_user.username or f"resident_{message.from_user.id}"
    full_name = message.from_user.full_name

    core_router.move_character_on_sochi_map(
        handle=handle,
        display_name=full_name,
        lat=lat,
        lng=lng,
        status_text="Чекин в реальном Сочи",
        world_mode="hybrid",
        xp_gain=100
    )
    await message.reply(
        f"⚡ [ЯДРО ТРИЗНЕС]: Координаты ({lat:.4f}, {lng:.4f}) синхронизированы с 3D-матрицей Сочи! +100 XP"
    )

@dp.message(Command("apollo_wave"))
async def trigger_apollo_wave(message: types.Message):
    """
    Команда вызова творческого импульса от Ассистента Аполлона.
    Зажигает портал SOCHIWOOD / ТЕАТР ТУЗ / PINK NOIZE на карте.
    """
    args = message.text.split(maxsplit=2)
    node_id = args[1] if len(args) > 1 else "sochiwood_morport"
    description = args[2] if len(args) > 2 else "Съемка вертикального эпизода и музыкальный джем PINK NOIZE!"

    core_router.emit_assistant_impulse(
        assistant_handle="apollo_muse",
        node_id=node_id,
        event_type="APOLLO_WAVE",
        title="Импульс Аполлона: Съемка и Резонанс",
        description=description,
        world_layer="hybrid",
        reward_xp=350
    )
    await message.reply(f"🔥 [АПОЛЛОН]: Творческая волна запущена в узле {node_id}! Маяк активирован на 3D-карте.")

@dp.message(Command("trisnas_quest"))
async def trigger_trisnas_quest(message: types.Message):
    """
    Команда системной директивы от Ассистента Триснаса.
    Создает квест в выбранном узле Сочи (Приморская, Навагинская, XPRO, Поляна).
    """
    args = message.text.split(maxsplit=2)
    node_id = args[1] if len(args) > 1 else "triznes_primorskaya"
    quest_text = args[2] if len(args) > 2 else "Синхронизация медиа-потока Нейрофермы и сбор команды в хабе."

    core_router.emit_assistant_impulse(
        assistant_handle="trisnas_core",
        node_id=node_id,
        event_type="TRISNAS_DIRECTIVE",
        title="Директива Триснаса: Системный Квест",
        description=quest_text,
        world_layer="cyber",
        reward_xp=500
    )
    await message.reply(f"💠 [ТРИСНАС]: Квест развернут в секторе {node_id}. Награда: 500 XP.")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
