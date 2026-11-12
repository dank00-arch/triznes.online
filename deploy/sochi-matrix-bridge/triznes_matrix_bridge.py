"""TRIZNES · мост «проводники → 3D-карта Сочи». ЧЕРНОВИК, НЕ ЗАПУЩЕН.
Адаптация 03_TELEGRAM_CORE_BRIDGE из архива Аргона. Запуск — только по отдельному «да» оператора
и после применения supabase/drafts/20261112_sochi_matrix.sql.

Отличия от архива:
  * Нет отдельного бота и polling: функции вызываются из уже работающих ассистентов (АПОЛЛОН, BEZLIKI и др.).
  * «Триснас» = TRIZNES ASSISTANT. Роли — по канону: АПОЛЛОН только проводник состояния и вход для всех.
  * Нет приёма геопозиции из Telegram и начисления XP за чекин — это создавало бы второй профиль
    по username и транслировало бы живое местоположение людей. Персонажи и уровни — только из ядра.
  * Ключ service_role читается из окружения сервера, в клиент и в репозиторий не попадает.
"""
import os
from datetime import datetime, timedelta, timezone
from supabase import create_client  # supabase>=2.4

GUIDES = {"apollon", "triznes", "bezliki", "dionysus", "chivurundu", "lubik"}
KINDS = {"entry", "quest", "media", "scene", "route", "heart"}


def _client():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])


def emit_pulse(place_slug: str, guide: str, kind: str, title: str, level_no: int | None = None,
               public: bool = False, hours: int = 4) -> dict:
    """Зажечь импульс проводника над точкой мира. По умолчанию — внутренний (виден только в Пульте)."""
    if guide not in GUIDES or kind not in KINDS:
        raise ValueError("unknown guide/kind")
    row = {
        "place_slug": place_slug, "guide": guide, "kind": kind, "title": title[:140],
        "level_no": level_no, "visibility": "public" if public else "internal",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat(),
    }
    return _client().table("triznes_world_pulses").insert(row).execute().data[0]


# Примеры вызова из ассистентов:
#   emit_pulse("naberezhnaya-sochi", "apollon", "entry", "Вход открыт: ступень 00 «Улыбнись прохожему»", 0)
#   emit_pulse("navaginskaya", "bezliki", "route", "Маршрут ступени 7 «ГОРОД»", 7)
