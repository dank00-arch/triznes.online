# GAME EVENT CONTRACT v0.1

Все интерфейсы и AI-компоненты обмениваются типизированными событиями. Модель не может выдавать исполняемый JavaScript, SQL, произвольный URL или прямую команду изменения БД.

## Общая оболочка
```json
{
  "event_id": "uuid",
  "event_type": "ar.spawn",
  "schema_version": "0.1",
  "actor_id": "authenticated-player-id",
  "universe_id": "dirty-paradise-sochi",
  "scene_id": "sochi-navaginskaya",
  "created_at": "ISO-8601",
  "source": "chat|quest|director|system",
  "requires_confirmation": false,
  "payload": {
    "asset_key": "bioluminescent_garden",
    "visual_mode": "cyber_night",
    "animation": "organic_growth",
    "duration_seconds": 20
  }
}
```

## Разрешённые event_type v0.1
- game.quest.accept / game.quest.skip / game.quest.complete
- game.scene.enter / game.scene.exit
- ar.spawn / ar.update / ar.remove
- video.style.propose / video.style.apply / video.style.reset
- character.role.select
- media.capture.started / media.capture.completed
- media.review.requested

## Пример AR spawn
```json
{
  "event_type": "ar.spawn",
  "schema_version": "0.1",
  "payload": {
    "asset_key": "holographic_glyph",
    "anchor": {"type": "screen_space", "x": 0.5, "y": 0.4},
    "visual_mode": "cyber_night",
    "duration_seconds": 15
  }
}
```

## Валидация и права
- actor_id берётся из auth/session, не из текста LLM.
- asset_key — только из серверного allowlist.
- anchor ограничен поддерживаемыми типами; world anchor требует подтверждённых координат/pose.
- duration_seconds ограничивается диапазоном 1–120.
- неизвестные поля/типы отклоняются.
- event_id обеспечивает идемпотентность.
- команды, затрагивающие других людей, постоянное состояние, публикацию или геоданные, требуют подтверждения.
- RLS и серверные permissions остаются источником истины; клиент не может обходить их.
- AI не меняет баланс, карту доступа, главу или профиль напрямую.
- Все отклонённые и применённые события журналируются без лишних персональных данных.

## Статус
Контракт — проектная спецификация. Перед внедрением нужно сопоставить с реальными Supabase таблицами/functions, действующей auth-моделью и RLS; не создавать production migrations на основании этого файла без аудита.
