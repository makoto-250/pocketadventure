// ===== Battle System =====

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Battle = {
  state: null,
  _autoTimer: null,

  start(dungeonId) {
    const dungeon = GameData.dungeons.find(d => d.id === dungeonId);
    if (!dungeon || !dungeon.unlocked) return;
    this.state = {
      dungeon,
      roomIndex: 0,
      enemies: [],
      phase: "player",
      log: [],
      actionMenu: "main",
      playerFirst: true,
      gainedMoney: 0,
      gainedDrops: [],
      lastDamage: 0,
      lastDamages: [],
      multiHit: false,
      lastHeal: 0,
      showDamageAnim: false,
      autoMode: false,
    };
    this.loadRoom();
    App.navigateTo("battle");
  },

  loadRoom() {
    const s = this.state;
    const dungeon = s.dungeon;
    const isLastRoom = s.roomIndex === dungeon.rooms - 1;

    if (isLastRoom) {
      const base = GameData.enemies[dungeon.boss];
      s.enemies = [{ ...base, hpMax: base.hp, currentHp: base.hp }];
    } else {
      // ダンジョン・部屋番号で最大敵数を決定
      let maxCount;
      if (dungeon.id === "forest") {
        maxCount = s.roomIndex < 5 ? 1 : 2;
      } else if (dungeon.id === "cave") {
        maxCount = 2;
      } else {
        maxCount = 3;
      }
      const count = randInt(1, maxCount);
      s.enemies = [];
      for (let i = 0; i < count; i++) {
        const isRare = i === 0 && Math.random() < 0.1 && dungeon.rareEnemy;
        const enemyId = isRare
          ? dungeon.rareEnemy
          : dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
        const base = GameData.enemies[enemyId];
        s.enemies.push({ ...base, hpMax: base.hp, currentHp: base.hp });
      }
    }
    s.gainedMoney = 0;
    s.gainedDrops = [];
    s.actionMenu = "main";
    s.lastDamage = 0;
    s.lastHeal = 0;
    s.showDamageAnim = false;
    s.log = [];

    const pAgi = App.player.agi + calcEquipStats(App.player).agi;
    const eAgi = s.enemies[0].agi;
    s.playerFirst =
      pAgi > eAgi ? true : pAgi < eAgi ? false : Math.random() < 0.5;

    if (s.enemies.length === 1) {
      this.addLog(`${s.enemies[0].name}が現れた！`);
    } else {
      this.addLog(`${s.enemies.map(e => e.name).join("、")}が現れた！`);
    }
    s.phase = "player";
  },

  addLog(msg) {
    this.state.log.unshift(msg);
    if (this.state.log.length > 3) this.state.log.pop();
  },

  // Applies enemy attacks to player without re-rendering
  _setGameOver() {
    this.state.phase = "gameover";
    App.playSe("dead.wav");
  },

  _doEnemyAttack() {
    const s = this.state;
    const p = App.player;
    const pDef = p.def + calcEquipStats(p).def;
    for (const enemy of s.enemies) {
      if (enemy.currentHp <= 0) continue;
      const dmg = Math.max(1, Math.floor(enemy.str - pDef));
      p.hp = Math.max(0, p.hp - dmg);
      this.addLog(`${enemy.name}の攻撃！${dmg} のダメージを受けた`);
    }
  },

  enemyTurn() {
    const s = this.state;
    this._doEnemyAttack();
    if (App.player.hp <= 0 && !this._tryRevive()) {
      this._setGameOver();
    } else {
      s.phase = "player";
    }
    App.save();
    this.render();
  },

  playerAttack() {
    const s = this.state;
    s.lastDamage = 0;
    s.lastDamages = [];
    s.multiHit = false;
    s.lastHeal = 0;
    App.playSe("swordslash.ogg");
    const p = App.player;
    const enemy = s.enemies[0];
    const pStr = p.str + calcEquipStats(p).str;
    const pAgi = p.agi + calcEquipStats(p).agi;
    const enemyFirst = enemy.agi > pAgi || (enemy.agi === pAgi && Math.random() < 0.5);

    // 敵が先制：先に攻撃してから自分が行動
    if (enemyFirst) {
      this.addLog(`${enemy.name}の先制！`);
      this._doEnemyAttack();
      if (p.hp <= 0 && !this._tryRevive()) {
        this._setGameOver();
        App.save();
        this.render();
        return;
      }
    }

    // プレイヤー攻撃
    const dmg = Math.max(1, Math.floor(pStr - enemy.def));
    enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
    s.lastDamage = dmg;
    s.showDamageAnim = true;
    this.addLog(`${enemy.name}に ${dmg} のダメージ！`);

    // 倒したら終了（敵の反撃なし）
    if (this._checkEnemyDead()) return;

    s.actionMenu = "main";
    if (enemyFirst) {
      // 敵はもう行動済み → 再描画のみ
      s.phase = "player";
      App.save();
      this.render();
    } else {
      // 自分が先行 → 敵の反撃
      this.enemyTurn();
    }
  },

  playerSkill(skillId) {
    const s = this.state;
    s.lastDamage = 0;
    s.lastDamages = [];
    s.multiHit = false;
    s.lastHeal = 0;
    const p = App.player;
    const sk = GameData.skills[skillId];
    const lv = p.skills[skillId] || 1;
    const pStr = p.str + calcEquipStats(p).str;
    const pAgi = p.agi + calcEquipStats(p).agi;
    const frontEnemy = s.enemies[0];
    const enemyFirst = frontEnemy && (frontEnemy.agi > pAgi || (frontEnemy.agi === pAgi && Math.random() < 0.5));

    if (p.mp < sk.mpCost) return;
    p.mp -= sk.mpCost;

    const skillSeMap = { singleAttack: "swordslash_2", multiAttack: "swordslash_3", powerSlash: "swordslash_4", airEdge: "swordslash_5", lastStrike: "swordslash_6" };
    if (skillSeMap[skillId]) {
      App.playSe(skillSeMap[skillId] + ".wav");
      if (skillId === "multiAttack") setTimeout(() => App.playSe("swordslash_3.wav"), 100);
    }

    // 覚悟の一撃は内部で敵先制を処理するのでここではスキップ
    if (sk.type !== "attack_last" && enemyFirst) {
      this.addLog(`${frontEnemy.name}の先制！`);
      this._doEnemyAttack();
      if (p.hp <= 0 && !this._tryRevive()) {
        this._setGameOver();
        App.save();
        this.render();
        return;
      }
    }

    // プレイヤースキル発動
    let enemyDied = false;
    if (sk.type === "attack_last") {
      // 必ずAGI関係なく敵が先に攻撃してからプレイヤーが攻撃
      this.addLog(`${frontEnemy.name}の攻撃！`);
      this._doEnemyAttack();
      if (p.hp <= 0 && !this._tryRevive()) {
        this._setGameOver();
        App.save();
        this.render();
        return;
      }
      const target = s.enemies[0];
      const mult = sk.multiplier + (lv - 1) * 0.2;
      const dmg = Math.max(1, Math.floor(pStr * mult - target.def));
      target.currentHp = Math.max(0, target.currentHp - dmg);
      s.lastDamage = dmg;
      s.showDamageAnim = true;
      this.addLog(`${sk.name}！${target.name}に ${dmg} のダメージ！`);
      if (this._checkEnemyDead()) return;
      s.actionMenu = "main";
      s.phase = "player";
      App.save();
      this.render();
      return;
    } else if (sk.type === "attack_single") {
      const target = s.enemies[0];
      const mult = sk.multiplier + (lv - 1) * (sk.multiplierPerLv || 0.1);
      const dmg = Math.max(1, Math.floor(pStr * mult - target.def));
      target.currentHp = Math.max(0, target.currentHp - dmg);
      s.lastDamage = dmg;
      s.showDamageAnim = true;
      this.addLog(`${sk.name}！${target.name}に ${dmg} のダメージ！`);
      if (this._checkEnemyDead()) return;
    } else if (sk.type === "attack_all") {
      const mult = sk.multiplier + (lv - 1) * (sk.multiplierPerLv || 0.05);
      let totalDmg = 0;
      s.lastDamages = [];
      for (const e of s.enemies) {
        const dmg = Math.max(1, Math.floor(pStr * mult - e.def));
        e.currentHp = Math.max(0, e.currentHp - dmg);
        totalDmg += dmg;
        s.lastDamages.push(dmg);
      }
      s.lastDamage = totalDmg;
      s.multiHit = true;
      s.showDamageAnim = true;
      this.addLog(`${sk.name}！全体に ${totalDmg} のダメージ！`);
      if (this._checkEnemyDead()) return;
    } else if (sk.type === "heal") {
      const _effHp = p.hpMax + calcEquipStats(p).hp;
      const healAmt = sk.healPct
        ? Math.floor(_effHp * (sk.healPct + (lv - 1) * sk.healPctPerLv))
        : sk.healBase + (lv - 1) * sk.healPerLevel;
      const actual = Math.min(_effHp - p.hp, healAmt);
      p.hp += actual;
      s.lastHeal = actual;
      s.showDamageAnim = true;
      this.addLog(`${sk.name}！HPが ${actual} 回復した！`);
      App.playSe(skillId === "healingSpring" ? "heal_2.wav" : "heal_1.wav");
    }

    s.actionMenu = "main";
    if (enemyFirst) {
      // 敵はもう行動済み → 再描画のみ
      s.phase = "player";
      App.save();
      this.render();
    } else {
      // 自分が先行 → 敵の反撃
      this.enemyTurn();
    }
  },

  _checkEnemyDead() {
    const s = this.state;
    const dead = s.enemies.filter(e => e.currentHp <= 0);
    s.enemies = s.enemies.filter(e => e.currentHp > 0);

    if (dead.length === 0) return false;

    App.playSe("e_dead.wav");

    if (s.enemies.length > 0) {
      s.lastDamage = 0;
      s.lastDamages = [];
      s.showDamageAnim = false;
    }

    for (const e of dead) {
      const mon = Array.isArray(e.money)
        ? randInt(e.money[0], e.money[1])
        : e.money || 0;
      s.gainedMoney += mon;
      if (e.drops) {
        for (const drop of e.drops) {
          if (Math.random() < drop.rate) {
            const qty = Array.isArray(drop.qty)
              ? randInt(drop.qty[0], drop.qty[1])
              : drop.qty;
            s.gainedDrops.push({ id: drop.id, qty });
          }
        }
      }
    }

    if (s.enemies.length === 0) {
      // Apply rewards immediately for display
      this._applyRewards();
      s.phase = "result";
      App.playSe(s.roomIndex + 1 < s.dungeon.rooms ? "result.flac" : "result_2.wav");
      this.render();
      return true;
    }
    return false;
  },

  _applyRewards() {
    const s = this.state;
    const p = App.player;
    p.money += s.gainedMoney;
    for (const drop of s.gainedDrops) {
      p.materials[drop.id] = (p.materials[drop.id] || 0) + drop.qty;
    }
    App.save();
  },

  nextRoom() {
    const s = this.state;
    s.roomIndex++;

    if (s.roomIndex >= s.dungeon.rooms) {
      const firstClear = !App.state.clearedDungeons.includes(s.dungeon.id);
      if (firstClear) {
        App.state.clearedDungeons.push(s.dungeon.id);
        const idx = GameData.dungeons.findIndex(d => d.id === s.dungeon.id);
        if (idx >= 0 && idx + 1 < GameData.dungeons.length) {
          GameData.dungeons[idx + 1].unlocked = true;
        }
        const achId = `dungeon_${s.dungeon.id}`;
        if (!App.state.achievements.includes(achId)) {
          App.state.achievements.push(achId);
          setTimeout(() => showAchievementPopup(`${s.dungeon.name} クリア`), 600);
        }
        App.save();
        s.phase = "cleared";
        this.render();
      } else {
        // 2回目以降はそのまま冒険画面へ
        const p = App.player;
        p.hp = p.hpMax + calcEquipStats(p).hp;
        p.mp = p.mpMax + calcEquipStats(p).mp;
        App.save();
        App.navigateTo("adventure", "left");
      }
      return;
    }

    this.loadRoom();
    this.render();
  },

  toggleAuto() {
    const s = this.state;
    s.autoMode = !s.autoMode;
    if (!s.autoMode) {
      clearTimeout(this._autoTimer);
      this._autoTimer = null;
    }
    this.render();
  },

  _tryRevive() {
    const p = App.player;
    if ((p.items.phoenixFeather || 0) <= 0) return false;
    p.items.phoenixFeather--;
    p.hp = Math.max(1, Math.floor((p.hpMax + calcEquipStats(p).hp) * 0.30));
    this.addLog("🪶 鳳凰の羽が発動！HP30%で復活！");
    App.playSe("item_3.wav");
    App.save();
    return true;
  },

  useItem(itemId) {
    const s = this.state;
    const p = App.player;
    if (!p.items[itemId] || p.items[itemId] <= 0) return;
    const rec = GameData.alchemy.find(r => r.id === itemId);
    if (!rec) return;

    p.items[itemId]--;
    const itemSeMap = { potion: "item_1.wav", mpPotion: "item_2.mp3", phoenixFeather: "item_3.wav" };
    if (itemSeMap[itemId]) App.playSe(itemSeMap[itemId]);
    s.lastDamage = 0;
    s.lastDamages = [];
    s.multiHit = false;
    s.lastHeal = 0;

    if (rec.effect.type === "hp") {
      const _effHp = p.hpMax + calcEquipStats(p).hp;
      const heal = Math.floor(_effHp * rec.effect.pct);
      const actual = Math.min(_effHp - p.hp, heal);
      p.hp += actual;
      s.lastHeal = actual;
      s.showDamageAnim = true;
      this.addLog(`${rec.name}を使った！HPが ${actual} 回復！`);
    } else if (rec.effect.type === "mp") {
      const _effMp = p.mpMax + calcEquipStats(p).mp;
      const restore = Math.floor(_effMp * rec.effect.pct);
      const actual = Math.min(_effMp - p.mp, restore);
      p.mp += actual;
      this.addLog(`${rec.name}を使った！MPが ${actual} 回復！`);
    }

    s.actionMenu = "main";
    App.save();
    this.enemyTurn();
  },

  cancelAuto() {
    if (!this.state || !this.state.autoMode) return;
    this.state.autoMode = false;
    clearTimeout(this._autoTimer);
    this._autoTimer = null;
    this.render();
  },

  retreat() {
    this.cancelAuto();
    const p = App.player;
    p.hp = p.hpMax + calcEquipStats(p).hp;
    p.mp = p.mpMax + calcEquipStats(p).mp;
    App.save();
    App.navigateTo("adventure", "left");
  },

  render() {
    // 前のオートタイマーをクリア
    clearTimeout(this._autoTimer);
    this._autoTimer = null;

    const app = document.getElementById("app");
    const screen = Screens.battle();
    app.innerHTML = "";
    app.appendChild(screen);

    // アニメーション
    if (this.state && this.state.showDamageAnim) {
      this.state.showDamageAnim = false;
      requestAnimationFrame(() => {
        document.querySelectorAll(".damage-popup").forEach(el => el.classList.add("show"));
        if (this.state.lastDamage > 0) {
          const hitTargets = this.state.multiHit
            ? document.querySelectorAll(".enemy-sprite, .enemy-img")
            : [document.querySelector(".enemy-sprite, .enemy-img")].filter(Boolean);
          hitTargets.forEach(el => {
            el.classList.add("hit");
            setTimeout(() => el.classList.remove("hit"), 400);
          });
        }
        const healPopup = document.querySelector("#player-heal-popup");
        if (healPopup) healPopup.classList.add("show");
      });
    }

    // オートモード処理
    if (this.state && this.state.autoMode) {
      const phase = this.state.phase;
      if (phase === "player") {
        this._autoTimer = setTimeout(() => {
          if (this.state && this.state.autoMode) Battle.playerAttack();
        }, 700);
      } else if (phase === "result") {
        this._autoTimer = setTimeout(() => {
          if (this.state && this.state.autoMode) Battle.nextRoom();
        }, 900);
      }

      // 画面タップで解除（ボタン以外）
      screen.addEventListener("click", (e) => {
        if (!e.target.closest("button")) Battle.cancelAuto();
      }, { capture: true, once: true });
    }
  },
};

// ===== Battle Screen Builder =====

Screens.battle = function () {
  const s = Battle.state;
  const p = App.player;
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-battle";

  if (!s) return el;

  if (s.phase === "result") {
    el.innerHTML = _buildResult(s, p);
    el.querySelector("#btn-next")?.addEventListener("click", () => Battle.nextRoom());
    el.addEventListener("click", e => {
      if (Battle.state && Battle.state.phase === "result" && !e.target.closest("#btn-next")) Battle.nextRoom();
    });
    return el;
  }

  if (s.phase === "gameover") {
    s.autoMode = false;
    clearTimeout(Battle._autoTimer);
    el.innerHTML = _buildGameover();
    el.querySelector("#btn-gameover-title").addEventListener("click", () => {
      p.hp = p.hpMax + calcEquipStats(p).hp;
      p.mp = p.mpMax + calcEquipStats(p).mp;
      App.save();
      App.navigateTo("title", "left");
    });
    return el;
  }

  if (s.phase === "cleared") {
    s.autoMode = false;
    clearTimeout(Battle._autoTimer);
    el.innerHTML = _buildCleared(s);
    el.querySelector("#btn-cleared-title").addEventListener("click", () => {
      p.hp = p.hpMax + calcEquipStats(p).hp;
      p.mp = p.mpMax + calcEquipStats(p).mp;
      App.save();
      App.navigateTo("title", "left");
    }
    );
    return el;
  }

  // ---- Normal battle ----
  const _eq = calcEquipStats(p);
  const effHpMax = p.hpMax + _eq.hp;
  const effMpMax = p.mpMax + _eq.mp;
  const hpPct = Math.round((p.hp / effHpMax) * 100);
  const mpPct = Math.round((p.mp / effMpMax) * 100);
  const roomNum = s.roomIndex + 1;

  el.innerHTML = `
    <div class="dungeon-bg" style="background:${s.dungeon.bgColor}"></div>
    <div class="dungeon-bg-overlay"></div>

    <div class="battle-header">
      <button class="btn btn-back" id="btn-retreat">撤退</button>
      <div class="battle-dungeon-name">${s.dungeon.name}</div>
      <div class="battle-counter">${roomNum} / ${s.dungeon.rooms}</div>
    </div>

    <div class="battle-enemy-area">
      ${_buildEnemiesArea(s.enemies, s.lastDamage, s.lastDamages, s.multiHit)}
    </div>

    <div class="battle-log">
      ${s.log.map(l => `<div class="log-line">▶ ${l}</div>`).join("")}
    </div>

    <div class="battle-player-status">
      ${s.lastHeal > 0 ? `<div class="player-heal-popup" id="player-heal-popup">+ ${s.lastHeal}</div>` : ""}
      <div class="gauge-row">
        <span class="gauge-label">HP</span>
        <div class="gauge-bar"><div class="gauge-fill hp" style="width:${hpPct}%"></div></div>
        <span class="gauge-val">${p.hp} / ${effHpMax}</span>
      </div>
      <div class="gauge-row">
        <span class="gauge-label">MP</span>
        <div class="gauge-bar"><div class="gauge-fill mp" style="width:${mpPct}%"></div></div>
        <span class="gauge-val">${p.mp} / ${effMpMax}</span>
      </div>
    </div>

    <div class="battle-actions" id="battle-actions">
      ${_buildActionMenu(s, p)}
    </div>
  `;

  // --- Wire events ---
  el.querySelector("#btn-retreat").addEventListener("click", () => Battle.retreat());
  el.querySelector("#btn-attack")?.addEventListener("click", () => Battle.playerAttack());
  el.querySelector("#btn-open-skill")?.addEventListener("click", () => {
    s.actionMenu = "skill";
    Battle.render();
  });
  el.querySelector("#btn-open-item")?.addEventListener("click", () => {
    s.actionMenu = "item";
    Battle.render();
  });
  el.querySelector("#btn-action-back")?.addEventListener("click", () => {
    s.actionMenu = "main";
    Battle.render();
  });
  el.querySelectorAll(".skill-use-btn").forEach(btn => {
    btn.addEventListener("click", () => Battle.playerSkill(btn.dataset.skill));
  });
  el.querySelectorAll(".item-use-btn").forEach(btn => {
    btn.addEventListener("click", () => Battle.useItem(btn.dataset.item));
  });
  el.querySelector("#btn-auto")?.addEventListener("click", () => Battle.toggleAuto());

  return el;
};

// ---- Sub-builders ----

function _buildEnemiesArea(enemies, lastDmg, lastDamages, multiHit) {
  const count = enemies.length;
  const rowClass = `enemies-row enemies-${count}`;
  return `
    <div class="${rowClass}">
      ${enemies.map((e, i) => {
        const dmg = multiHit ? (lastDamages[i] || 0) : (i === 0 ? lastDmg : 0);
        return _buildOneEnemy(e, dmg, count);
      }).join("")}
    </div>
  `;
}

function _buildOneEnemy(enemy, lastDmg, total) {
  const hpPct = Math.round((enemy.currentHp / enemy.hpMax) * 100);
  const hpColor = hpPct > 50 ? "var(--green)" : hpPct > 25 ? "#e8a020" : "var(--red)";

  const badges = [
    enemy.isBoss ? `<span class="badge boss-badge">BOSS</span>` : "",
    enemy.isRare ? `<span class="badge rare-badge">★ レア</span>` : "",
  ].join("");

  const spriteHtml = enemy.image
    ? `<img class="enemy-sprite enemy-img" src="${enemy.image}" alt="${enemy.name}">`
    : `<div class="enemy-sprite">${enemy.icon}</div>`;

  return `
    <div class="enemy-slot ${enemy.isBoss ? "is-boss" : ""} ${enemy.isRare ? "is-rare" : ""} enemy-${enemy.id}">
      ${lastDmg > 0 ? `<div class="damage-popup">${-lastDmg}</div>` : ""}
      ${spriteHtml}
      <div class="enemy-name-row">${badges}${enemy.name}</div>
      <div class="enemy-hp-wrap">
        <span class="enemy-hp-text">${enemy.currentHp} / ${enemy.hpMax}</span>
        <div class="enemy-hp-bar">
          <div class="enemy-hp-fill" style="width:${hpPct}%;background:${hpColor}"></div>
        </div>
      </div>
    </div>
  `;
}

function _buildActionMenu(s, p) {
  if (s.autoMode) {
    return `
      <div class="action-auto-active">
        <div class="auto-indicator"><img src="images/b_botan_4.png" class="auto-icon-img"> オート攻撃中</div>
        <div class="auto-hint">画面タップで解除</div>
      </div>
    `;
  }
  if (s.actionMenu === "skill") return _buildSkillMenu(p);
  if (s.actionMenu === "item")  return _buildItemMenu();

  return `
    <div class="action-main">
      <button class="btn action-btn action-img-btn" id="btn-attack"><img src="images/b_botan_1.png" class="action-btn-img"></button>
      <button class="btn action-btn action-img-btn" id="btn-open-skill"><img src="images/b_botan_2.png" class="action-btn-img"></button>
      <button class="btn action-btn action-img-btn" id="btn-open-item"><img src="images/b_botan_3.png" class="action-btn-img"></button>
      <button class="btn action-btn action-img-btn" id="btn-auto"><img src="images/b_botan_4.png" class="action-btn-img"></button>
    </div>
  `;
}

function _buildSkillMenu(p) {
  const pStr = p.str + calcEquipStats(p).str;
  const learnedIds = Object.keys(GameData.skills).filter(id => (p.skills[id] || 0) >= 1);

  if (learnedIds.length === 0) {
    return `
      <div class="action-submenu">
        <div class="submenu-header">
          <button class="btn btn-back" id="btn-action-back">←</button>
          <span class="submenu-title">スキル選択</span>
        </div>
        <div class="placeholder-box" style="padding:20px 0;">
          <div class="ph-icon">✨</div>訓練所でスキルを習得しよう
        </div>
      </div>`;
  }

  const rows = learnedIds.map(id => {
    const sk = GameData.skills[id];
    const lv = p.skills[id];
    const canUse = p.mp >= sk.mpCost;

    let effect = "";
    if (sk.type === "attack_last") {
      const mult = sk.multiplier + (lv - 1) * 0.2;
      effect = `約 ${Math.floor(pStr * mult)} dmg・最終攻撃`;
    } else if (sk.type === "attack_single") {
      const mult = sk.multiplier + (lv - 1) * (sk.multiplierPerLv || 0.1);
      effect = `約 ${Math.floor(pStr * mult)} dmg`;
    } else if (sk.type === "attack_all") {
      const mult = sk.multiplier + (lv - 1) * (sk.multiplierPerLv || 0.05);
      effect = `全体 約 ${Math.floor(pStr * mult)} dmg`;
    } else {
      effect = sk.healPct
        ? `HP +${Math.round((sk.healPct + (lv - 1) * sk.healPctPerLv) * 100)}%`
        : `HP +${sk.healBase + (lv - 1) * sk.healPerLevel}`;
    }

    return `
      <button class="btn skill-use-btn ${canUse ? "btn-blue" : "btn-disabled"}"
              data-skill="${id}" ${canUse ? "" : "disabled"}>
        <span class="skill-btn-icon">${sk.image ? `<img src="${sk.image}" style="width:36px;height:36px;object-fit:contain;vertical-align:middle">` : sk.icon}</span>
        <span class="skill-btn-body">
          <span class="skill-btn-name">${sk.name} <small>Lv${lv}</small></span>
          <span class="skill-btn-sub">${effect} · MP ${sk.mpCost}</span>
        </span>
      </button>`;
  }).join("");

  return `
    <div class="action-submenu">
      <div class="submenu-header">
        <button class="btn btn-back" id="btn-action-back">←</button>
        <span class="submenu-title">スキル選択</span>
        <span class="mp-disp">MP ${p.mp}/${p.mpMax + calcEquipStats(p).mp}</span>
      </div>
      ${rows}
    </div>
  `;
}

function _buildItemMenu() {
  const p = App.player;
  const available = GameData.alchemy.filter(r => (p.items[r.id] || 0) > 0);
  const rows = available.map(r => `
    <button class="btn btn-green btn-full skill-row-btn item-use-btn" data-item="${r.id}">
      <span class="skill-btn-icon">${r.image ? `<img src="${r.image}" style="width:28px;height:28px;object-fit:contain;vertical-align:middle">` : r.icon}</span>
      <span class="skill-btn-body">
        <span class="skill-btn-name">${r.name} <small>×${p.items[r.id]}</small></span>
        <span class="skill-btn-sub">${r.desc}</span>
      </span>
    </button>`).join("");

  return `
    <div class="action-submenu">
      <div class="submenu-header">
        <button class="btn btn-back" id="btn-action-back">←</button>
        <span class="submenu-title">アイテム</span>
      </div>
      ${available.length === 0
        ? `<div class="placeholder-box" style="padding:20px 0;"><div class="ph-icon">🎒</div>使えるアイテムがありません</div>`
        : rows}
    </div>
  `;
}

function _buildResult(s, p) {
  const roomNum  = s.roomIndex + 1;
  const total    = s.dungeon.rooms;
  const isLast   = roomNum === total;
  const matDefs  = GameData.materials;

  const dropRows = s.gainedDrops.length
    ? s.gainedDrops.map(d => {
        const m = matDefs[d.id];
        const mImg = m.image ? `<img src="${m.image}" style="width:16px;height:16px;object-fit:contain;vertical-align:middle">` : m.icon;
        return `<span class="result-drop-item">${mImg} ${m.name} ×${d.qty}</span>`;
      }).join("")
    : `<span class="result-drop-none">—</span>`;

  return `
    <div class="stars"></div>
    <div class="result-screen">
      <div class="result-card">
        <div class="result-title">${isLast ? "ボス撃破！" : `<img src="images/battle_1.png" style="width:32px;height:32px;object-fit:contain;vertical-align:middle"> 勝利！`}</div>
        <div class="result-room-counter">${roomNum} / ${total}</div>

        <div class="result-divider"></div>

        <div class="result-rows">
          <div class="result-row">
            <span class="result-label">獲得G</span>
            <span class="result-val gold">+ ${s.gainedMoney} G</span>
          </div>
          <div class="result-row">
            <span class="result-label">ドロップ</span>
            <div class="result-drops">${dropRows}</div>
          </div>
        </div>

        <div class="result-divider"></div>

        <div class="result-money-total">
          <span class="result-label">所持金</span>
          <span class="result-val gold"><img src="images/icon_3.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle"> ${p.money.toLocaleString()} G</span>
        </div>

        ${s.autoMode
          ? `<div class="auto-result-indicator">⚡ オート進行中...</div>`
          : `<button class="btn btn-gold btn-lg btn-full" id="btn-next">
               ${isLast ? "ダンジョンクリア！ ✓" : `次の部屋へ (${roomNum + 1}/${total}) ›`}
             </button>`
        }
      </div>
    </div>
  `;
}

function _buildGameover() {
  return `
    <div class="stars"></div>
    <div class="result-screen">
      <div class="result-card gameover-card">
        <div class="gameover-skull"><img src="images/gameover.png" alt="gameover" style="width:80px;height:80px;object-fit:contain"></div>
        <div class="result-title gameover-title">ゲームオーバー</div>
        <p class="gameover-desc">HP が 0 になった…<br>HPを全回復してタイトルへ戻ります</p>
        <button class="btn btn-gold btn-lg btn-full" id="btn-gameover-title">
          タイトルへ戻る
        </button>
      </div>
    </div>
  `;
}

function _buildCleared(s) {
  return `
    <div class="stars"></div>
    <div class="result-screen">
      <div class="result-card cleared-card">
        <div class="cleared-icon"><img src="images/icon_2.png" style="width:64px;height:64px;object-fit:contain"></div>
        <div class="result-title cleared-title">ダンジョンクリア！</div>
        <p class="cleared-name">${s.dungeon.name}</p>
        <p class="cleared-desc">全 ${s.dungeon.rooms} 部屋を踏破した！</p>
        <button class="btn btn-gold btn-lg btn-full" id="btn-cleared-title">
          タイトルへ戻る
        </button>
      </div>
    </div>
  `;
}
