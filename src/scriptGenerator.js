const hash = (text) =>
  [...text].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

const pick = (items, seed, offset = 0) => items[(seed + offset) % items.length];

const cleanInput = (value) =>
  value
    .trim()
    .replace(/[。！!？?]+$/g, "")
    .replace(/\s+/g, " ");

const getType = (topic) => {
  if (/我|那天|以前|曾經|小時候|老闆|客人|朋友|媽媽|爸爸|故事/.test(topic)) {
    return "story";
  }
  if (/不是|而是|其實|我認為|觀點|為什麼|別再|真正/.test(topic)) {
    return "opinion";
  }
  return "product";
};

const openings = [
  "你有沒有發現，很多人不是不努力，是一開始就把力氣用錯地方。",
  "我在早餐店看過太多人，嘴上說想改變，手上卻一直做著同一個選擇。",
  "有些道理，坐在辦公室想不通；站在煎台前，反而一眼就看懂。",
  "我以前也以為，只要夠拚，結果就不會太差。後來才知道，方向比力氣更貴。",
];

const turns = [
  "真正拉開差距的，往往不是你做了多少，而是你有沒有抓到那個最關鍵的選擇。",
  "問題從來不在你不夠好，而是你還在用昨天的方法，處理今天的人生。",
  "賺錢跟做早餐其實很像：材料一樣，順序不同，結果就完全不同。",
  "人生最怕的不是慢，是每天很忙，卻沒有任何一件事在累積。",
];

const endings = [
  "所以別急著把自己逼得更累。先停一下，問自己：我現在做的，真的會把我帶到想去的地方嗎？",
  "你不需要一次改變全部。今天只要換一個選擇，明天的你就會站在不同的位置。",
  "生意不是賣東西，是幫人解決問題；人生不是證明自己，是把時間放在值得的地方。",
  "你今天重複的選擇，就是你明天會擁有的生活。這句話，我在早餐店看了很多年。",
];

const titles = {
  product: [
    "不是賣得不夠努力，是你少講了這件事",
    "客人買的從來不是產品，而是這個答案",
    "同樣的東西，為什麼有人就是賣得比較好？",
  ],
  story: [
    "那位客人留下一句話，我到今天都記得",
    "一個早餐店的故事，讓我看懂了人生",
    "我以為那只是小事，後來卻改變了我",
  ],
  opinion: [
    "真正困住你的，可能不是你以為的問題",
    "別再用努力，掩蓋你不敢做的選擇",
    "你以為是在省錢，其實是在浪費人生",
  ],
};

function generateScript(rawTopic) {
  const topic = cleanInput(rawTopic);
  const seed = hash(topic);
  const type = getType(topic);
  const opening = pick(openings, seed, 1);
  const turn = pick(turns, seed, 3);
  const ending = pick(endings, seed, 5);

  const hook =
    type === "story"
      ? `那天在早餐店，因為「${topic}」，我突然懂了一件很貴的事。`
      : type === "opinion"
        ? `如果你也相信「${topic}」，接下來這句話可能會得罪你。`
        : `別急著買「${topic}」，先問自己一個問題。`;

  const middle =
    type === "product"
      ? `很多人介紹產品，只會一直說它有多好。但客人真正在意的，從來不是規格，而是：「這跟我的生活有什麼關係？」\n\n拿「${topic}」來說，你賣的不是一個東西，你賣的是一個更省時間、更少煩惱，或更有選擇的人生。`
      : type === "story"
        ? `事情其實很簡單。${topic}。\n\n當下我沒有多說什麼，只是繼續把蛋餅翻面。但那個畫面，讓我想起很多來店裡的客人：每個人都很忙，卻不是每個人都知道自己在忙什麼。`
        : `很多人聽到「${topic}」，第一個反應是點頭。但我想請你再想深一點：這句話如果真的相信，你今天的行動有跟上嗎？\n\n我們最常做的，就是收藏一個道理，然後繼續原本的生活。`;

  const script = `${opening}\n\n${middle}\n\n${turn}\n\n${ending}`;

  return {
    title: pick(titles[type], seed, 2),
    hook,
    script,
    visuals: [
      "近景｜早餐店煎台，油滋聲，人物低頭忙碌",
      `中景｜看向鏡頭，字幕打出「${topic}」`,
      "特寫｜翻蛋餅、裝袋、找零，配合故事節奏快速切換",
      "定鏡｜人物停下手邊動作，說出核心觀點",
      "收尾｜把早餐遞給客人，畫面淡出並出現 CTA",
    ],
    cta: "如果你也正在努力改變生活，把這支影片收藏起來。留言告訴我：你今天最想換掉哪一個選擇？",
  };
}

window.generateScript = generateScript;
