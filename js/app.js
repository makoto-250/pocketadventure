// ===== Pocket Adventure - Main App =====

const App = {
  state: null,
  _bgm: null,
  _bgmTrack: null,
  audioSettings: null,

  _audioKey: "pocketAdventure_audio",

  _loadAudioSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(this._audioKey));
      return Object.assign({ bgmEnabled: true, bgmVolume: 0.5, seEnabled: true, seVolume: 0.5 }, s || {});
    } catch { return { bgmEnabled: true, bgmVolume: 0.5, seEnabled: true, seVolume: 0.5 }; }
  },

  _saveAudioSettings() {
    localStorage.setItem(this._audioKey, JSON.stringify(this.audioSettings));
  },

  _bgmBaseVolume: {
    "bgm_1_4.wav": 0.7,
    "bgm_3.wav":   0.9,
    "bgm_4.wav":   1.2,
    "bgm_5.wav":   0.6,
    "bgm_6.flac":  0.7,
    "bgm_7.mp3":   0.9,
  },

  _bgmVolume(track) {
    const base = this._bgmBaseVolume[track] ?? 1.0;
    return Math.min(1, base * this.audioSettings.bgmVolume);
  },

  _playBgm(track) {
    if (this._bgmTrack === track && this._bgm && !this._bgm.paused) return;
    if (this._bgm) { this._bgm.pause(); this._bgm.currentTime = 0; }
    this._bgmTrack = track;
    if (!this.audioSettings.bgmEnabled) return;
    this._bgm = new Audio(`sounds/${track}`);
    this._bgm.loop = true;
    this._bgm.volume = this._bgmVolume(track);
    this._bgm.play().catch(() => {});
  },

  _applyBgmSettings() {
    if (!this.audioSettings.bgmEnabled) {
      if (this._bgm) this._bgm.pause();
    } else {
      if (this._bgm) {
        this._bgm.volume = this._bgmVolume(this._bgmTrack);
        this._bgm.play().catch(() => {});
      } else if (this._bgmTrack) {
        this._bgm = new Audio(`sounds/${this._bgmTrack}`);
        this._bgm.loop = true;
        this._bgm.volume = this._bgmVolume(this._bgmTrack);
        this._bgm.play().catch(() => {});
      }
    }
  },

  _audioCtx: null,
  _seBuffers: {},

  _initAudioCtx() {
    if (this._audioCtx) return;
    this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  },

  async _loadSe(filename) {
    if (this._seBuffers[filename]) return;
    try {
      const res = await fetch(`sounds/${filename}`);
      const arr = await res.arrayBuffer();
      this._seBuffers[filename] = await this._audioCtx.decodeAudioData(arr);
    } catch(e) {}
  },

  playSe(filename) {
    if (!this.audioSettings.seEnabled) return;
    if (!this._audioCtx) return;
    if (this._audioCtx.state === "suspended") this._audioCtx.resume();
    const buf = this._seBuffers[filename];
    if (!buf) return;
    const src = this._audioCtx.createBufferSource();
    src.buffer = buf;
    const gain = this._audioCtx.createGain();
    gain.gain.value = this.audioSettings.seVolume;
    src.connect(gain);
    gain.connect(this._audioCtx.destination);
    src.start(0);
  },

  init() {
    this.audioSettings = this._loadAudioSettings();
    this._initAudioCtx();
    const seFiles = [
      "effects_1.wav", "swordslash.ogg", "swordslash_2.wav", "swordslash_3.wav",
      "coindrop.wav", "levelup.mp3", "start.mp3",
      "dead.wav", "e_dead.wav", "result.flac", "result_2.wav",
      "buki.wav", "bougu.wav", "item.wav", "equip.mp3",
      "dooropen.wav", "dooropen_2.wav", "dooropen_3.wav", "dooropen_5.wav", "fanfare.mp3",
      "heal_1.wav", "heal_2.wav", "swordslash_4.wav", "swordslash_5.wav", "swordslash_6.wav",
      "item_1.wav", "item_2.mp3", "item_3.wav",
    ];
    seFiles.forEach(f => this._loadSe(f));
    document.addEventListener("visibilitychange", () => {
      if (!this._bgm) return;
      if (document.hidden) {
        this._bgm.pause();
      } else if (this.audioSettings.bgmEnabled) {
        this._bgm.play().catch(() => {});
      }
    });
    this.state = Save.load() || Save.newGame();
    this._applyDungeonUnlocks();
    document.addEventListener("click", e => {
      if (this._audioCtx && this._audioCtx.state === "suspended") this._audioCtx.resume();
      if (e.target.closest(".btn, .menu-btn") && !e.target.closest(".skill-upgrade-btn, #btn-lvup, .dungeon-card-enter, #btn-attack, .craft-btn, .alchemy-btn, .equip-btn, .unequip-btn, .skill-use-btn, .menu-btn")) App.playSe("effects_1.wav");
    });
    this.navigateTo("title");
  },

  // clearedDungeons をもとに GameData のフラグを復元
  _applyDungeonUnlocks() {
    GameData.dungeons.forEach((d, i) => { d.unlocked = i === 0; });
    for (const clearedId of this.state.clearedDungeons) {
      const idx = GameData.dungeons.findIndex(d => d.id === clearedId);
      if (idx >= 0 && idx + 1 < GameData.dungeons.length) {
        GameData.dungeons[idx + 1].unlocked = true;
      }
    }
  },

  navigateTo(screenId, direction = "right") {
    const app = document.getElementById("app");
    const screen = Screens[screenId]();

    if (direction) {
      const animClass = direction === "right" ? "slide-in" : "slide-in-left";
      screen.classList.add(animClass);
      setTimeout(() => screen.classList.remove(animClass), 300);
    }

    app.innerHTML = "";
    app.appendChild(screen);

    if (screenId === "battle") {
      const dungeonBgmMap = { forest: "bgm_2.mp3", cave: "bgm_3.wav", ruins: "bgm_4.wav", volcano: "bgm_5.wav", abyss: "bgm_6.flac", sky: "bgm_7.mp3" };
      const dungeonId = typeof Battle !== "undefined" && Battle.state ? Battle.state.dungeon.id : null;
      this._playBgm(dungeonBgmMap[dungeonId] || "bgm_2.mp3");
    } else {
      const screenBgmMap = { adventure: "bgm_1_1.wav", equipment: "bgm_1_2.wav", smithing: "bgm_1_3_.mp3", training: "bgm_1_4.wav" };
      this._playBgm(screenBgmMap[screenId] || "bgm_1.flac");
    }
  },

  save() {
    Save.save(this.state);
  },

  get player() { return this.state.player; },
  get clearedDungeons() { return this.state.clearedDungeons; },
};

// ===== Screen Builders =====
const Screens = {

  // ----------------------------------------------------------------
  // TITLE
  // ----------------------------------------------------------------
  title() {
    const el = div("screen", "screen-title", "id:screen-title");

    el.innerHTML = `
      <div class="dungeon-bg" style="background: url('images/top.png') center/cover no-repeat"></div>
      <div class="dungeon-bg-overlay"></div>

      <div class="title-top">
        <div class="title-emblem"><img class="title-emblem-img" src="images/battle_1.png" alt=""></div>
        <div class="title-logo">
          <img class="title-logo-img" src="images/logoname_1.png" alt="Pocket Adventure">
        </div>
        <div class="title-deco">
          <div class="title-deco-line"></div>
          <div class="title-deco-gem">✦</div>
          <div class="title-deco-line"></div>
        </div>
      </div>

      <div class="title-menu">
        ${menuBtn("adventure", "<img class='menu-icon-img' src='images/battle_1.png' alt=''>", "冒険")}
        ${menuBtn("equipment", "<img class='menu-icon-img' src='images/soubi.png' alt=''>", "装備")}
        ${menuBtn("smithing",  "<img class='menu-icon-img' src='images/kaji_1.png' alt=''>", "鍛冶")}
        ${menuBtn("training",  "<img class='menu-icon-img' src='images/kunren.png' alt=''>", "訓練所")}
      </div>

      <button class="btn achievements-btn" id="btn-achievements"><img src="images/icon_2.png" alt="実績" style="width:56px;height:56px;object-fit:contain"></button>
      <button class="btn settings-btn" id="btn-settings"><img src="images/icon_1.png" alt="設定" style="width:56px;height:56px;object-fit:contain"></button>
      <div class="title-version">v0.1.0</div>
    `;

    const menuSeMap = { adventure: "dooropen.wav", equipment: "dooropen_2.wav", smithing: "dooropen_3.wav", training: "dooropen_5.wav" };
    el.querySelectorAll(".menu-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        App.playSe(menuSeMap[btn.dataset.screen] || "dooropen.wav");
        App.navigateTo(btn.dataset.screen);
      });
    });
    el.querySelector("#btn-achievements").addEventListener("click", () =>
      App.navigateTo("achievements")
    );
    el.querySelector("#btn-settings").addEventListener("click", () =>
      App.navigateTo("settings")
    );

    return el;
  },

  // ----------------------------------------------------------------
  // ADVENTURE
  // ----------------------------------------------------------------
  adventure() {
    const el = div("screen");
    const p  = App.player;
    const _es = calcEquipStats(p);
    const effHpMax = p.hpMax + _es.hp;
    const effMpMax = p.mpMax + _es.mp;
    p.hp = effHpMax;
    p.mp = effMpMax;
    App.save();
    const hpPct = 100;
    const mpPct = 100;

    el.innerHTML = `
      <div class="stars"></div>
      <div class="screen-header">
        <button class="btn btn-back" id="btn-back">←</button>
        <img class="header-icon-img" src="images/battle_1.png" alt="">
        <h2>冒険</h2>
      </div>

      <div class="player-status-bar">
        <div class="lv-badge">LV ${p.lv}</div>
        <div class="status-gauges">
          <div class="gauge-row">
            <span class="gauge-label">HP</span>
            <div class="gauge-bar"><div class="gauge-fill hp" style="width:${hpPct}%"></div></div>
            <span class="gauge-val">${p.hp}/${effHpMax}</span>
          </div>
          <div class="gauge-row">
            <span class="gauge-label">MP</span>
            <div class="gauge-bar"><div class="gauge-fill mp" style="width:${mpPct}%"></div></div>
            <span class="gauge-val">${p.mp}/${effMpMax}</span>
          </div>
        </div>
      </div>

      <div class="dungeon-section">
        <div class="section-title">ダンジョン一覧</div>
        <div class="dungeon-slider" id="dungeon-list">
          ${GameData.dungeons.map(d => dungeonCard(d, App.clearedDungeons)).join("")}
        </div>
      </div>
    `;

    el.querySelector("#btn-back").addEventListener("click", () => App.navigateTo("title", "left"));

    el.querySelectorAll(".dungeon-card-enter").forEach(card => {
      card.addEventListener("click", () => {
        App.playSe("start.mp3");
        Battle.start(card.dataset.dungeon);
      });
    });

    return el;
  },

  // ----------------------------------------------------------------
  // ACHIEVEMENTS
  // ----------------------------------------------------------------
  achievements() {
    const el  = div("screen");
    const p   = App.player;
    const cleared = App.clearedDungeons;

    const equipStats = calcEquipStats(p);

    const dungeonRows = GameData.dungeons.map(d => {
      const done = cleared.includes(d.id);
      return `
        <div class="ach-dungeon-thumb">
          <div class="ach-dungeon-img ${done ? "" : "ach-dungeon-dark"}"
               style="background:${d.bgColor}"></div>
          <div class="ach-dungeon-label ${done ? "ach-clear" : "ach-unclear"}">${done ? "Clear" : "─"}</div>
        </div>`;
    }).join("");

    const equipped = Object.entries({ 武器: p.equip.weapon, 防具: p.equip.armor, 装飾: p.equip.accessory })
      .map(([label, item]) => `
        <div class="ach-stat-row">
          <span class="ach-stat-label">${label}</span>
          <span class="ach-stat-val">${item ? item.name : "─"}</span>
        </div>`).join("");

    el.innerHTML = `
      <div class="stars"></div>
      <div class="screen-header">
        <button class="btn btn-back" id="btn-back">←</button>
        <img class="header-icon-img" src="images/icon_2.png" alt="実績">
        <h2>実績</h2>
      </div>

      <div class="content-scroll">
        <div class="section-title">ステータス</div>
        <div class="card card-padded">
          <div class="ach-stats-2col">
            <div class="ach-stat-row"><span class="ach-stat-label">LV</span><span class="ach-stat-val">${p.lv}</span></div>
            <div class="ach-stat-row"><span class="ach-stat-label">STR</span><span class="ach-stat-val">${p.str + equipStats.str}</span></div>
            <div class="ach-stat-row"><span class="ach-stat-label">HP</span><span class="ach-stat-val">${p.hpMax + equipStats.hp}</span></div>
            <div class="ach-stat-row"><span class="ach-stat-label">DEF</span><span class="ach-stat-val">${p.def + equipStats.def}</span></div>
            <div class="ach-stat-row"><span class="ach-stat-label">MP</span><span class="ach-stat-val">${p.mpMax + equipStats.mp}</span></div>
            <div class="ach-stat-row"><span class="ach-stat-label">AGI</span><span class="ach-stat-val">${p.agi + equipStats.agi}</span></div>
            <div class="ach-stat-row ach-stat-full"><span class="ach-stat-label">所持金</span><span class="ach-stat-val"><img src="images/icon_3.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle"> ${p.money.toLocaleString()} G</span></div>
          </div>
        </div>

        <div class="section-title">装備中</div>
        <div class="card card-padded">
          <div class="ach-stats-grid">${equipped}</div>
        </div>

        <div class="section-title">習得スキル</div>
        <div class="card card-padded">
          ${(() => {
            const ids = Object.keys(GameData.skills);
            const renderItem = id => {
              const sk = GameData.skills[id];
              const lv = p.skills[id] || 0;
              const learned = lv > 0;
              const iconHtml = sk.image
                ? `<img src="${sk.image}" style="width:44px;height:44px;object-fit:contain${learned ? "" : ";filter:grayscale(1);opacity:0.35"}">`
                : `<span style="font-size:36px${learned ? "" : ";filter:grayscale(1);opacity:0.35"}">${sk.icon}</span>`;
              return `<div class="ach-skill-item">${iconHtml}<div class="ach-skill-lv ${learned ? "" : "dim"}">${learned ? "LV " + lv : "─"}</div></div>`;
            };
            return `
              <div class="ach-skill-row" style="grid-template-columns:repeat(${ids.length},1fr)">${ids.map(renderItem).join("")}</div>`;
          })()}
        </div>

        <div class="section-title">ダンジョン攻略</div>
        <div class="card card-padded ach-dungeon-thumbs">
          ${dungeonRows}
        </div>

        <div class="section-title">鍛冶実績</div>
        <div class="card card-padded">
          <div class="ach-rank-grid">
            ${[1,2,3,4,5,6,7,8,9,10,11,12,13].map(rank => {
              const done = GameData.recipes.filter(r => r.rank === rank).every(r => alreadyOwned(r.id, p));
              return `
                <div class="ach-rank-item">
                  <img src="images/rank_${rank}.png" class="ach-rank-img ${done ? "" : "ach-rank-dark"}">
                </div>`;
            }).join("")}
          </div>
          ${(() => {
            const allDone = GameData.recipes.every(r => alreadyOwned(r.id, p));
            return `
              <div class="ach-rank-full-wrap">
                <img src="images/rank_full.png" class="${allDone ? "" : "ach-rank-dark"}" style="height:100%;width:auto">
              </div>`;
          })()}
        </div>
      </div>
    `;

    el.querySelector("#btn-back").addEventListener("click", () => App.navigateTo("title", "left"));
    return el;
  },

  // ----------------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------------
  settings() {
    const el = div("screen");
    const as = App.audioSettings;

    el.innerHTML = `
      <div class="stars"></div>
      <div class="screen-header">
        <button class="btn btn-back" id="btn-back">←</button>
        <img class="header-icon-img" src="images/icon_1.png" alt="設定">
        <h2>設定</h2>
      </div>

      <div class="content-scroll">
        <div class="section-title">サウンド設定</div>
        <div class="card card-padded">
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-name">BGM</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="bgm-toggle" ${as.bgmEnabled ? "checked" : ""}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="audio-slider-row" id="bgm-slider-row" style="opacity:${as.bgmEnabled ? "1" : "0.35"}">
            <input type="range" class="audio-slider" id="bgm-volume" min="0" max="100" value="${Math.round(as.bgmVolume * 100)}">
          </div>
          <div class="divider"></div>
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-name">効果音</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="se-toggle" ${as.seEnabled ? "checked" : ""}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="audio-slider-row" id="se-slider-row" style="opacity:${as.seEnabled ? "1" : "0.35"}">
            <input type="range" class="audio-slider" id="se-volume" min="0" max="100" value="${Math.round(as.seVolume * 100)}">
          </div>
        </div>

        <div class="section-title">データ管理</div>
        <div class="card card-padded">
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-name">セーブデータリセット</div>
              <div class="settings-desc">すべての進行状況が削除されます</div>
            </div>
            <button class="btn btn-red btn-sm" id="btn-reset">リセット</button>
          </div>
        </div>
      </div>

      <!-- 確認オーバーレイ -->
      <div class="confirm-overlay" id="confirm-area">
        <div class="confirm-card">
          <div class="confirm-title">⚠️ データリセット</div>
          <p class="confirm-msg">データがリセットされますが<br>よろしいでしょうか？</p>
          <div class="confirm-btns">
            <button class="btn btn-red btn-md" id="btn-confirm-yes">はい</button>
            <button class="btn btn-gold btn-md" id="btn-confirm-no">いいえ</button>
          </div>
        </div>
      </div>
    `;

    el.querySelector("#btn-back").addEventListener("click", () => App.navigateTo("title", "left"));

    // BGM toggle
    el.querySelector("#bgm-toggle").addEventListener("change", e => {
      App.audioSettings.bgmEnabled = e.target.checked;
      App._saveAudioSettings();
      App._applyBgmSettings();
      el.querySelector("#bgm-slider-row").style.opacity = e.target.checked ? "1" : "0.35";
    });

    // BGM volume
    el.querySelector("#bgm-volume").addEventListener("input", e => {
      App.audioSettings.bgmVolume = e.target.value / 100;
      App._saveAudioSettings();
      if (App._bgm) App._bgm.volume = App._bgmVolume(App._bgmTrack);
    });

    // SE toggle
    el.querySelector("#se-toggle").addEventListener("change", e => {
      App.audioSettings.seEnabled = e.target.checked;
      App._saveAudioSettings();
      el.querySelector("#se-slider-row").style.opacity = e.target.checked ? "1" : "0.35";
    });

    // SE volume
    el.querySelector("#se-volume").addEventListener("input", e => {
      App.audioSettings.seVolume = e.target.value / 100;
      App._saveAudioSettings();
    });

    el.querySelector("#btn-reset").addEventListener("click", () => {
      el.querySelector("#confirm-area").classList.add("show");
    });
    el.querySelector("#btn-confirm-no").addEventListener("click", () => {
      el.querySelector("#confirm-area").classList.remove("show");
    });
    el.querySelector("#btn-confirm-yes").addEventListener("click", () => {
      localStorage.removeItem(Save.KEY);
      App.state = Save.newGame();
      App._applyDungeonUnlocks();
      App.navigateTo("title", "left");
    });

    return el;
  },

  // ----------------------------------------------------------------
  // SMITHING
  // ----------------------------------------------------------------
  smithing(activeTab = "weapon") {
    const el  = div("screen");
    const p   = App.player;
    const matDefs = GameData.materials;

    const RANK_META = {
      1:  { label: "基本素材のみ",           uniqueKey: null },
      2:  { label: "始まりの森・レア",       uniqueKey: "ancientCore" },
      3:  { label: "始まりの森・ボス",       uniqueKey: "forestKingHorn" },
      4:  { label: "石炭の洞窟・レア",       uniqueKey: "crystalHeart" },
      5:  { label: "石炭の洞窟・ボス",       uniqueKey: "rockDrakeScale" },
      6:  { label: "古代の遺跡・レア",       uniqueKey: "phantomFeather" },
      7:  { label: "古代の遺跡・ボス",       uniqueKey: "ancientTablet" },
      8:  { label: "炎の山岳・レア",         uniqueKey: "phoenixAsh" },
      9:  { label: "炎の山岳・ボス",         uniqueKey: "wyvernScale" },
      10: { label: "深海の奈落・レア",       uniqueKey: "abyssalFang" },
      11: { label: "深海の奈落・ボス",       uniqueKey: "seaDragonCore" },
      12: { label: "天空の聖域・レア",       uniqueKey: "celestialShard" },
      13: { label: "天空の聖域・ボス",       uniqueKey: "godCrystal" },
    };

    const tabs = [
      { id: "weapon",    label: "武器" },
      { id: "armor",     label: "防具" },
      { id: "accessory", label: "装飾品" },
      { id: "alchemy",   label: "錬金" },
    ];

    function buildRankSections(category) {
      return [1,2,3,4,5,6,7,8,9,10,11,12,13].map(rank => {
        const meta  = RANK_META[rank];
        const items = GameData.recipes.filter(r => r.rank === rank && r.category === category);
        if (items.length === 0) return "";
        const uKey  = meta.uniqueKey;
        const uMat  = uKey ? matDefs[uKey] : null;
        const uHave = uKey ? (p.materials[uKey] || 0) : null;
        const uMatIcon = uMat ? (uMat.image
          ? `<img src="${uMat.image}" style="width:16px;height:16px;object-fit:contain;vertical-align:middle">`
          : uMat.icon) : "";
        const uTag  = uMat
          ? `<span class="rank-unique ${uHave > 0 ? "have" : "none"}">${uMatIcon} ${uMat.name} (${uHave})</span>`
          : `<span class="rank-unique have">─</span>`;
        return `
          <div class="rank-group">
            <div class="rank-header">
              <span class="rank-badge">Rank ${rank}</span>
              <span class="rank-label">${meta.label}</span>
              ${uTag}
            </div>
            <div class="rank-recipe-grid">
              ${items.map(r => recipeCard(r, p.materials)).join("")}
            </div>
          </div>`;
      }).join("");
    }

    function buildAlchemySection() {
      return GameData.alchemy.map(rec => {
        const canCraft = Object.entries(rec.materials).every(([id, qty]) => (p.materials[id] || 0) >= qty);
        const costHtml = Object.entries(rec.materials).map(([id, qty]) => {
          const have = p.materials[id] || 0;
          const mat  = matDefs[id];
          const matImg = mat.image ? `<img src="${mat.image}" style="width:14px;height:14px;object-fit:contain;vertical-align:middle">` : mat.icon;
          return `<span class="cost-item ${have >= qty ? "can-craft" : "cannot"}">${matImg}${mat.name} ${have}/${qty}</span>`;
        }).join("");
        return `
          <div class="recipe-card">
            <div class="recipe-icon">${rec.image ? `<img src="${rec.image}" style="width:36px;height:36px;object-fit:contain">` : rec.icon}</div>
            <div class="recipe-info">
              <div class="recipe-name">${rec.name} <span style="color:var(--text-dim);font-size:12px">所持: ${p.items[rec.id] || 0}</span></div>
              <div class="recipe-stats">${rec.desc}</div>
              <div class="recipe-cost">${costHtml}</div>
            </div>
            <button class="btn btn-gold btn-sm alchemy-btn" data-alchemy="${rec.id}"
                    ${canCraft ? "" : "disabled style='opacity:.4;filter:grayscale(1)'"}>
              作成
            </button>
          </div>`;
      }).join("");
    }

    const commonMats = Object.keys(matDefs).filter(id => !matDefs[id].rare);
    const rareMats   = Object.keys(matDefs).filter(id =>  matDefs[id].rare);
    const matGrid = (ids) => {
      const owned = ids.filter(id => (p.materials[id] || 0) > 0);
      if (owned.length === 0) return `<div class="placeholder-box" style="padding:8px">─</div>`;
      return owned.map(id => {
        const m = matDefs[id];
        const count = p.materials[id];
        return `
          <div class="material-item ${m.rare ? "is-rare" : ""}">
            <div class="mat-icon">${m.image ? `<img src="${m.image}" style="width:32px;height:32px;object-fit:contain">` : m.icon}</div>
            <div class="mat-name">${m.name}</div>
            <div class="mat-count has">${count}</div>
          </div>`;
      }).join("");
    };

    el.innerHTML = `
      <div class="stars"></div>
      <div class="screen-header">
        <button class="btn btn-back" id="btn-back">←</button>
        <img class="header-icon-img" src="images/kaji_1.png" alt="">
        <h2>鍛冶</h2>
      </div>

      <div class="content-scroll">
        <div class="section-title">共通素材</div>
        <div class="card card-padded">
          <div class="material-grid" id="smithing-common-mats">${matGrid(commonMats)}</div>
        </div>

        <div class="section-title">固有素材</div>
        <div class="card card-padded">
          <div class="material-grid rare-grid" id="smithing-rare-mats">${matGrid(rareMats)}</div>
        </div>

        <div class="equip-tabs">
          ${tabs.map(t => `
            <button class="equip-tab ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}">${t.label}</button>
          `).join("")}
        </div>

        <div id="smithing-tab-content">
          ${activeTab === "alchemy" ? buildAlchemySection() : buildRankSections(activeTab)}
        </div>
      </div>
    `;

    function refreshMats() {
      el.querySelector("#smithing-common-mats").innerHTML = matGrid(commonMats);
      el.querySelector("#smithing-rare-mats").innerHTML   = matGrid(rareMats);
    }

    function attachListeners(container) {
      container.querySelectorAll(".craft-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          craftItem(btn.dataset.recipe);
          const currentTab = el.querySelector(".equip-tab.active").dataset.tab;
          refreshMats();
          const content = el.querySelector("#smithing-tab-content");
          content.innerHTML = buildRankSections(currentTab);
          attachListeners(content);
        });
      });
      container.querySelectorAll(".alchemy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          craftPotion(btn.dataset.alchemy);
          refreshMats();
          const content = el.querySelector("#smithing-tab-content");
          content.innerHTML = buildAlchemySection();
          attachListeners(content);
        });
      });
    }

    el.querySelectorAll(".equip-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        el.querySelectorAll(".equip-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const content = el.querySelector("#smithing-tab-content");
        const tab = btn.dataset.tab;
        content.innerHTML = tab === "alchemy" ? buildAlchemySection() : buildRankSections(tab);
        attachListeners(content);
      });
    });

    attachListeners(el.querySelector("#smithing-tab-content"));

    el.querySelector("#btn-back").addEventListener("click", () => App.navigateTo("title", "left"));

    return el;
  },

  // ----------------------------------------------------------------
  // EQUIPMENT
  // ----------------------------------------------------------------
  equipment(activeTab = "weapon") {
    const el = div("screen");
    const p  = App.player;
    const eq = p.equip;

    const slotIcon = { weapon: "─", armor: "─", accessory: "─" };
    const tabs = [
      { id: "weapon",    label: "武器" },
      { id: "armor",     label: "防具" },
      { id: "accessory", label: "装飾品" },
    ];

    const equipStats = calcEquipStats(p);

    function renderTabContent(tabId) {
      const item = eq[tabId];
      const filtered = p.inventory
        .filter(i => i.category === tabId)
        .sort((a, b) => {
          const ra = (GameData.recipes.find(r => r.id === a.id) || {}).rank ?? 999;
          const rb = (GameData.recipes.find(r => r.id === b.id) || {}).rank ?? 999;
          return ra - rb;
        });

      const slotHtml = `
        <div class="equip-slot-row ${item ? "equipped" : ""}">
          <div class="equip-slot-icon">${item
            ? (item.image ? `<img src="${item.image}" style="width:36px;height:36px;object-fit:contain">` : item.icon)
            : slotIcon[tabId]}</div>
          <div class="equip-slot-body">
            <div class="equip-slot-name">${item ? item.name : "未装備"}</div>
            ${item ? `<div class="equip-slot-stat">${item.statDesc}</div>` : ""}
          </div>
          ${item ? `<button class="btn btn-red btn-sm unequip-btn" data-slot="${tabId}">外す</button>` : ""}
        </div>`;

      const inventoryHtml = filtered.length === 0
        ? `<div class="placeholder-box"><div class="ph-icon">📦</div>アイテムがありません<br><small>鍛冶でクラフトしよう</small></div>`
        : filtered.map(i => inventoryCard(i, eq)).join("");

      return slotHtml + `<div class="section-title" style="margin-top:16px">インベントリ</div>` + inventoryHtml;
    }

    el.innerHTML = `
      <div class="stars"></div>
      <div class="screen-header">
        <button class="btn btn-back" id="btn-back">←</button>
        <img class="header-icon-img" src="images/soubi.png" alt="">
        <h2>装備</h2>
      </div>

      <div class="content-scroll">
        <div class="section-title">ステータス</div>
        <div class="stats-panel">
          <div class="stats-grid">
            ${statItem("LV",  p.lv,  "")}
            ${statItem("STR", p.str + equipStats.str, equipStats.str ? `+${equipStats.str}` : "")}
            ${statItem("DEF", p.def + equipStats.def, equipStats.def ? `+${equipStats.def}` : "")}
            ${statItem("AGI", p.agi + equipStats.agi, equipStats.agi ? `+${equipStats.agi}` : "")}
            ${statItem("HP",  p.hpMax + equipStats.hp, equipStats.hp ? `+${equipStats.hp}` : "")}
            ${statItem("MP",  p.mpMax + equipStats.mp, equipStats.mp ? `+${equipStats.mp}` : "")}
          </div>
        </div>

        <div class="equip-tabs">
          ${tabs.map(t => `
            <button class="equip-tab ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}">${t.label}</button>
          `).join("")}
        </div>

        <div id="equip-tab-content">
          ${renderTabContent(activeTab)}
        </div>
      </div>
    `;

    el.querySelector("#btn-back").addEventListener("click", () => App.navigateTo("title", "left"));

    function attachListeners(container) {
      container.querySelectorAll(".equip-btn").forEach(btn => {
        btn.addEventListener("click", () => { equipItem(btn.dataset.item); App.navigateTo("equipment"); });
      });
      container.querySelectorAll(".unequip-btn").forEach(btn => {
        btn.addEventListener("click", () => { unequipItem(btn.dataset.slot); App.navigateTo("equipment"); });
      });
    }

    el.querySelectorAll(".equip-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        el.querySelectorAll(".equip-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const content = el.querySelector("#equip-tab-content");
        content.innerHTML = renderTabContent(btn.dataset.tab);
        attachListeners(content);
      });
    });

    attachListeners(el.querySelector("#equip-tab-content"));

    return el;
  },

  // ----------------------------------------------------------------
  // TRAINING
  // ----------------------------------------------------------------
  training() {
    const el = div("screen");
    const p   = App.player;
    const cost = getLvUpCost(p.lv);
    const canLvUp = p.money >= cost;

    el.innerHTML = `
      <div class="stars"></div>
      <div class="screen-header">
        <button class="btn btn-back" id="btn-back">←</button>
        <img class="header-icon-img" src="images/kunren.png" alt="">
        <h2>訓練所</h2>
      </div>

      <div class="content-scroll">
        <div class="section-title">LV アップ</div>
        <div class="lvup-card card card-padded">
          <div class="lvup-top">
            <div class="lvup-lv-block">
              <span class="lvup-lv-label">現在</span>
              <span class="lvup-lv">LV ${p.lv}</span>
            </div>
            <div class="lvup-arrow">→</div>
            <div class="lvup-lv-block">
              <span class="lvup-lv-label">次</span>
              <span class="lvup-lv next">LV ${p.lv + 1}</span>
            </div>
          </div>
          <div class="lvup-gains">
            <span class="lvup-gain">STR <b>+2</b></span>
            <span class="lvup-gain">DEF <b>+1</b></span>
            <span class="lvup-gain">AGI <b>+1</b></span>
            <span class="lvup-gain">HP <b>+10</b></span>
            <span class="lvup-gain">MP <b>+3</b></span>
          </div>
          <button class="btn btn-gold btn-lg btn-full" id="btn-lvup"
                  ${canLvUp ? "" : "disabled style='opacity:.4;filter:grayscale(1)'"}>
            LV アップ　${cost.toLocaleString()} G
          </button>
          <div class="lvup-money-hint ${canLvUp ? "ok" : "ng"}">
            所持金 ${p.money.toLocaleString()} G / 必要 ${cost.toLocaleString()} G
          </div>
        </div>

        <div class="section-title">スキル強化</div>
        ${Object.keys(GameData.skills).map(id => skillCard(id, p)).join("")}
      </div>

      <div class="money-bar">
        <span class="money-icon"><img src="images/icon_3.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle"></span>
        <span class="money-val">${p.money.toLocaleString()}</span>
        <span class="money-label">G</span>
      </div>
    `;

    el.querySelector("#btn-back").addEventListener("click", () => App.navigateTo("title", "left"));

    el.querySelector("#btn-lvup")?.addEventListener("click", () => {
      levelUp();
      App.navigateTo("training");
    });

    el.querySelectorAll(".skill-upgrade-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        upgradeSkill(btn.dataset.skill);
        App.navigateTo("training");
      });
    });

    return el;
  },
};

// ===== UI Helpers =====

function div(className, ...extras) {
  const el = document.createElement("div");
  el.className = className;
  for (const x of extras) {
    if (x.startsWith("id:")) el.id = x.slice(3);
    else el.classList.add(x);
  }
  return el;
}

function menuBtn(screen, icon, name) {
  return `
    <button class="menu-btn ${screen}" data-screen="${screen}">
      <span class="menu-btn-icon">${icon}</span>
      <div class="menu-btn-name">${name}</div>
    </button>`;
}

function dungeonCard(dungeon, cleared) {
  const isCleared = cleared.includes(dungeon.id);
  const isLocked  = !dungeon.unlocked;

  return `
    <div class="dungeon-card ${isLocked ? "dungeon-card-locked" : "dungeon-card-enter"}"
         ${isLocked ? "" : `data-dungeon="${dungeon.id}"`}>
      <div class="dungeon-banner" style="background:${dungeon.bgColor}">
        ${dungeon.icon}
      </div>
      ${isLocked
        ? `<div class="dungeon-info"><div class="dungeon-locked">🔒 未解放</div></div>`
        : `<div class="dungeon-info">
             <div class="dungeon-name">${dungeon.name} ${isCleared ? "✓" : ""}</div>
             <div class="dungeon-meta">
               <span class="dungeon-tag">推奨LV <span>${dungeon.recLevel}+</span></span>
               <span class="dungeon-tag"><span>${dungeon.rooms}部屋</span></span>
               ${isCleared ? `<span class="dungeon-tag" style="color:var(--green)">✓ クリア済</span>` : ""}
             </div>
           </div>`
      }
    </div>`;
}

function alreadyOwned(recipeId, player) {
  if (player.inventory.some(i => i.id === recipeId)) return true;
  if (Object.values(player.equip).some(i => i && i.id === recipeId)) return true;
  return false;
}

function recipeCard(recipe, materials) {
  const p       = App.player;
  const owned   = alreadyOwned(recipe.id, p);
  const canCraft = !owned && canCraftRecipe(recipe, materials);

  const costHtml = Object.entries(recipe.materials).map(([id, qty]) => {
    const have = materials[id] || 0;
    const ok   = !owned && have >= qty;
    const mat  = GameData.materials[id];
    const matImg = mat.image ? `<img src="${mat.image}" style="width:14px;height:14px;object-fit:contain;vertical-align:middle">` : mat.icon;
    return `<span class="cost-item ${ok ? "can-craft" : "cannot"}">${matImg}${mat.name} ${have}/${qty}</span>`;
  }).join("");

  return `
    <div class="recipe-card ${owned ? "recipe-owned" : ""}">
      <div class="recipe-icon" style="${owned ? "opacity:0.5" : ""}">${recipe.image ? `<img src="${recipe.image}" style="width:36px;height:36px;object-fit:contain">` : recipe.icon}</div>
      <div class="recipe-info">
        <div class="recipe-name">${recipe.name}</div>
        <div class="recipe-stats">${recipe.statDesc}</div>
        <div class="recipe-cost">${owned ? "" : costHtml}</div>
      </div>
      ${owned
        ? `<span class="crafted-badge">作成済</span>`
        : `<button class="btn btn-gold btn-sm craft-btn"
                   data-recipe="${recipe.id}"
                   ${canCraft ? "" : "disabled style='opacity:.4;filter:grayscale(1)'"}>
             作成
           </button>`}
    </div>`;
}

function inventoryCard(item, equipped) {
  const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
  const slot = item.category;
  const current = equipped[slot];

  const statKeys = ["str", "def", "agi", "hp", "mp"];
  const labels   = { str: "STR", def: "DEF", agi: "AGI", hp: "HP", mp: "MP" };
  const diffHtml = statKeys.map(k => {
    const next = (item.stats && item.stats[k]) || 0;
    const cur  = (current && current.stats && current.stats[k]) || 0;
    const diff = next - cur;
    if (next === 0 && cur === 0) return "";
    if (isEquipped) {
      return `<span style="color:var(--text-dim)">${labels[k]} ${next > 0 ? "+" + next : next}</span>`;
    }
    const color = diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--text-dim)";
    const sign  = diff > 0 ? "+" : "";
    return `<span style="color:${color}">${labels[k]} ${sign}${diff}</span>`;
  }).filter(Boolean).join(" / ");

  return `
    <div class="recipe-card">
      <div class="recipe-icon">${item.image ? `<img src="${item.image}" style="width:36px;height:36px;object-fit:contain">` : item.icon}</div>
      <div class="recipe-info">
        <div class="recipe-name">${item.name} ${isEquipped ? "（装備中）" : ""}</div>
        <div class="recipe-stats">${diffHtml}</div>
      </div>
      ${isEquipped
        ? `<button class="btn btn-red btn-sm unequip-btn" data-slot="${slot}">外す</button>`
        : `<button class="btn btn-gold btn-sm equip-btn" data-item="${item.id}">装備</button>`}
    </div>`;
}

function skillCard(skillId, player) {
  const sk = GameData.skills[skillId];
  const lv = player.skills[skillId] || 0;
  const isLearned = lv >= 1;
  const isMax = lv >= sk.maxLevel;
  const cost = isMax ? null : sk.upgradeCosts[lv];

  // 解放条件チェック
  const req = sk.requires;
  let isLocked = false;
  let lockDesc = "";
  if (req) {
    if (req.playerLv && player.lv < req.playerLv) {
      isLocked = true;
      lockDesc = `LV${req.playerLv} で解放`;
    } else if (req.skill && (player.skills[req.skill] || 0) < req.lv) {
      isLocked = true;
      lockDesc = `${GameData.skills[req.skill].name} LV${req.lv} で解放`;
    }
  }
  if (isLocked) {
    return `
      <div class="skill-card is-unlearned" style="opacity:0.45;filter:grayscale(0.6)">
        <div class="skill-icon" style="opacity:0.4;filter:grayscale(1)">${sk.image ? `<img src="${sk.image}" style="width:47px;height:47px;object-fit:contain">` : sk.icon}</div>
        <div class="skill-info">
          <div class="skill-name" style="color:var(--text-dim)">???</div>
          <div class="skill-lv"><span class="skill-lv-badge unlearned">未解放</span></div>
          <div class="skill-effect" style="color:var(--text-dark)">${lockDesc}</div>
        </div>
      </div>`;
  }

  const canAct = !isMax && player.money >= cost;

  const displayLv = Math.max(1, lv);
  let effectText = "";
  if (sk.type === "attack_single") {
    const perLv = (sk.multiplierPerLv || 0.1) * 100;
    effectText = `STR×${Math.round(sk.multiplier * 100 + (displayLv - 1) * perLv)}% ダメージ`;
  } else if (sk.type === "attack_last") {
    effectText = `STR×${Math.round(sk.multiplier * 100 + (displayLv - 1) * 20)}% ダメージ（最終攻撃）`;
  } else if (sk.type === "attack_all") {
    const perLv = (sk.multiplierPerLv || 0.05) * 100;
    effectText = `全体にSTR×${Math.round(sk.multiplier * 100 + (displayLv - 1) * perLv)}% ダメージ`;
  } else if (sk.type === "heal") {
    if (sk.healPct) {
      effectText = `HP ${Math.round((sk.healPct + (displayLv - 1) * sk.healPctPerLv) * 100)}% 回復`;
    } else {
      effectText = `HP ${sk.healBase + (displayLv - 1) * sk.healPerLevel} 回復`;
    }
  }

  const lvBadge = !isLearned
    ? `<span class="skill-lv-badge unlearned">未習得</span>`
    : `<span class="skill-lv-badge">LV ${lv}</span>
       ${isMax ? `<span style="font-size:11px;color:var(--gold)">MAX</span>` : ""}`;

  const btnLabel = !isLearned ? "習得" : "強化";

  return `
    <div class="skill-card ${!isLearned ? "is-unlearned" : ""}">
      <div class="skill-icon" style="${!isLearned ? "opacity:0.4;filter:grayscale(1)" : ""}">${sk.image ? `<img src="${sk.image}" style="width:47px;height:47px;object-fit:contain">` : sk.icon}</div>
      <div class="skill-info">
        <div class="skill-name" style="${!isLearned ? "color:var(--text-dim)" : ""}">${sk.name}</div>
        <div class="skill-lv">${lvBadge}</div>
        <div class="skill-effect" style="${!isLearned ? "color:var(--text-dark)" : ""}">${effectText}　MP消費: ${sk.mpCost}</div>
      </div>
      <div class="skill-upgrade-row">
        ${isMax ? "" : `
          <button class="btn ${canAct ? "btn-gold" : ""} btn-sm skill-upgrade-btn"
                  data-skill="${skillId}"
                  ${canAct ? "" : "disabled style='opacity:.4;filter:grayscale(1)'"}>
            ${btnLabel}
          </button>
          <div class="upgrade-cost"><img src="images/icon_3.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle"> ${cost}G</div>
        `}
      </div>
    </div>`;
}

function statItem(label, value, bonus) {
  return `
    <div class="stat-item">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      ${bonus ? `<div class="stat-bonus">${bonus}</div>` : ""}
    </div>`;
}

// ===== Game Logic Helpers =====

function calcEquipStats(player) {
  const result = { str: 0, def: 0, agi: 0, hp: 0, mp: 0 };
  for (const item of Object.values(player.equip)) {
    if (!item) continue;
    for (const [k, v] of Object.entries(item.stats || {})) {
      if (k in result) result[k] += v;
    }
  }
  return result;
}

function canCraftRecipe(recipe, materials) {
  return Object.entries(recipe.materials).every(([id, qty]) => (materials[id] || 0) >= qty);
}

const _achQueue = [];
let _achShowing = false;

function _processAchQueue() {
  if (_achQueue.length === 0) { _achShowing = false; return; }
  _achShowing = true;
  const name = _achQueue.shift();
  App.playSe("fanfare.mp3");
  const existing = document.querySelector(".achievement-popup");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "achievement-popup";
  el.innerHTML = `<img src="images/icon_2.png" class="ach-pop-icon" style="width:32px;height:32px;object-fit:contain"><div class="ach-pop-text"><div class="ach-pop-title">実績解放！</div><div class="ach-pop-name">${name}</div></div>`;
  document.getElementById("app").appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => { el.remove(); _processAchQueue(); }, 500);
  }, 3000);
}

function showAchievementPopup(name) {
  _achQueue.push(name);
  if (!_achShowing) _processAchQueue();
}

function checkCraftAchievements() {
  const p = App.player;
  const notified = App.state.achievements;

  for (let rank = 1; rank <= 13; rank++) {
    const id = `rank_${rank}`;
    if (notified.includes(id)) continue;
    const recipes = GameData.recipes.filter(r => r.rank === rank);
    if (recipes.length > 0 && recipes.every(r => alreadyOwned(r.id, p))) {
      notified.push(id);
      App.save();
      showAchievementPopup(`Rank ${rank} 全装備作成`);
      break;
    }
  }

  const allId = "all_crafted";
  if (!notified.includes(allId) && GameData.recipes.every(r => alreadyOwned(r.id, p))) {
    notified.push(allId);
    App.save();
    showAchievementPopup("全装備作成");
  }
}

function craftItem(recipeId) {
  const recipe = GameData.recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  const p = App.player;

  if (alreadyOwned(recipeId, p)) return;
  if (!canCraftRecipe(recipe, p.materials)) return;

  // Consume materials
  for (const [id, qty] of Object.entries(recipe.materials)) {
    p.materials[id] -= qty;
  }

  // Add to inventory (create item instance)
  const item = {
    id:       recipe.id,
    name:     recipe.name,
    icon:     recipe.icon,
    image:    recipe.image || null,
    category: recipe.category,
    type:     recipe.type,
    stats:    recipe.stats,
    statDesc: recipe.statDesc,
  };
  p.inventory.push(item);
  App.save();
  checkCraftAchievements();
  const seMap = { weapon: "buki.wav", armor: "bougu.wav", accessory: "bougu.wav" };
  App.playSe(seMap[recipe.category] || "item.wav");
}

function craftPotion(potionId) {
  const rec = GameData.alchemy.find(r => r.id === potionId);
  if (!rec) return;
  const p = App.player;
  if (!Object.entries(rec.materials).every(([id, qty]) => (p.materials[id] || 0) >= qty)) return;
  for (const [id, qty] of Object.entries(rec.materials)) p.materials[id] -= qty;
  p.items[potionId] = (p.items[potionId] || 0) + 1;
  App.save();
  App.playSe("item.wav");
}

function equipItem(itemId) {
  const p    = App.player;
  const item = p.inventory.find(i => i.id === itemId);
  if (!item) return;

  // Unequip current in same slot
  const prev = p.equip[item.category];
  if (prev) p.inventory.push(prev);

  // Remove item from inventory
  const idx = p.inventory.findIndex(i => i.id === itemId);
  if (idx !== -1) p.inventory.splice(idx, 1);

  p.equip[item.category] = item;
  const es1 = calcEquipStats(p);
  p.hp = p.hpMax + es1.hp;
  p.mp = p.mpMax + es1.mp;
  App.save();
  App.playSe("equip.mp3");
}

function unequipItem(slot) {
  const p    = App.player;
  const item = p.equip[slot];
  if (!item) return;

  p.inventory.push(item);
  p.equip[slot] = null;
  const es2 = calcEquipStats(p);
  p.hp = p.hpMax + es2.hp;
  p.mp = p.mpMax + es2.mp;
  App.save();
  App.playSe("equip.mp3");
}

function upgradeSkill(skillId) {
  const sk = GameData.skills[skillId];
  const p  = App.player;
  const lv = p.skills[skillId] || 0;

  if (lv >= sk.maxLevel) return;
  const req = sk.requires;
  if (req) {
    if (req.playerLv && p.lv < req.playerLv) return;
    if (req.skill && (p.skills[req.skill] || 0) < req.lv) return;
  }
  const cost = sk.upgradeCosts[lv]; // lv=0→習得, lv=1+→強化
  if (p.money < cost) return;

  p.money -= cost;
  p.skills[skillId] = lv + 1;
  App.save();
  App.playSe("coindrop.wav");
}

function levelUp() {
  const p = App.player;
  const cost = getLvUpCost(p.lv);
  if (p.money < cost) return;

  p.money -= cost;
  p.lv++;
  p.hpMax += 10;
  p.mpMax += 3;
  p.str += 2;
  p.def += 1;
  p.agi += 1;
  const esLv = calcEquipStats(p);
  p.hp = p.hpMax + esLv.hp;
  p.mp = p.mpMax + esLv.mp;
  App.save();
  App.playSe("levelup.mp3");
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", () => App.init());
