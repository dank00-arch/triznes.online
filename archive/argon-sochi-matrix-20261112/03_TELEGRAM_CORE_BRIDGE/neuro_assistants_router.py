"""
МОДУЛЬ МАРШРУТИЗАЦИИ НЕЙРОЖИВЫХ АССИСТЕНТОВ ЯДРА (ТРИСНАС & АПОЛЛОН)
Предназначен для стыковки существующих Telegram-ассистентов в контуре Claude
с 3D-картой города Сочи в реальном времени.
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class NeuroCoreRouter:
    """
    Обрабатывает смысловые команды и события от двух главных ИИ-сущностей:
    - ТРИСНАС (trisnas_core): Системная матрица, уровни 1-13, квесты, Нейроферма, бизнес-узлы.
    - АПОЛЛОН (apollo_muse): Творчество, музыка PINK NOIZE, сцены ТЕАТР ТУЗ, кинопоток SOCHIWOOD.
    """

    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def emit_assistant_impulse(
        self,
        assistant_handle: str,
        node_id: str,
        event_type: str,
        title: str,
        description: str,
        media_url: Optional[str] = None,
        world_layer: str = "hybrid",
        reward_xp: int = 250
    ) -> Dict[str, Any]:
        """
        Отправляет живой импульс от Триснаса или Аполлона в конкретную точку Сочи.
        Мгновенно зажигает 3D-маяк на веб-карте через Supabase Realtime.
        """
        event_payload = {
            "initiator_handle": assistant_handle,
            "target_node_id": node_id,
            "event_type": event_type,
            "title": title,
            "description": description,
            "world_layer": world_layer,
            "media_url": media_url,
            "reward_xp": reward_xp,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = self.supabase.table("world_events").insert(event_payload).execute()

        # Одновременно активируем пульсацию самого гео-узла на карте Сочи
        self.supabase.table("sochi_nodes").update({
            "active_pulse": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", node_id).execute()

        return {"status": "impulse_sent", "data": res.data}

    def move_character_on_sochi_map(
        self,
        handle: str,
        display_name: str,
        lat: float,
        lng: float,
        status_text: str = "Активен в Сочи",
        world_mode: str = "hybrid",
        media_url: Optional[str] = None,
        xp_gain: int = 50
    ) -> Dict[str, Any]:
        """
        Перемещает аватар персонажа по реальным координатам Сочи и начисляет XP.
        """
        existing = self.supabase.table("characters").select("xp, level, is_ai_core").eq("handle", handle).execute()
        current_xp = existing.data[0]["xp"] if existing.data else 0
        new_xp = current_xp + xp_gain

        payload = {
            "handle": handle,
            "display_name": display_name,
            "lat": lat,
            "lng": lng,
            "xp": new_xp,
            "world_mode": world_mode,
            "status_text": status_text,
            "last_ping": datetime.now(timezone.utc).isoformat()
        }
        if media_url:
            payload["latest_media_url"] = media_url

        res = self.supabase.table("characters").upsert(payload, on_conflict="handle").execute()
        return {"status": "character_updated", "data": res.data}
