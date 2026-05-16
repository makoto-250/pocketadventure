# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

No build step — open `index.html` directly in a browser. No package manager, no transpilation, no test suite.

Syntax-check JS files with Node:
```
node --check js/data.js
node --check js/app.js
node --check js/battle.js
```

## Architecture

Single-page browser RPG. Three JS files loaded in order via `<script>` tags in `index.html`:

```
data.js  →  app.js  →  battle.js
```

Each file depends on globals from the files before it.

### `js/data.js`
All static game data in one `GameData` object: `playerDefault`, `dungeons`, `enemies`, `skills`, `recipes`, `materials`.

Also contains the `Save` object (localStorage key `pocketAdventure_save`) and `getLvUpCost(lv)`.

**Key constraint:** `GameData.dungeons[].unlocked` is in-memory only — it is not persisted. On every load, `App._applyDungeonUnlocks()` must re-apply the flag from the saved `clearedDungeons` array. Any dungeon unlock must go through `App.state.clearedDungeons`.

#### Dungeon data
Each dungeon has `bgColor` set to `url('images/danjon_N.png') center/cover no-repeat` — used as background in both the dungeon card banner and the battle screen. `icon` is an empty string for all dungeons (image-only banners).

#### Recipe ranks
`recipes` uses `rank: 1–7` for weapons/armor (auto-grouped in the smithing screen) and `rank: 0` for accessories (shown in a separate section). Each rank 2–7 requires one unique material (rare enemy or boss drop) plus common materials.

#### Skills
Skills start at level 0 (unlearned/unusable). `upgradeCosts[lv]` is used as the index — `upgradeCosts[0]` is the learn cost (lv 0→1), `upgradeCosts[1]` is the first upgrade (lv 1→2), etc.

#### LV up
`getLvUpCost(lv)` returns `lv * 100`. LV up is purchased with money in the training screen (no EXP system).

### `js/app.js`
Two concerns:

1. **`App`** — global state container and router.
   - `App.state = { player, clearedDungeons }` is the only thing saved to localStorage.
   - `App.navigateTo(screenId, direction)` replaces `#app` innerHTML with the result of `Screens[screenId]()`. Direction `null` skips the slide animation.

2. **`Screens`** — object of screen-builder functions (`title`, `adventure`, `smithing`, `equipment`, `training`, `achievements`, `settings`). Each returns a DOM element. `Screens.battle` is defined in `battle.js` and added to this object at runtime.

Helper functions below `Screens`: `calcEquipStats`, `canCraftRecipe`, `alreadyOwned`, `craftItem`, `equipItem`, `unequipItem`, `upgradeSkill`, `levelUp`, `recipeCard`, `skillCard`, `dungeonCard`, etc. These are global functions accessed by both `app.js` screens and `battle.js`.

#### Dungeon selection
`dungeonCard()` renders the card. Unlocked dungeons get class `dungeon-card-enter` and `data-dungeon` on the card `<div>` itself — the entire card is tappable (no inner button). Locked dungeons show a lock message only.

#### Dungeon unlock flow
1st clear: `nextRoom()` adds to `clearedDungeons`, unlocks next dungeon in `GameData.dungeons`, shows cleared screen.  
2nd+ clear: skips cleared screen, restores HP/MP, returns to adventure screen.

### `js/battle.js`
Owns all combat logic and extends `Screens` with `Screens.battle`.

**`Battle.state`** (in-memory, not saved between sessions):
```
{ dungeon, roomIndex, enemies[], phase, log[], actionMenu,
  gainedMoney, gainedDrops, lastDamage, lastHeal, showDamageAnim, autoMode }
```

**Phase flow:** `player` → (action chosen) → `result` → (next room) → loops back to `player`, or → `cleared` / `gameover`.

**Turn order (per action):** AGI is compared at action-selection time, not on room entry. If `enemy.agi > playerAgi`, enemy attacks first; if player kills enemy, no counter-attack fires. Enemy first-strike on room entry was intentionally removed.

**Multiple enemies per room:**
- 始まりの森: rooms 1–5 → 1 enemy, rooms 6–7 → 1–2 enemies, room 8 → boss (1)
- 石炭の洞窟: 1–2 enemies per room, boss room → 1
- 古代の遺跡: 1–3 enemies per room, boss room → 1
- Player normal attack and single-target skill always hit `enemies[0]` (leftmost).
- All-target skill loops through all `enemies[]`.
- Enemy turn: all living enemies attack the player.

**HP/MP restore:** On retreat, game over, dungeon clear — HP and MP are always fully restored before returning to title/adventure.

**`Battle.render()`** is the internal re-render used during combat (no slide animation). It also schedules the auto-attack timer and attaches the tap-to-cancel listener when `autoMode` is true.

**Auto mode:** `Battle.toggleAuto()` / `Battle.cancelAuto()`. Timer fires `playerAttack()` every 700 ms during `player` phase and `nextRoom()` every 900 ms during `result` phase. Cancelled on gameover, cleared, or any non-button screen tap.

### Images
Enemy sprites: `images/enemy_N.png` — referenced via `image` field on each enemy in `GameData.enemies`. Falls back to `icon` emoji if no image. Dungeon backgrounds: `images/danjon_N.png`. Title screen background: `images/top.png`. Logo: `images/logoname_1.png`.

### Data flow summary

```
GameData (static)
     ↓ read-only
App.state.player  ←→  localStorage  (Save.load / App.save)
     ↓
Battle.state  (ephemeral, lives for one dungeon run)
```

Equip stats are never stored on the player — `calcEquipStats(player)` computes them on the fly from `player.equip`.

### Adding content

- **New enemy:** add entry to `GameData.enemies`, reference its id in a dungeon's `enemies`/`boss`/`rareEnemy` field. Add `image: "images/enemy_N.png"` to use a sprite.
- **New recipe:** add to `GameData.recipes` with a `rank` (1–7) and `category` (`weapon`/`armor`/`accessory`). Rank 0 = accessory. The smithing screen auto-groups by rank.
- **New material:** add to `GameData.materials` with `rare: true/false`, add to `playerDefault.materials` with initial count `0`.
- **New dungeon background:** set `bgColor: "url('images/danjon_N.png') center/cover no-repeat"` on the dungeon entry in `GameData.dungeons`.
- **New screen:** add a builder function to `Screens` in `app.js`, then call `App.navigateTo("yourScreen")` to reach it.
