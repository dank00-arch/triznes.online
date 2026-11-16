"""Асинхронный сервис Gemini с ротацией API-ключей."""

from __future__ import annotations

import asyncio
import itertools
import os
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from dotenv import load_dotenv
from google import genai

load_dotenv()

T = TypeVar("T")
MODEL_NAME = "gemini-2.5-flash"
MAX_ATTEMPTS = 4


def _load_api_keys() -> list[str]:
    keys = [key.strip() for key in os.getenv("GEMINI_API_KEYS", "").split(",") if key.strip()]
    if not keys:
        raise RuntimeError("GEMINI_API_KEYS не задан: добавьте ключи через запятую в .env")
    return keys


_API_KEYS = _load_api_keys()
_KEY_CYCLE = itertools.cycle(_API_KEYS)
_CYCLE_LOCK = asyncio.Lock()


def _is_rate_limit_error(error: Exception) -> bool:
    """Распознаёт 429 независимо от версии google-genai и типа исключения."""
    status = getattr(error, "code", None) or getattr(error, "status_code", None)
    if status == 429 or str(status) == "429":
        return True
    message = str(error).lower()
    return "429" in message or "rate limit" in message or "resource exhausted" in message


async def _next_key() -> str:
    async with _CYCLE_LOCK:
        return next(_KEY_CYCLE)


async def _with_rotating_key(operation: Callable[[genai.Client], Awaitable[T]]) -> T:
    last_error: Exception | None = None
    for _ in range(min(MAX_ATTEMPTS, len(_API_KEYS))):
        key = await _next_key()
        client = genai.Client(api_key=key)
        try:
            return await operation(client)
        except Exception as error:  # google-genai exposes different error classes by version.
            last_error = error
            if not _is_rate_limit_error(error):
                raise
            await asyncio.sleep(0.25)
        finally:
            close = getattr(client, "close", None)
            if close:
                close()
    raise RuntimeError("Все ключи Gemini временно исчерпали лимит") from last_error


async def generate_shorts_ideas(text_or_transcript: str) -> str:
    """Возвращает три готовых сценария Shorts/Reels по тексту архива."""
    source = text_or_transcript.strip()
    if not source:
        raise ValueError("Нужна ссылка, расшифровка или описание архивного видео")
    if len(source) > 30_000:
        source = source[:30_000]

    prompt = f"""
Ты — AI-редактор медиа-экосистемы ТРИЗНЕС из Сочи.
Проанализируй материал ниже и предложи ровно 3 готовых сценария для Shorts/Reels/TikTok.
Стиль: кинематографичный, неоновый космо-панк, живой русский язык, без пустых клише.
Если дана только ссылка, не выдумывай факты о содержимом: предложи монтажную концепцию по ссылке.

Для каждого сценария укажи:
1. Название и цель ролика.
2. Таймкоды исходника и план монтажа на 20-60 секунд.
3. Хук для первых 3 секунд.
4. Текст субтитров по смысловым фразам.
5. Рекомендацию по музыке PINK NOIZE и финальный CTA.

Материал:
{source}
"""

    async def request(client: genai.Client) -> str:
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        text = getattr(response, "text", None)
        if not text:
            raise RuntimeError("Gemini вернул пустой ответ")
        return text.strip()

    return await _with_rotating_key(request)
