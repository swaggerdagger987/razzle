# War Room — Room Reference Map

Grid: 52 columns x 68 rows, 32px tiles = 1664x2176 world.
Engine: inline script in `frontend/pixel-lab.html` (NOT warroom.js).

```
┌─────────────────┬──────────────────┬─────────────────┐
│  A  Scout Room   │  B  Razzle's     │  C  Medical Bay  │
│  (Hawkeye)       │     Office       │  (Dr. Dolphin)   │
│  x:2 y:1 15x13  │  x:18 y:1 16x13 │  x:35 y:1 15x13 │
├────┐        ┌────┼────┐        ┌───┼────┐        ┌───┤
     │ corr   │         │ corr   │        │ corr   │
     │ x:8    │         │ x:24   │        │ x:41   │
     │ 3x7    │         │ 3x7    │        │ 3x7    │
├────┴────────┴────┴────┴────────┴───┴────┴────────┴───┤
│                                                       │
│              D   SITUATION ROOM                       │
│              x:1  y:21  50x28                         │
│              (all agents visit, war table center)      │
│                                                       │
├────┐        ┌────┬────┐        ┌───┬────┐        ┌───┤
     │ corr   │         │ corr   │        │ corr   │
     │ x:8    │         │ x:24   │        │ x:41   │
     │ 3x7    │         │ 3x7    │        │ 3x7    │
├────┘        └────┼────┘        └───┼────┘        └───┤
│  E  Diplomat     │  F  Quant Room  │  G  Historian    │
│  (The Fox/Bones) │  (The Octopus)  │  (Atlas)         │
│  x:2 y:56 15x13 │  x:18 y:56 16x13│  x:35 y:56 15x13│
└─────────────────┴──────────────────┴─────────────────┘
```

Lateral doorways: A<->B (x:17 y:6), B<->C (x:34 y:6), E<->F (x:17 y:61), F<->G (x:34 y:61)

## Room Key

| Room | Name             | Agent        | Tile Origin    | Size   | Palette Key  |
|------|------------------|--------------|----------------|--------|--------------|
| A    | Scout Room       | Hawkeye      | x:2, y:1       | 15x13  | scout        |
| B    | Razzle's Office  | Razzle       | x:18, y:1      | 16x13  | razzle       |
| C    | Medical Bay      | Dr. Dolphin  | x:35, y:1      | 15x13  | medical      |
| D    | Situation Room   | (all)        | x:1, y:21      | 50x28  | situation    |
| E    | Diplomat Room    | The Fox      | x:2, y:56      | 15x13  | diplomat     |
| F    | Quant Room       | The Octopus  | x:18, y:56     | 16x13  | quant        |
| G    | Historian Room   | Atlas        | x:35, y:56     | 15x13  | historian    |

## Default View

Camera starts framed on Room D (Situation Room) with auto-zoom to fit.
