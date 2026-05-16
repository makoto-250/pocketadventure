# CLAUDE.md

このファイルは、リポジトリのコードを扱う際に Claude Code (claude.ai/code) へ提供するガイダンスです。

## 開発

ビルド手順なし — `index.html` をブラウザで直接開くだけ。パッケージマネージャー・トランスパイル・テストスイートは不要。

JS ファイルの構文チェック:
```
node --check js/data.js
node --check js/app.js
node --check js/battle.js
```

## Git運用
- コードを変更・実装したら必ずgit add, commit, pushまで行うこと
- コミットメッセージは変更内容を簡潔に日本語で書くこと
- pushは`git push origin main`で行うこと

## アーキテクチャ

シングルページのブラウザ RPG。`index.html` の `<script>` タグで以下の順に読み込まれる JS ファイル 3 本構成:

```
data.js  →  app.js  →  battle.js
```

各ファイルは前のファイルのグローバル変数に依存している。

### `js/data.js`
静的なゲームデータをすべて `GameData` オブジェクト 1 つにまとめている: `playerDefault`、`dungeons`、`enemies`、`skills`、`recipes`、`materials`。

`Save` オブジェクト（localStorage キー: `pocketAdventure_save`）と `getLvUpCost(lv)` も含む。

**重要な制約:** `GameData.dungeons[].unlocked` はメモリ上のみ — 永続化されない。読み込みのたびに `App._applyDungeonUnlocks()` が保存済みの `clearedDungeons` 配列からフラグを再適用する必要がある。ダンジョン解放は必ず `App.state.clearedDungeons` を経由すること。

#### ダンジョンデータ
各ダンジョンの `bgColor` は `url('images/danjon_N.png') center/cover no-repeat` — ダンジョンカードのバナーとバトル画面の両方で背景として使用する。`icon` は全ダンジョンで空文字列（バナーは画像のみ）。

#### レシピランク
`recipes` は武器・防具に `rank: 1–7`（鍛冶画面で自動グループ化）、アクセサリーに `rank: 0`（別セクションに表示）を使用する。ランク 2–7 はそれぞれ固有素材（レアエネミーまたはボスドロップ）1 個 + 共通素材が必要。

#### スキル
スキルはレベル 0（未習得・使用不可）から始まる。`upgradeCosts[lv]` をインデックスとして使用 — `upgradeCosts[0]` が習得コスト（lv 0→1）、`upgradeCosts[1]` が最初の強化コスト（lv 1→2）、以降同様。

#### レベルアップ
`getLvUpCost(lv)` は `lv * 100` を返す。レベルアップは訓練画面でゴールドを消費して購入する（経験値システムなし）。

### `js/app.js`
2 つの責務を持つ:

1. **`App`** — グローバル状態コンテナ兼ルーター。
   - `App.state = { player, clearedDungeons }` のみ localStorage に保存される。
   - `App.navigateTo(screenId, direction)` は `#app` の innerHTML を `Screens[screenId]()` の結果で置き換える。`direction` が `null` の場合はスライドアニメーションをスキップ。

2. **`Screens`** — 画面ビルダー関数のオブジェクト（`title`、`adventure`、`smithing`、`equipment`、`training`、`achievements`、`settings`）。各関数は DOM 要素を返す。`Screens.battle` は `battle.js` で定義され、実行時にこのオブジェクトへ追加される。

`Screens` の下に定義されているヘルパー関数: `calcEquipStats`、`canCraftRecipe`、`alreadyOwned`、`craftItem`、`equipItem`、`unequipItem`、`upgradeSkill`、`levelUp`、`recipeCard`、`skillCard`、`dungeonCard` など。これらは `app.js` の画面と `battle.js` の両方からアクセスされるグローバル関数。

#### ダンジョン選択
`dungeonCard()` がカードをレンダリングする。解放済みダンジョンはカード `<div>` 自体に `dungeon-card-enter` クラスと `data-dungeon` が付く — カード全体がタップ可能（内部にボタンなし）。ロック中ダンジョンはロックメッセージのみ表示。

#### ダンジョン解放フロー
初回クリア: `nextRoom()` が `clearedDungeons` に追加し、`GameData.dungeons` の次のダンジョンを解放、クリア画面を表示。  
2 回目以降のクリア: クリア画面をスキップし、HP/MP を回復して冒険画面へ戻る。

### `js/battle.js`
戦闘ロジック全体を担い、`Screens.battle` として `Screens` を拡張する。

**`Battle.state`**（メモリ上のみ、セッション間で保存されない）:
```
{ dungeon, roomIndex, enemies[], phase, log[], actionMenu,
  gainedMoney, gainedDrops, lastDamage, lastHeal, showDamageAnim, autoMode }
```

**フェーズフロー:** `player` → （行動選択）→ `result` → （次の部屋へ）→ `player` に戻るループ、または → `cleared` / `gameover`。

**行動順（アクションごと）:** AGI の比較は部屋入場時ではなく行動選択時に行う。`enemy.agi > playerAgi` の場合は敵が先攻。プレイヤーが敵を倒した場合、反撃は発生しない。部屋入場時の敵先制攻撃は意図的に削除済み。

**1 部屋に複数の敵:**
- 始まりの森: 1〜5 部屋目 → 敵 1 体、6〜7 部屋目 → 1〜2 体、8 部屋目 → ボス（1 体）
- 石炭の洞窟: 各部屋 1〜2 体、ボス部屋 → 1 体
- 古代の遺跡: 各部屋 1〜3 体、ボス部屋 → 1 体
- プレイヤーの通常攻撃と単体スキルは常に `enemies[0]`（左端）にヒット。
- 全体スキルは `enemies[]` 全体をループ処理。
- 敵のターン: 生存している全敵がプレイヤーを攻撃。

**HP/MP 回復:** 退却・ゲームオーバー・ダンジョンクリア時 — タイトル・冒険画面に戻る前に HP と MP を必ず全回復する（装備ボーナス込みの実効最大値まで）。

**`Battle.render()`** は戦闘中に使用する内部再レンダリング（スライドアニメーションなし）。`autoMode` が true の場合、オート攻撃タイマーのスケジュールとタップキャンセルリスナーのアタッチも行う。

**オートモード:** `Battle.toggleAuto()` / `Battle.cancelAuto()`。`player` フェーズ中は 700 ms ごとに `playerAttack()` を、`result` フェーズ中は 900 ms ごとに `nextRoom()` を実行。ゲームオーバー・クリア・ボタン以外の画面タップでキャンセル。

### 画像
敵スプライト: `images/enemy_N.png` — `GameData.enemies` の各敵の `image` フィールドで参照。画像がない場合は `icon` の絵文字にフォールバック。ダンジョン背景: `images/danjon_N.png`。タイトル画面背景: `images/top.png`。ロゴ: `images/logoname_1.png`。

### データフロー概要

```
GameData (静的)
     ↓ 読み取り専用
App.state.player  ←→  localStorage  (Save.load / App.save)
     ↓
Battle.state  (一時的、1 ダンジョン実行中のみ存在)
```

装備ステータスはプレイヤーに保存されない — `calcEquipStats(player)` が `player.equip` から毎回計算する。

### コンテンツの追加

- **新しい敵:** `GameData.enemies` にエントリを追加し、ダンジョンの `enemies`/`boss`/`rareEnemy` フィールドでその id を参照する。スプライトを使う場合は `image: "images/enemy_N.png"` を追加。
- **新しいレシピ:** `GameData.recipes` に `rank`（1〜7）と `category`（`weapon`/`armor`/`accessory`）を指定して追加。ランク 0 = アクセサリー。鍛冶画面はランクで自動グループ化する。
- **新しい素材:** `GameData.materials` に `rare: true/false` を指定して追加し、`playerDefault.materials` に初期値 `0` で追加する。
- **新しいダンジョン背景:** `GameData.dungeons` のダンジョンエントリに `bgColor: "url('images/danjon_N.png') center/cover no-repeat"` を設定する。
- **新しい画面:** `app.js` の `Screens` にビルダー関数を追加し、`App.navigateTo("yourScreen")` で遷移する。
