// ===== Game Data =====

const GameData = {

  // ----- Player initial state -----
  playerDefault: {
    name: "勇者",
    lv: 1,
    money: 0,
    hp: 100,
    hpMax: 100,
    mp: 30,
    mpMax: 30,
    str: 10,
    def: 5,
    agi: 8,
    equip: {
      weapon:    null,
      armor:     null,
      accessory: null,
    },
    inventory: [],
    materials: {
      wood:           0,
      iron:           0,
      magicStone:     0,
      forestKingHorn: 0,
      ancientCore:    0,
      rockDrakeScale: 0,
      crystalHeart:   0,
      ancientTablet:  0,
      phantomFeather: 0,
      phoenixAsh:     0,
      wyvernScale:    0,
      abyssalFang:    0,
      seaDragonCore:  0,
      celestialShard: 0,
      godCrystal:     0,
    },
    skills: {
      singleAttack:  0,
      multiAttack:   0,
      heal:          0,
      powerSlash:    0,
      airEdge:       0,
      healingSpring: 0,
      lastStrike:    0,
    },
    items: {
      potion:        0,
      mpPotion:      0,
      phoenixFeather: 0,
    },
  },

  // ----- Dungeons -----
  dungeons: [
    {
      id: "forest",
      name: "始まりの森",
      icon: "",
      bgColor: "url('images/danjon_1.png') center/cover no-repeat",
      recLevel: 3,
      rooms: 8,
      unlocked: true,
      description: "冒険の始まりとなる静かな森",
      enemies: ["slime", "goblin", "forestWolf"],
      boss: "forestKing",
      rareEnemy: "ancientSlime",
    },
    {
      id: "cave",
      name: "石炭の洞窟",
      icon: "",
      bgColor: "url('images/danjon_2.png') center/cover no-repeat",
      recLevel: 7,
      rooms: 10,
      unlocked: false,
      description: "暗く深い洞窟。強敵が潜む",
      enemies: ["bat", "oreGolem", "caveSpider"],
      boss: "rockDrake",
      rareEnemy: "crystalGolem",
    },
    {
      id: "ruins",
      name: "古代の遺跡",
      icon: "",
      bgColor: "url('images/danjon_3.png') center/cover no-repeat",
      recLevel: 12,
      rooms: 10,
      unlocked: false,
      description: "かつての文明が残る謎の遺跡",
      enemies: ["skeleton", "cursedKnight", "stoneGuardian"],
      boss: "ancientColossus",
      rareEnemy: "phantomScribe",
    },
    {
      id: "volcano",
      name: "炎の山岳",
      icon: "",
      bgColor: "url('images/danjon_4.png') center/cover no-repeat",
      recLevel: 20,
      rooms: 12,
      unlocked: false,
      description: "灼熱の溶岩が流れる火山地帯",
      enemies: ["fireImp", "lavaBear", "magmaSlime"],
      boss: "infernoWyvern",
      rareEnemy: "phoenixHatchling",
    },
    {
      id: "abyss",
      name: "深海の奈落",
      icon: "",
      bgColor: "url('images/danjon_5.png') center/cover no-repeat",
      recLevel: 28,
      rooms: 12,
      unlocked: false,
      description: "光も届かぬ暗黒の深海",
      enemies: ["deepFish", "seaWitch", "abyssalJelly"],
      boss: "seaDragon",
      rareEnemy: "abyssalShark",
    },
    {
      id: "sky",
      name: "天空の聖域",
      icon: "",
      bgColor: "url('images/danjon_6.png') center/cover no-repeat",
      recLevel: 40,
      rooms: 14,
      unlocked: false,
      description: "雲の上に浮かぶ神々の住まう聖地",
      enemies: ["skyKnight", "cloudDrake", "stormGiant"],
      boss: "skyGod",
      rareEnemy: "celestialPhoenix",
    },
  ],

  // ----- Enemies -----
  enemies: {
    slime: {
      id: "slime", name: "スライム", icon: "🟢", image: "images/enemy_1.png",
      lv: 1, hp: 20, mp: 0, str: 8, def: 2, agi: 3,
      exp: 10, money: [4, 10],
      drops: [{ id: "wood", rate: 0.6, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    goblin: {
      id: "goblin", name: "ゴブリン", icon: "👺", image: "images/enemy_2.png",
      lv: 2, hp: 35, mp: 0, str: 8, def: 3, agi: 7,
      exp: 18, money: [6, 14],
      drops: [{ id: "iron", rate: 0.4, qty: [1, 1] }],
      isRare: false, isBoss: false,
    },
    forestWolf: {
      id: "forestWolf", name: "フォレストウルフ", icon: "🐺", image: "images/enemy_3.png",
      lv: 3, hp: 40, mp: 0, str: 12, def: 3, agi: 12,
      exp: 28, money: [10, 19],
      drops: [{ id: "wood", rate: 0.5, qty: [1, 3] }],
      isRare: false, isBoss: false,
    },
    // --- 始まりの森 レア ---
    ancientSlime: {
      id: "ancientSlime", name: "古代スライム", icon: "💜", image: "images/enemy_4.png",
      lv: 4, hp: 60, mp: 20, str: 14, def: 6, agi: 5,
      exp: 60, money: [24, 48],
      drops: [{ id: "ancientCore", rate: 1.0, qty: [1, 1] }],
      isRare: true, isBoss: false,
    },
    // --- 始まりの森 ボス ---
    forestKing: {
      id: "forestKing", name: "森の王", icon: "🌳", image: "images/enemy_5.png",
      lv: 5, hp: 100, mp: 30, str: 18, def: 10, agi: 8,
      exp: 150, money: [60, 96],
      drops: [{ id: "forestKingHorn", rate: 1.0, qty: [1, 1] }],
      isRare: false, isBoss: true,
    },
    // --- 石炭の洞窟 通常 ---
    bat: {
      id: "bat", name: "コウモリ", icon: "🦇", image: "images/enemy_8.png",
      lv: 5, hp: 45, mp: 0, str: 14, def: 6, agi: 18,
      exp: 30, money: [10, 18],
      drops: [{ id: "iron", rate: 0.5, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    oreGolem: {
      id: "oreGolem", name: "鉱石ゴーレム", icon: "🪨", image: "images/enemy_6.png",
      lv: 6, hp: 60, mp: 0, str: 20, def: 17, agi: 2,
      exp: 55, money: [18, 30],
      drops: [{ id: "iron", rate: 0.7, qty: [2, 4] }],
      isRare: false, isBoss: false,
    },
    caveSpider: {
      id: "caveSpider", name: "ケイブスパイダー", icon: "🕷️", image: "images/enemy_9.png",
      lv: 6, hp: 50, mp: 0, str: 16, def: 8, agi: 15,
      exp: 38, money: [12, 24],
      drops: [{ id: "magicStone", rate: 0.4, qty: [1, 1] }],
      isRare: false, isBoss: false,
    },
    // --- 石炭の洞窟 レア ---
    crystalGolem: {
      id: "crystalGolem", name: "クリスタルゴーレム", icon: "🔷", image: "images/enemy_7.png",
      lv: 8, hp: 80, mp: 0, str: 24, def: 24, agi: 3,
      exp: 90, money: [48, 84],
      drops: [{ id: "crystalHeart", rate: 1.0, qty: [1, 1] }],
      isRare: true, isBoss: false,
    },
    // --- 石炭の洞窟 ボス ---
    rockDrake: {
      id: "rockDrake", name: "ロックドレイク", icon: "🦎", image: "images/enemy_10.png",
      lv: 10, hp: 250, mp: 20, str: 35, def: 19, agi: 10,
      exp: 300, money: [120, 180],
      drops: [{ id: "rockDrakeScale", rate: 1.0, qty: [1, 1] }],
      isRare: false, isBoss: true,
    },
    // --- 古代の遺跡 通常 ---
    skeleton: {
      id: "skeleton", name: "スケルトン", icon: "💀", image: "images/enemy_11.png",
      lv: 12, hp: 80, mp: 10, str: 30, def: 15, agi: 10,
      exp: 60, money: [24, 42],
      drops: [{ id: "iron", rate: 0.5, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    cursedKnight: {
      id: "cursedKnight", name: "呪いの騎士", icon: "🗡️", image: "images/enemy_13.png",
      lv: 13, hp: 100, mp: 20, str: 35, def: 18, agi: 8,
      exp: 75, money: [30, 48],
      drops: [{ id: "magicStone", rate: 0.5, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    stoneGuardian: {
      id: "stoneGuardian", name: "石像の守護者", icon: "🗿", image: "images/enemy_12.png",
      lv: 14, hp: 140, mp: 0, str: 33, def: 25, agi: 5,
      exp: 85, money: [36, 54],
      drops: [{ id: "iron", rate: 0.6, qty: [2, 3] }],
      isRare: false, isBoss: false,
    },
    // --- 古代の遺跡 レア ---
    phantomScribe: {
      id: "phantomScribe", name: "幻影の書記", icon: "👻", image: "images/enemy_14.png",
      lv: 15, hp: 160, mp: 60, str: 40, def: 20, agi: 20,
      exp: 120, money: [96, 144],
      drops: [{ id: "phantomFeather", rate: 1.0, qty: [1, 1] }],
      isRare: true, isBoss: false,
    },
    // --- 古代の遺跡 ボス ---
    ancientColossus: {
      id: "ancientColossus", name: "古代の巨像", icon: "🏛️", image: "images/enemy_15.png",
      lv: 18, hp: 600, mp: 50, str: 55, def: 35, agi: 6,
      exp: 600, money: [240, 360],
      drops: [{ id: "ancientTablet", rate: 1.0, qty: [1, 1] }],
      isRare: false, isBoss: true,
    },
    // --- 炎の山岳 通常 ---
    fireImp: {
      id: "fireImp", name: "ファイアインプ", icon: "😈", image: "images/enemy_19.png",
      lv: 20, hp: 100, mp: 20, str: 45, def: 22, agi: 18,
      exp: 90, money: [42, 66],
      drops: [{ id: "magicStone", rate: 0.5, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    lavaBear: {
      id: "lavaBear", name: "ラヴァベア", icon: "🐻", image: "images/enemy_18.png",
      lv: 22, hp: 160, mp: 0, str: 55, def: 30, agi: 8,
      exp: 120, money: [54, 78],
      drops: [{ id: "iron", rate: 0.6, qty: [2, 4] }],
      isRare: false, isBoss: false,
    },
    magmaSlime: {
      id: "magmaSlime", name: "マグマスライム", icon: "🔴", image: "images/enemy_17.png",
      lv: 21, hp: 120, mp: 10, str: 48, def: 25, agi: 12,
      exp: 100, money: [48, 72],
      drops: [{ id: "iron", rate: 0.4, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    // --- 炎の山岳 レア ---
    phoenixHatchling: {
      id: "phoenixHatchling", name: "鳳凰の雛", icon: "🦅", image: "images/enemy_16.png",
      lv: 26, hp: 250, mp: 40, str: 70, def: 35, agi: 20,
      exp: 200, money: [120, 192],
      drops: [{ id: "phoenixAsh", rate: 1.0, qty: [1, 1] }],
      isRare: true, isBoss: false,
    },
    // --- 炎の山岳 ボス ---
    infernoWyvern: {
      id: "infernoWyvern", name: "インフェルノワイバーン", icon: "🐉", image: "images/enemy_20.png",
      lv: 30, hp: 1200, mp: 40, str: 80, def: 50, agi: 14,
      exp: 1000, money: [420, 600],
      drops: [{ id: "wyvernScale", rate: 1.0, qty: [1, 1] }],
      isRare: false, isBoss: true,
    },
    // --- 深海の奈落 通常 ---
    deepFish: {
      id: "deepFish", name: "ディープフィッシュ", icon: "🐟", image: "images/enemy_22.png",
      lv: 30, hp: 220, mp: 0, str: 65, def: 35, agi: 20,
      exp: 150, money: [72, 108],
      drops: [{ id: "magicStone", rate: 0.5, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    seaWitch: {
      id: "seaWitch", name: "シーウィッチ", icon: "🧙", image: "images/enemy_21.png",
      lv: 32, hp: 180, mp: 60, str: 75, def: 30, agi: 16,
      exp: 180, money: [84, 120],
      drops: [{ id: "magicStone", rate: 0.6, qty: [2, 3] }],
      isRare: false, isBoss: false,
    },
    abyssalJelly: {
      id: "abyssalJelly", name: "アビサルジェリー", icon: "🪼", image: "images/enemy_23.png",
      lv: 31, hp: 250, mp: 0, str: 60, def: 45, agi: 6,
      exp: 160, money: [78, 114],
      drops: [{ id: "iron", rate: 0.4, qty: [1, 2] }],
      isRare: false, isBoss: false,
    },
    // --- 深海の奈落 レア ---
    abyssalShark: {
      id: "abyssalShark", name: "アビサルシャーク", icon: "🦈", image: "images/enemy_25.png",
      lv: 36, hp: 400, mp: 0, str: 100, def: 55, agi: 25,
      exp: 300, money: [180, 264],
      drops: [{ id: "abyssalFang", rate: 1.0, qty: [1, 1] }],
      isRare: true, isBoss: false,
    },
    // --- 深海の奈落 ボス ---
    seaDragon: {
      id: "seaDragon", name: "シードラゴン", icon: "🐲", image: "images/enemy_24.png",
      lv: 42, hp: 1500, mp: 60, str: 135, def: 80, agi: 18,
      exp: 1500, money: [720, 1080],
      drops: [{ id: "seaDragonCore", rate: 1.0, qty: [1, 1] }],
      isRare: false, isBoss: true,
    },
    // --- 天空の聖域 通常 ---
    skyKnight: {
      id: "skyKnight", name: "スカイナイト", icon: "🛡️", image: "images/enemy_26.png",
      lv: 42, hp: 250, mp: 20, str: 160, def: 70, agi: 22,
      exp: 240, money: [120, 180],
      drops: [{ id: "iron", rate: 0.5, qty: [2, 4] }],
      isRare: false, isBoss: false,
    },
    cloudDrake: {
      id: "cloudDrake", name: "クラウドドレイク", icon: "🌩️", image: "images/enemy_27.png",
      lv: 46, hp: 280, mp: 30, str: 190, def: 65, agi: 30,
      exp: 300, money: [156, 228],
      drops: [{ id: "magicStone", rate: 0.6, qty: [2, 4] }],
      isRare: false, isBoss: false,
    },
    stormGiant: {
      id: "stormGiant", name: "ストームジャイアント", icon: "⚡", image: "images/enemy_28.png",
      lv: 44, hp: 400, mp: 0, str: 140, def: 100, agi: 12,
      exp: 270, money: [144, 204],
      drops: [{ id: "magicStone", rate: 0.5, qty: [2, 3] }],
      isRare: false, isBoss: false,
    },
    // --- 天空の聖域 レア ---
    celestialPhoenix: {
      id: "celestialPhoenix", name: "天界鳳凰", icon: "✨", image: "images/enemy_29.png",
      lv: 50, hp: 600, mp: 80, str: 150, def: 90, agi: 30,
      exp: 500, money: [300, 420],
      drops: [{ id: "celestialShard", rate: 1.0, qty: [1, 1] }],
      isRare: true, isBoss: false,
    },
    // --- 天空の聖域 ボス ---
    skyGod: {
      id: "skyGod", name: "天空神", icon: "👑", image: "images/enemy_30.png",
      lv: 58, hp: 2800, mp: 80, str: 180, def: 100, agi: 22,
      exp: 2500, money: [1200, 1800],
      drops: [{ id: "godCrystal", rate: 1.0, qty: [1, 1] }],
      isRare: false, isBoss: true,
    },
  },

  // ----- Skills -----
  skills: {
    singleAttack: {
      id: "singleAttack",
      image: "images/skill_1.png",
      name: "強撃",
      icon: "⚔️",
      description: "1体にSTR×130%ダメージ",
      mpCost: 5,
      type: "attack_single",
      multiplier: 1.3,
      maxLevel: 5,
      upgradeCosts: [50, 150, 400, 800, 1500],
    },
    multiAttack: {
      id: "multiAttack",
      image: "images/skill_2.png",
      name: "乱舞",
      icon: "💫",
      description: "全体にSTR×60%ダメージ",
      mpCost: 10,
      type: "attack_all",
      multiplier: 0.6,
      maxLevel: 5,
      upgradeCosts: [80, 200, 500, 1000, 2000],
    },
    heal: {
      id: "heal",
      image: "images/skill_3.png",
      name: "回復",
      icon: "💚",
      description: "HPを回復",
      mpCost: 8,
      type: "heal",
      healBase: 30,
      healPerLevel: 15,
      maxLevel: 5,
      upgradeCosts: [60, 180, 450, 900, 1800],
    },
    powerSlash: {
      id: "powerSlash",
      image: "images/skill_4.png",
      name: "パワースラッシュ",
      icon: "🗡️",
      description: "1体にSTR×180%ダメージ",
      mpCost: 7,
      type: "attack_single",
      multiplier: 1.8,
      multiplierPerLv: 0.15,
      maxLevel: 5,
      upgradeCosts: [3000, 3600, 4200, 4800, 5400],
      requires: { skill: "singleAttack", lv: 5 },
    },
    airEdge: {
      id: "airEdge",
      image: "images/skill_5.png",
      name: "エアエッジ",
      icon: "🌪️",
      description: "全体にSTR×90%ダメージ",
      mpCost: 12,
      type: "attack_all",
      multiplier: 0.9,
      multiplierPerLv: 0.1,
      maxLevel: 5,
      upgradeCosts: [3500, 2500, 3400, 4800, 6000],
      requires: { skill: "multiAttack", lv: 5 },
    },
    lastStrike: {
      id: "lastStrike",
      image: "images/skill_7.png",
      name: "覚悟の一撃",
      icon: "💢",
      description: "1体にSTR×250%。必ず最後の攻撃になる",
      mpCost: 12,
      type: "attack_last",
      multiplier: 2.5,
      maxLevel: 5,
      upgradeCosts: [4000, 3000, 4500, 6000, 7500],
      requires: { playerLv: 30 },
    },
    healingSpring: {
      id: "healingSpring",
      image: "images/skill_6.png",
      name: "回復の泉",
      icon: "💧",
      description: "HPを%回復",
      mpCost: 11,
      type: "heal",
      healPct: 0.30,
      healPctPerLv: 0.05,
      maxLevel: 5,
      upgradeCosts: [4000, 2500, 3400, 4800, 6000],
      requires: { skill: "heal", lv: 5 },
    },
  },

  // ----- Equipment Recipes (Smithing) -----
  // rank: 1-7 (weapon/armor), 0 = accessory (no rank)
  recipes: [

    // ===== Rank 1: 基本素材のみ =====
    { rank: 1, id: "sword_r1",       name: "木の剣",     icon: "🗡️", image: "images/buki_1.png", category: "weapon",    type: "power",
      stats: { str: 4 },             statDesc: "STR +4",
      materials: { wood: 3 } },
    { rank: 1, id: "staff_r1",       name: "木の杖",     icon: "🪄", image: "images/buki_2.png", category: "weapon",    type: "magic",
      stats: { str: 2, mp: 10 },     statDesc: "STR +2 / MP +10",
      materials: { wood: 3 } },
    { rank: 1, id: "heavy_r1",       name: "革の鎧",     icon: "🛡️", image: "images/bougu_1.png", category: "armor",     type: "heavy",
      stats: { def: 2 },             statDesc: "DEF +2",
      materials: { wood: 3 } },
    { rank: 1, id: "life_r1",        name: "布の衣",     icon: "👘", image: "images/bougu_2.png", category: "armor",     type: "life",
      stats: { def: 1, hp: 15 },     statDesc: "DEF +1 / HP +15",
      materials: { wood: 3 } },

    // ===== Rank 2: + 古代の核（D1レア） =====
    { rank: 2, id: "sword_r2",       name: "鉄の剣",     icon: "⚔️", image: "images/buki_3.png", category: "weapon",    type: "power",
      stats: { str: 8 },             statDesc: "STR +8",
      materials: { iron: 3, magicStone: 1, ancientCore: 1 } },
    { rank: 2, id: "staff_r2",       name: "鉄の杖",     icon: "🪄", image: "images/buki_4.png", category: "weapon",    type: "magic",
      stats: { str: 3, mp: 20 },     statDesc: "STR +3 / MP +20",
      materials: { iron: 3, magicStone: 1, ancientCore: 1 } },
    { rank: 2, id: "heavy_r2",       name: "鉄の鎧",     icon: "🛡️", image: "images/bougu_3.png", category: "armor",     type: "heavy",
      stats: { def: 4 },             statDesc: "DEF +4",
      materials: { iron: 3, magicStone: 1, ancientCore: 1 } },
    { rank: 2, id: "life_r2",        name: "鉄の衣",     icon: "👘", image: "images/bougu_4.png", category: "armor",     type: "life",
      stats: { def: 2, hp: 30 },     statDesc: "DEF +2 / HP +30",
      materials: { iron: 3, magicStone: 1, ancientCore: 1 } },

    // ===== Rank 3: + 森王の角（D1ボス） =====
    { rank: 3, id: "sword_r3",       name: "森王の剣",   icon: "🌳", image: "images/buki_5.png", category: "weapon",    type: "power",
      stats: { str: 13 },            statDesc: "STR +13",
      materials: { iron: 4, magicStone: 2, forestKingHorn: 1 } },
    { rank: 3, id: "staff_r3",       name: "森王の杖",   icon: "🪄", image: "images/buki_6.png", category: "weapon",    type: "magic",
      stats: { str: 5, mp: 32 },     statDesc: "STR +5 / MP +32",
      materials: { iron: 4, magicStone: 2, forestKingHorn: 1 } },
    { rank: 3, id: "heavy_r3",       name: "森王の鎧",   icon: "🛡️", image: "images/bougu_5.png", category: "armor",     type: "heavy",
      stats: { def: 13 },            statDesc: "DEF +13",
      materials: { iron: 4, magicStone: 2, forestKingHorn: 1 } },
    { rank: 3, id: "life_r3",        name: "森王の衣",   icon: "👘", image: "images/bougu_6.png", category: "armor",     type: "life",
      stats: { def: 5, hp: 80 },     statDesc: "DEF +5 / HP +80",
      materials: { iron: 4, magicStone: 2, forestKingHorn: 1 } },

    // ===== Rank 4: + 水晶の心臓（D2レア） =====
    { rank: 4, id: "sword_r4",       name: "水晶の剣",   icon: "🔷", image: "images/buki_7.png", category: "weapon",    type: "power",
      stats: { str: 19 },            statDesc: "STR +19",
      materials: { iron: 3, magicStone: 3, crystalHeart: 1 } },
    { rank: 4, id: "staff_r4",       name: "水晶の杖",   icon: "🪄", image: "images/buki_8.png", category: "weapon",    type: "magic",
      stats: { str: 7, mp: 46 },     statDesc: "STR +7 / MP +46",
      materials: { iron: 3, magicStone: 3, crystalHeart: 1 } },
    { rank: 4, id: "heavy_r4",       name: "水晶の鎧",   icon: "🛡️", image: "images/bougu_7.png", category: "armor",     type: "heavy",
      stats: { def: 19 },            statDesc: "DEF +19",
      materials: { iron: 3, magicStone: 3, crystalHeart: 1 } },
    { rank: 4, id: "life_r4",        name: "水晶の衣",   icon: "👘", image: "images/bougu_8.png", category: "armor",     type: "life",
      stats: { def: 7, hp: 115 },    statDesc: "DEF +7 / HP +115",
      materials: { iron: 3, magicStone: 3, crystalHeart: 1 } },

    // ===== Rank 5: + 岩竜の鱗（D2ボス） =====
    { rank: 5, id: "sword_r5",       name: "岩竜の剣",   icon: "🦎", image: "images/buki_9.png", category: "weapon",    type: "power",
      stats: { str: 26 },            statDesc: "STR +26",
      materials: { iron: 4, magicStone: 3, rockDrakeScale: 1 } },
    { rank: 5, id: "staff_r5",       name: "岩竜の杖",   icon: "🪄", image: "images/buki_10.png", category: "weapon",    type: "magic",
      stats: { str: 10, mp: 63 },    statDesc: "STR +10 / MP +63",
      materials: { iron: 4, magicStone: 3, rockDrakeScale: 1 } },
    { rank: 5, id: "heavy_r5",       name: "岩竜の鎧",   icon: "🛡️", image: "images/bougu_9.png", category: "armor",     type: "heavy",
      stats: { def: 23 },            statDesc: "DEF +23",
      materials: { iron: 4, magicStone: 3, rockDrakeScale: 1 } },
    { rank: 5, id: "life_r5",        name: "岩竜の衣",   icon: "👘", image: "images/bougu_10.png", category: "armor",     type: "life",
      stats: { def: 10, hp: 155 },   statDesc: "DEF +10 / HP +155",
      materials: { iron: 4, magicStone: 3, rockDrakeScale: 1 } },

    // ===== Rank 6: + 幻影の羽根（D3レア） =====
    { rank: 6, id: "sword_r6",       name: "幻影の剣",   icon: "👻", image: "images/buki_11.png", category: "weapon",    type: "power",
      stats: { str: 31 },            statDesc: "STR +31",
      materials: { iron: 3, magicStone: 5, phantomFeather: 1 } },
    { rank: 6, id: "staff_r6",       name: "幻影の杖",   icon: "🪄", image: "images/buki_12.png", category: "weapon",    type: "magic",
      stats: { str: 14, mp: 82 },    statDesc: "STR +14 / MP +82",
      materials: { iron: 3, magicStone: 5, phantomFeather: 1 } },
    { rank: 6, id: "heavy_r6",       name: "幻影の鎧",   icon: "🛡️", image: "images/bougu_11.png", category: "armor",     type: "heavy",
      stats: { def: 31 },            statDesc: "DEF +31",
      materials: { iron: 3, magicStone: 5, phantomFeather: 1 } },
    { rank: 6, id: "life_r6",        name: "幻影の衣",   icon: "👘", image: "images/bougu_12.png", category: "armor",     type: "life",
      stats: { def: 14, hp: 200 },   statDesc: "DEF +14 / HP +200",
      materials: { iron: 3, magicStone: 5, phantomFeather: 1 } },

    // ===== Rank 7: + 古代の石板（D3ボス） =====
    { rank: 7, id: "sword_r7",       name: "古代の大剣", icon: "📜", image: "images/buki_13.png", category: "weapon",    type: "power",
      stats: { str: 40 },            statDesc: "STR +40",
      materials: { iron: 5, magicStone: 5, ancientTablet: 1 } },
    { rank: 7, id: "staff_r7",       name: "古代の魔杖", icon: "🪄", image: "images/buki_14.png", category: "weapon",    type: "magic",
      stats: { str: 19, mp: 104 },   statDesc: "STR +19 / MP +104",
      materials: { iron: 5, magicStone: 5, ancientTablet: 1 } },
    { rank: 7, id: "heavy_r7",       name: "古代の石鎧", icon: "🛡️", image: "images/bougu_13.png", category: "armor",     type: "heavy",
      stats: { def: 40 },            statDesc: "DEF +40",
      materials: { iron: 5, magicStone: 5, ancientTablet: 1 } },
    { rank: 7, id: "life_r7",        name: "古代の聖衣", icon: "👘", image: "images/bougu_14.png", category: "armor",     type: "life",
      stats: { def: 19, hp: 250 },   statDesc: "DEF +19 / HP +250",
      materials: { iron: 5, magicStone: 5, ancientTablet: 1 } },

    // ===== Rank 8: + 鳳凰の灰（D4レア） =====
    { rank: 8, id: "sword_r8",       name: "鳳凰の剣",   icon: "🔥", image: "images/buki_15.png", category: "weapon",    type: "power",
      stats: { str: 53 },            statDesc: "STR +53",
      materials: { iron: 5, magicStone: 6, phoenixAsh: 1 } },
    { rank: 8, id: "staff_r8",       name: "鳳凰の杖",   icon: "🪄", image: "images/buki_16.png", category: "weapon",    type: "magic",
      stats: { str: 25, mp: 129 },   statDesc: "STR +25 / MP +129",
      materials: { iron: 5, magicStone: 6, phoenixAsh: 1 } },
    { rank: 8, id: "heavy_r8",       name: "鳳凰の鎧",   icon: "🛡️", image: "images/bougu_15.png", category: "armor",     type: "heavy",
      stats: { def: 53 },            statDesc: "DEF +53",
      materials: { iron: 5, magicStone: 6, phoenixAsh: 1 } },
    { rank: 8, id: "life_r8",        name: "鳳凰の衣",   icon: "👘", image: "images/bougu_16.png", category: "armor",     type: "life",
      stats: { def: 25, hp: 305 },   statDesc: "DEF +25 / HP +305",
      materials: { iron: 5, magicStone: 6, phoenixAsh: 1 } },

    // ===== Rank 9: + 炎竜の鱗（D4ボス） =====
    { rank: 9, id: "sword_r9",       name: "炎竜の剣",   icon: "🐉", image: "images/buki_17.png", category: "weapon",    type: "power",
      stats: { str: 64 },            statDesc: "STR +64",
      materials: { iron: 6, magicStone: 6, wyvernScale: 1 } },
    { rank: 9, id: "staff_r9",       name: "炎竜の杖",   icon: "🪄", image: "images/buki_18.png", category: "weapon",    type: "magic",
      stats: { str: 32, mp: 157 },   statDesc: "STR +32 / MP +157",
      materials: { iron: 6, magicStone: 6, wyvernScale: 1 } },
    { rank: 9, id: "heavy_r9",       name: "炎竜の鎧",   icon: "🛡️", image: "images/bougu_17.png", category: "armor",     type: "heavy",
      stats: { def: 64 },            statDesc: "DEF +64",
      materials: { iron: 6, magicStone: 6, wyvernScale: 1 } },
    { rank: 9, id: "life_r9",        name: "炎竜の衣",   icon: "👘", image: "images/bougu_18.png", category: "armor",     type: "life",
      stats: { def: 32, hp: 365 },   statDesc: "DEF +32 / HP +365",
      materials: { iron: 6, magicStone: 6, wyvernScale: 1 } },

    // ===== Rank 10: + 深淵の牙（D5レア） =====
    { rank: 10, id: "sword_r10",     name: "深淵の剣",   icon: "🦈", image: "images/buki_19.png", category: "weapon",    type: "power",
      stats: { str: 76 },            statDesc: "STR +76",
      materials: { iron: 6, magicStone: 7, abyssalFang: 1 } },
    { rank: 10, id: "staff_r10",     name: "深淵の杖",   icon: "🪄", image: "images/buki_20.png", category: "weapon",    type: "magic",
      stats: { str: 40, mp: 188 },   statDesc: "STR +40 / MP +188",
      materials: { iron: 6, magicStone: 7, abyssalFang: 1 } },
    { rank: 10, id: "heavy_r10",     name: "深淵の鎧",   icon: "🛡️", image: "images/bougu_19.png", category: "armor",     type: "heavy",
      stats: { def: 76 },            statDesc: "DEF +76",
      materials: { iron: 6, magicStone: 7, abyssalFang: 1 } },
    { rank: 10, id: "life_r10",      name: "深淵の衣",   icon: "👘", image: "images/bougu_20.png", category: "armor",     type: "life",
      stats: { def: 40, hp: 430 },   statDesc: "DEF +40 / HP +430",
      materials: { iron: 6, magicStone: 7, abyssalFang: 1 } },

    // ===== Rank 11: + 海竜の核（D5ボス） =====
    { rank: 11, id: "sword_r11",     name: "海竜の剣",   icon: "🐲", image: "images/buki_21.png", category: "weapon",    type: "power",
      stats: { str: 85 },            statDesc: "STR +85",
      materials: { iron: 7, magicStone: 7, seaDragonCore: 1 } },
    { rank: 11, id: "staff_r11",     name: "海竜の杖",   icon: "🪄", image: "images/buki_22.png", category: "weapon",    type: "magic",
      stats: { str: 49, mp: 222 },   statDesc: "STR +49 / MP +222",
      materials: { iron: 7, magicStone: 7, seaDragonCore: 1 } },
    { rank: 11, id: "heavy_r11",     name: "海竜の鎧",   icon: "🛡️", image: "images/bougu_21.png", category: "armor",     type: "heavy",
      stats: { def: 89 },            statDesc: "DEF +89",
      materials: { iron: 7, magicStone: 7, seaDragonCore: 1 } },
    { rank: 11, id: "life_r11",      name: "海竜の衣",   icon: "👘", image: "images/bougu_22.png", category: "armor",     type: "life",
      stats: { def: 49, hp: 500 },   statDesc: "DEF +49 / HP +500",
      materials: { iron: 7, magicStone: 7, seaDragonCore: 1 } },

    // ===== Rank 12: + 天界の欠片（D6レア） =====
    { rank: 12, id: "sword_r12",     name: "天界の剣",   icon: "✨", image: "images/buki_23.png", category: "weapon",    type: "power",
      stats: { str: 94 },            statDesc: "STR +94",
      materials: { iron: 7, magicStone: 8, celestialShard: 1 } },
    { rank: 12, id: "staff_r12",     name: "天界の杖",   icon: "🪄", image: "images/buki_24.png", category: "weapon",    type: "magic",
      stats: { str: 59, mp: 260 },   statDesc: "STR +59 / MP +260",
      materials: { iron: 7, magicStone: 8, celestialShard: 1 } },
    { rank: 12, id: "heavy_r12",     name: "天界の鎧",   icon: "🛡️", image: "images/bougu_23.png", category: "armor",     type: "heavy",
      stats: { def: 103 },           statDesc: "DEF +103",
      materials: { iron: 7, magicStone: 8, celestialShard: 1 } },
    { rank: 12, id: "life_r12",      name: "天界の衣",   icon: "👘", image: "images/bougu_24.png", category: "armor",     type: "life",
      stats: { def: 59, hp: 580 },   statDesc: "DEF +59 / HP +580",
      materials: { iron: 7, magicStone: 8, celestialShard: 1 } },

    // ===== Rank 13: + 神の結晶（D6ボス） =====
    { rank: 13, id: "sword_r13",     name: "神域の大剣", icon: "👑", image: "images/buki_25.png", category: "weapon",    type: "power",
      stats: { str: 118 },           statDesc: "STR +118",
      materials: { iron: 8, magicStone: 8, godCrystal: 1 } },
    { rank: 13, id: "staff_r13",     name: "神域の魔杖", icon: "🪄", image: "images/buki_26.png", category: "weapon",    type: "magic",
      stats: { str: 70, mp: 302 },   statDesc: "STR +70 / MP +302",
      materials: { iron: 8, magicStone: 8, godCrystal: 1 } },
    { rank: 13, id: "heavy_r13",     name: "神域の聖鎧", icon: "🛡️", image: "images/bougu_25.png", category: "armor",     type: "heavy",
      stats: { def: 118 },           statDesc: "DEF +118",
      materials: { iron: 8, magicStone: 8, godCrystal: 1 } },
    { rank: 13, id: "life_r13",      name: "神域の聖衣", icon: "👘", image: "images/bougu_26.png", category: "armor",     type: "life",
      stats: { def: 70, hp: 660 },   statDesc: "DEF +70 / HP +660",
      materials: { iron: 8, magicStone: 8, godCrystal: 1 } },

    // ===== 装飾品（各ランク） =====
    { rank: 1,  id: "ring_hp",        name: "体力の指輪",   icon: "💍", image: "images/ring_1.png", category: "accessory", type: "hp",
      stats: { hp: 30 },                        statDesc: "HP +30",
      materials: { wood: 2, iron: 1 } },
    { rank: 2,  id: "ring_mp",        name: "魔力の指輪",   icon: "🔮", image: "images/ring_2.png", category: "accessory", type: "mp",
      stats: { mp: 20 },                        statDesc: "MP +20",
      materials: { magicStone: 2, ancientCore: 1 } },
    { rank: 3,  id: "ring_agi",       name: "疾風の指輪",   icon: "💨", image: "images/ring_3.png", category: "accessory", type: "agi",
      stats: { agi: 4 },                        statDesc: "AGI +4",
      materials: { wood: 2, magicStone: 1, forestKingHorn: 1 } },
    { rank: 4,  id: "ring_str",       name: "力の指輪",     icon: "⚡", image: "images/ring_4.png", category: "accessory", type: "str",
      stats: { str: 6 },                        statDesc: "STR +6",
      materials: { iron: 2, magicStone: 2, crystalHeart: 1 } },
    { rank: 5,  id: "ring_power",     name: "戦士の指輪",   icon: "🔶", image: "images/ring_5.png", category: "accessory", type: "power",
      stats: { hp: 60, str: 5 },               statDesc: "HP +60 / STR +5",
      materials: { iron: 3, magicStone: 2, rockDrakeScale: 1 } },
    { rank: 6,  id: "ring_magic",     name: "魔法の指輪",   icon: "🌙", image: "images/ring_6.png", category: "accessory", type: "magic",
      stats: { mp: 40, agi: 5 },               statDesc: "MP +40 / AGI +5",
      materials: { iron: 2, magicStone: 4, phantomFeather: 1 } },
    { rank: 7,  id: "ring_guardian",  name: "守護の指輪",   icon: "🔰", image: "images/ring_7.png", category: "accessory", type: "guardian",
      stats: { def: 10, hp: 80 },              statDesc: "DEF +10 / HP +80",
      materials: { iron: 4, magicStone: 3, ancientTablet: 1 } },
    { rank: 8,  id: "ring_phoenix",   name: "鳳凰の指輪",   icon: "🔥", image: "images/ring_8.png", category: "accessory", type: "phoenix",
      stats: { hp: 100, str: 8 },              statDesc: "HP +100 / STR +8",
      materials: { iron: 4, magicStone: 4, phoenixAsh: 1 } },
    { rank: 9,  id: "ring_wyvern",    name: "炎竜の指輪",   icon: "🐉", image: "images/ring_9.png", category: "accessory", type: "wyvern",
      stats: { str: 12, def: 8 },              statDesc: "STR +12 / DEF +8",
      materials: { iron: 5, magicStone: 4, wyvernScale: 1 } },
    { rank: 10, id: "ring_abyss",     name: "深淵の指輪",   icon: "🦈", image: "images/ring_10.png", category: "accessory", type: "abyss",
      stats: { hp: 150, mp: 60 },              statDesc: "HP +150 / MP +60",
      materials: { iron: 5, magicStone: 5, abyssalFang: 1 } },
    { rank: 11, id: "ring_sea",       name: "海竜の指輪",   icon: "🐲", image: "images/ring_11.png", category: "accessory", type: "sea",
      stats: { str: 15, agi: 8 },              statDesc: "STR +15 / AGI +8",
      materials: { iron: 6, magicStone: 5, seaDragonCore: 1 } },
    { rank: 12, id: "ring_celestial", name: "天界の指輪",   icon: "✨", image: "images/ring_12.png", category: "accessory", type: "celestial",
      stats: { def: 20, mp: 80, hp: 200 },     statDesc: "DEF +20 / MP +80 / HP +200",
      materials: { iron: 6, magicStone: 6, celestialShard: 1 } },
    { rank: 13, id: "ring_god",       name: "神域の指輪",   icon: "👑", image: "images/ring_13.png", category: "accessory", type: "god",
      stats: { str: 20, def: 20, hp: 200, mp: 80, agi: 10 }, statDesc: "STR +20 / DEF +20 / HP +200 / MP +80 / AGI +10",
      materials: { iron: 8, magicStone: 6, godCrystal: 1 } },
  ],

  // ----- Alchemy Recipes -----
  alchemy: [
    { id: "potion",   name: "ポーション",   icon: "🧪", image: "images/item_1.png",
      desc: "HP 30% 回復",   effect: { type: "hp", pct: 0.30 },
      materials: { wood: 1, iron: 1 } },
    { id: "mpPotion", name: "MPポーション", icon: "💙", image: "images/item_2.png",
      desc: "MP 40% 回復",   effect: { type: "mp", pct: 0.40 },
      materials: { wood: 1, iron: 2, magicStone: 1 } },
    { id: "phoenixFeather", name: "鳳凰の羽", icon: "🪶", image: "images/item_3.png",
      desc: "死亡時HP30%で復活（自動発動・1回）", effect: { type: "revive", pct: 0.30 },
      materials: { phoenixAsh: 1, magicStone: 5 } },
  ],

  // ----- Material definitions -----
  materials: {
    // 共通素材
    wood:           { id: "wood",           name: "木材",         icon: "🪵", image: "images/sozai_1.png", rare: false },
    iron:           { id: "iron",           name: "鉄",           icon: "⚙️", image: "images/sozai_2.png", rare: false },
    magicStone:     { id: "magicStone",     name: "魔石",         icon: "💎", image: "images/sozai_3.png", rare: false },
    // 固有素材（始まりの森）
    forestKingHorn: { id: "forestKingHorn", name: "森王の角",     icon: "🌳", image: "images/sozai_4.png", rare: true },
    ancientCore:    { id: "ancientCore",    name: "古代の核",     icon: "🫧", image: "images/sozai_5.png", rare: true },
    // 固有素材（石炭の洞窟）
    rockDrakeScale: { id: "rockDrakeScale", name: "岩竜の鱗",     icon: "🦎", image: "images/sozai_6.png", rare: true },
    crystalHeart:   { id: "crystalHeart",   name: "水晶の心臓",   icon: "🔷", image: "images/sozai_7.png", rare: true },
    // 固有素材（古代の遺跡）
    ancientTablet:  { id: "ancientTablet",  name: "古代の石板",   icon: "📜", image: "images/sozai_8.png",  rare: true },
    phantomFeather: { id: "phantomFeather", name: "幻影の羽根",   icon: "👻", image: "images/sozai_9.png",  rare: true },
    // 固有素材（炎の山岳）
    phoenixAsh:     { id: "phoenixAsh",     name: "鳳凰の灰",     icon: "🔥", image: "images/sozai_11.png", rare: true },
    wyvernScale:    { id: "wyvernScale",    name: "炎竜の鱗",     icon: "🐉", image: "images/sozai_10.png", rare: true },
    // 固有素材（深海の奈落）
    abyssalFang:    { id: "abyssalFang",    name: "深淵の牙",     icon: "🦈", image: "images/sozai_13.png", rare: true },
    seaDragonCore:  { id: "seaDragonCore",  name: "海竜の核",     icon: "🐲", image: "images/sozai_12.png", rare: true },
    // 固有素材（天空の聖域）
    celestialShard: { id: "celestialShard", name: "天界の欠片",   icon: "✨", image: "images/sozai_15.png", rare: true },
    godCrystal:     { id: "godCrystal",     name: "神の結晶",     icon: "👑", image: "images/sozai_14.png", rare: true },
  },
};

// ----- Save / Load -----
const Save = {
  KEY: "pocketAdventure_save",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state.player.items) state.player.items = { potion: 0, mpPotion: 0, phoenixFeather: 0 };
      if (!('phoenixFeather' in state.player.items)) state.player.items.phoenixFeather = 0;
      if (!state.achievements) state.achievements = [];
      if (!state.clearedDungeons) state.clearedDungeons = [];
      if (!state.player.skills) state.player.skills = {};
      if (!state.player.materials) state.player.materials = {};
      const defaultSkills = GameData.playerDefault.skills;
      for (const id of Object.keys(defaultSkills)) {
        if (!(id in state.player.skills)) state.player.skills[id] = 0;
      }
      return state;
    } catch { return null; }
  },

  save(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Save failed:", e);
    }
  },

  newGame() {
    const p = JSON.parse(JSON.stringify(GameData.playerDefault));
    return { player: p, clearedDungeons: [], achievements: [] };
  },
};

function getLvUpCost(lv) {
  return lv * 100;
}
