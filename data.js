/* =========================================================
   青春集市 · 比思睿生活驿站 — data.js
   数据层：站点信息 / 分类 / 分区 / 档口 / 地图点位 / 反馈配置
   方位坐标为用户确认的真实空间分布（x、y 为地图画布百分比，左上为原点）
   ========================================================= */

window.CANTEEN_DATA = {

  /* ---------- 站点信息 ---------- */
  site: {
    name: "青春集市",
    subName: "比思睿生活驿站",
    campus: "大连理工大学盘锦校区",
    building: "第三食堂",
    location: "B03",
    disclaimer: "具体菜品、价格、营业时间与活动以食堂现场公示为准。"
  },

  /* ---------- 档口分类 ---------- */
  categories: [
    { id: "all",     name: "全部" },
    { id: "burger",  name: "汉堡" },
    { id: "noodle",  name: "米线" },
    { id: "bakery",  name: "烘焙" },
    { id: "tea",     name: "奶茶" },
    { id: "coffee",  name: "咖啡" },
    { id: "roll",    name: "卷饼" },
    { id: "huangmen",name: "黄焖鸡" },
    { id: "rice",    name: "米饭" },
    { id: "store",   name: "便利店" },
    { id: "snack",   name: "炸鸡小吃" }
  ],

  /* ---------- 地图分区（rect 为画布百分比；labelPos 为分区标签位置） ---------- */
  zones: {
    north:  { name: "北门·简餐区",   short: "北门",       labelPos: "top-right",    rect: { x: 3,  y: 2,  w: 94, h: 21 } },
    east:   { name: "东门·服务区",   short: "东门",       labelPos: "bottom-right", rect: { x: 76, y: 24, w: 21, h: 74 } },
    west:   { name: "西侧·文化区",   short: "西侧文化区", labelPos: "top-right",    rect: { x: 3,  y: 24, w: 23, h: 74 } },
    center: { name: "中部·交流区",   short: "中部交流区", labelPos: "top-right",    rect: { x: 28, y: 24, w: 46, h: 74 } }
  },

  /* ---------- 出入口（edge: top/right/left；x/y 为百分比） ---------- */
  doors: [
    { id: "north", name: "北门", edge: "top",   x: 18 },
    { id: "east",  name: "东门", edge: "right", y: 25 },
    { id: "west",  name: "西门", edge: "left",  y: 71 }
  ],

  /* ---------- 分区内的功能区域（纯标注，无交互） ---------- */
  areaBlocks: [
    { id: "dining",  name: "就餐区", zoneId: "east", rect: { x: 78, y: 45, w: 17, h: 13 } },
    { id: "seminar", name: "研讨室", zoneId: "east", rect: { x: 78, y: 67, w: 17, h: 13 } }
  ],

  /* ---------- 地图地标（无照片，纯标注） ---------- */
  landmarks: [
    { id: "sculpture", name: "雕塑", zoneId: "west", pos: { x: 10, y: 80 } }
  ],

  /* ---------- 档口列表 ---------- */
  stalls: [
    {
      id: "kfc",
      name: "肯德基",
      short: "肯德基",
      categoryId: "burger",
      zoneId: "north",
      desc: "快餐连锁品牌，位于北门简餐区，炸鸡、汉堡与经典套餐现点现做。",
      photo: { jpg: "assets/stall-kfc.jpg", webp: "assets/stall-kfc.webp", alt: "肯德基门店内景" },
      menu: null,
      pos: { x: 31, y: 14 }
    },
    {
      id: "huangmen",
      name: "黄焖鸡米饭",
      short: "黄焖鸡",
      categoryId: "huangmen",
      zoneId: "north",
      desc: "黄焖鸡米饭档口，鸡肉浓汤现焖，配米饭食用，位于北门简餐区。",
      photo: { jpg: "assets/stall-huangmen.jpg", webp: "assets/stall-huangmen.webp", alt: "黄焖鸡米饭档口" },
      menu: null,
      pos: { x: 50, y: 14 }
    },
    {
      id: "chicken",
      name: "鸡柳大人",
      short: "鸡柳大人",
      categoryId: "snack",
      zoneId: "north",
      desc: "炸鸡小吃档口，鸡柳等炸物现炸现售，位于北门简餐区。",
      photo: { jpg: "assets/stall-chicken.jpg", webp: "assets/stall-chicken.webp", alt: "鸡柳大人档口" },
      menu: null,
      pos: { x: 69, y: 14 }
    },
    {
      id: "mixue",
      name: "蜜雪冰城",
      short: "蜜雪冰城",
      categoryId: "tea",
      zoneId: "north",
      desc: "连锁茶饮品牌，冰淇淋与经典茶饮，位于北门简餐区。",
      photo: { jpg: "assets/stall-mixue.jpg", webp: "assets/stall-mixue.webp", alt: "蜜雪冰城档口" },
      menu: null,
      pos: { x: 88, y: 14 }
    },
    {
      id: "dai",
      name: "傣巷记 · 云南小锅米线",
      short: "傣巷记",
      categoryId: "noodle",
      zoneId: "west",
      desc: "云南小锅米线档口，米线现煮现售，位于西侧文化区。",
      photo: { jpg: "assets/stall-dai.jpg", webp: "assets/stall-dai.webp", alt: "傣巷记档口" },
      menu: {
        source: "菜单整理自档口点单页面截图，价格如有变动以现场公示为准",
        sections: [
          {
            name: "小锅米线",
            items: [
              { name: "【招牌】经典肉酱米线", price: 13, hot: true },
              { name: "【生烫】鲜猪肉+肉酱米线", price: 15 },
              { name: "【牛筋丸】肉酱米线", price: 15 },
              { name: "【品质】鲜牛肉+肉酱米线", price: 17 },
              { name: "番茄鱼饼米线", price: 16 },
              { name: "番茄酥肉米线", price: 16, hot: true },
              { name: "【豪吃】豪华（鲜猪肉+鲜牛肉）肉酱米线", price: 19, hot: true },
              { name: "酸菜泡椒鱼饼米线", price: 16 },
              { name: "【劲道】肉酱酸辣宽粉", price: 14 },
              { name: "【酸辣开胃】肉酱酸辣粉", price: 14 },
              { name: "金汤酸菜鱼米线", price: 17 },
              { name: "【人气】酸菜泡椒牛肉米线", price: 17, hot: true },
              { name: "麻酱拌米线", price: 11 },
              { name: "肉酱拌米线", price: 13 }
            ]
          },
          {
            name: "加料专区",
            items: [
              { name: "豆泡一份", price: 2 },
              { name: "加一份宽粉", price: 4 },
              { name: "干豆腐丝一份", price: 2 },
              { name: "青菜一份", price: 2 },
              { name: "加一份米线", price: 2 },
              { name: "韩式鱼饼", price: 2 },
              { name: "V型鲟蟹柳", price: 2 },
              { name: "牛筋丸", price: 3 },
              { name: "小油条（2根）", price: 2, hot: true },
              { name: "包心鱼豆腐", price: 2 },
              { name: "亲亲肠一份", price: 2 },
              { name: "金针菇一份", price: 2 },
              { name: "煎蛋", price: 2, hot: true },
              { name: "肉酱（重口味加）", price: 3 },
              { name: "鲜猪肉", price: 3 },
              { name: "鲜牛肉", price: 4 }
            ]
          },
          {
            name: "芝麻烧饼",
            items: [
              { name: "麻酱烧饼", price: 4 },
              { name: "山楂烧饼", price: 4 },
              { name: "豆沙烧饼", price: 4 },
              { name: "板栗烧饼", price: 4 }
            ]
          }
        ],
        photos: [
          { jpg: "assets/menu-dai-1.jpg", webp: "assets/menu-dai-1.webp", caption: "点单页面截图 · 小锅米线" },
          { jpg: "assets/menu-dai-2.jpg", webp: "assets/menu-dai-2.webp", caption: "点单页面截图 · 加料专区与芝麻烧饼" }
        ]
      },
      pos: { x: 14, y: 35 }
    },
    {
      id: "bakery",
      name: "晴诺拾光",
      short: "晴诺拾光",
      categoryId: "bakery",
      zoneId: "west",
      desc: "烘焙档口，面包、蛋糕与点心，位于西侧文化区。",
      photo: { jpg: "assets/stall-bakery.jpg", webp: "assets/stall-bakery.webp", alt: "晴诺拾光烘焙档口" },
      menu: null,
      pos: { x: 14, y: 47 }
    },
    {
      id: "lawson",
      name: "罗森便利店",
      short: "罗森",
      categoryId: "store",
      zoneId: "center",
      desc: "便利店，便当、零食、饮品与日常用品一站购齐，位于中部交流区西北角。",
      photo: { jpg: "assets/stall-lawson.jpg", webp: "assets/stall-lawson.webp", alt: "罗森便利店门店" },
      menu: null,
      pos: { x: 31, y: 29 }
    },
    {
      id: "hamburger0090",
      name: "0090汉堡工厂",
      short: "0090",
      categoryId: "burger",
      zoneId: "west",
      desc: "汉堡专营档口，位于西侧文化区，现做汉堡与小食。",
      photo: { jpg: "assets/stall-0090.jpg", webp: "assets/stall-0090.webp", alt: "0090汉堡工厂档口" },
      menu: null,
      pos: { x: 14, y: 59 }
    },
    {
      id: "luckin",
      name: "瑞幸咖啡",
      short: "瑞幸",
      categoryId: "coffee",
      zoneId: "center",
      desc: "连锁咖啡品牌，咖啡与轻食饮品，位于中部交流区。",
      photo: { jpg: "assets/stall-luckin.jpg", webp: "assets/stall-luckin.webp", alt: "瑞幸咖啡档口" },
      menu: null,
      pos: { x: 55, y: 74 }
    },
    {
      id: "tea",
      name: "茶瀑布",
      short: "茶瀑布",
      categoryId: "tea",
      zoneId: "center",
      desc: "茶饮档口，现制茶饮，位于中部交流区东侧。",
      photo: { jpg: "assets/stall-tea.jpg", webp: "assets/stall-tea.webp", alt: "茶瀑布档口" },
      menu: null,
      pos: { x: 68, y: 40 }
    },
    {
      id: "roll",
      name: "功夫卷饼",
      short: "功夫卷饼",
      categoryId: "roll",
      zoneId: "center",
      desc: "卷饼档口，肉灌饼与卷饼系列现做现卖，位于中部交流区，与荔枝鸡牛肉双拼饭相邻。",
      photo: { jpg: "assets/stall-roll.jpg", webp: "assets/stall-roll.webp", alt: "功夫卷饼档口" },
      menu: {
        jpg: "assets/menu-roll.jpg",
        webp: "assets/menu-roll.webp",
        caption: "档口菜单灯箱（摄于现场）· 价格以现场公示为准"
      },
      pos: { x: 46, y: 56 }
    },
    {
      id: "rice",
      name: "荔枝鸡牛肉双拼饭",
      short: "荔枝饭",
      categoryId: "rice",
      zoneId: "center",
      desc: "盖饭档口，荔枝鸡牛肉双拼饭与系列套餐，位于中部交流区，与功夫卷饼相邻。",
      photo: { jpg: "assets/stall-rice.jpg", webp: "assets/stall-rice.webp", alt: "荔枝鸡牛肉双拼饭档口" },
      menu: {
        jpg: "assets/menu-rice.jpg",
        webp: "assets/menu-rice.webp",
        caption: "档口菜单灯箱（摄于现场）· 价格以现场公示为准"
      },
      pos: { x: 64, y: 56 }
    }
  ],

  /* ---------- 地图附加点位（非档口） ---------- */
  mapPoints: [
    {
      id: "service-center",
      name: "大使服务中心",
      short: "服务中心",
      kind: "service",
      zoneId: "east",
      desc: "校园大使驻点，提供失物招领、咨询引导、意见反馈一站式服务。",
      photo: { jpg: "assets/region-service.jpg", webp: "assets/region-service.webp", alt: "大使服务中心环形服务台" },
      pos: { x: 86, y: 36 }
    },
    {
      id: "poetry-wall",
      name: "毛泽东诗句墙",
      short: "诗词墙",
      kind: "scenery",
      zoneId: "west",
      desc: "西侧文化区一隅，毛泽东诗词文化墙，与门前雕塑东西一线。",
      photo: { jpg: "assets/interior-2.jpg", webp: "assets/interior-2.webp", alt: "毛泽东诗词文化墙" },
      pos: { x: 25, y: 80 }
    },
    {
      id: "youth-market",
      name: "青春集市（二楼）",
      short: "青春集市",
      kind: "closed",
      zoneId: "west",
      desc: "青春集市二楼暂未开放，开放安排以现场通知为准。",
      photo: { jpg: "assets/region-floor2.jpg", webp: "assets/region-floor2.webp", alt: "青春集市二楼入口，暂未开放" },
      pos: { x: 14, y: 90 }
    }
  ],

  /* ---------- 意见反馈配置 ---------- */
  feedback: {
    /* 预留接口：接入 Cloudflare D1 后，将 Pages Function 地址填于此 */
    endpoint: "/api/feedback",
    storageKey: "qcsj_feedback_queue"
  }
};
