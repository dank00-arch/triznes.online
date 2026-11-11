# Креативная карта TRIZNES LIFE GAME

## Схема общего игрового мира

```mermaid
flowchart TD
  P[ЧЕЛОВЕК] --> I[ИДЕЯ]
  P --> D[МЕЧТА]
  I --> R[РОЛЬ]
  D --> R
  R --> A[ДЕЙСТВИЕ]
  A --> S[СЦЕНА]
  S --> M[МЕДИА / КОНТЕНТ]
  M --> C[СВЯЗИ]
  C --> T[ТРАНСФОРМАЦИЯ]
  T --> K[ОБЩЕЕ ЯДРО]

  subgraph GAME[Единый LIFE GAME ENGINE]
    CH[6 глав пути]
    Q[QUEST ENGINE]
    GS[Game State]
    CH <--> Q
    Q <--> GS
  end
  P --> CH
  A --> Q
  Q --> S

  subgraph WORLD[WORLD ENGINE]
    LOC[Реальные места]
    COM[Сообщества]
    EVT[События]
    ROUTE[Маршруты]
  end
  S --> LOC
  C --> COM
  Q --> EVT
  LOC --> ROUTE

  subgraph CINEMA[CINEMA + NEUROFARM]
    CAP[Захват медиа]
    QC[Проверка качества]
    EDIT[Монтаж / AI assist]
    ARCH[Архив]
    CAP --> QC --> EDIT --> ARCH
  end
  S --> CAP
  M --> ARCH

  subgraph REALITY[DIRTY PARADISE / REALITY ENGINE]
    CAM[WebRTC Camera]
    V2V[StreamDiffusionV2]
    AR[WebGL / WebXR AR]
    CHAT[Чат-команды]
    DIRECTOR[AI Director]
    CHAT --> DIRECTOR
    DIRECTOR --> AR
    DIRECTOR --> V2V
    CAM --> V2V
    CAM --> AR
  end
  LOC --> REALITY
  Q --> DIRECTOR
  REALITY --> CAP
```

## Путь новичка: максимум 7 шагов
1. ENTRY — человек сам выбирает начать.
2. APOLLON — короткий тёплый разговор.
3. Идея и мечта — фиксируются словами участника.
4. CHARACTER — создаётся личный профиль; незаполненное остаётся пустым.
5. Роль — выбирается на пробную сцену, без закрепления навсегда.
6. Первый квест — предлагается DIONYSUS; участник принимает/пропускает.
7. Первая сцена — результат возвращается в общую хронику по согласию.

## Объекты графа BOARDS
PERSON, IDEA, DREAM, ROLE, PLACE, COMMUNITY, EVENT, QUEST, SCENE, VIDEO, PHOTO, AUDIO, MUSIC, GENERATION, ACTION, LINK, ARTIFACT.
Связи: вдохновляет, мечтает_о, выбирает_роль, действует_в, снимается_в, создаёт, встречает, соединяет, подтверждает, входит_в_архив.
