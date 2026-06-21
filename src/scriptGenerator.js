const hash = (text) =>
  [...text].reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) >>> 0, 5381);

const pick = (items, seed, offset = 0) =>
  items[Math.abs(seed + offset * 97) % items.length];

const cleanInput = (value) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[。！!？?]+$/g, "");

const shorten = (text, length = 22) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

const sentencesOf = (text) =>
  text
    .split(/[。！？!?\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const includesAny = (text, words) => words.some((word) => text.includes(word));

const PRODUCT_WORDS = [
  "新品", "產品", "服務", "課程", "方案", "豆漿", "咖啡", "蛋餅", "早餐",
  "保養", "面膜", "飲料", "食品", "工具", "軟體", "app", "品牌", "價格",
  "元", "折", "上市", "開賣", "推出", "研發", "配方", "功能", "手作",
];

const STORY_WORDS = [
  "那天", "有一天", "曾經", "以前", "後來", "當時", "第一次", "最後",
  "突然", "跟我", "對我說", "我爸", "我媽", "朋友", "客人", "老闆",
  "員工", "老婆", "老公", "孩子", "老師", "同事", "借我", "借錢",
];

const OPINION_WORDS = [
  "其實", "真正", "不是", "而是", "我認為", "別再", "為什麼", "越",
  "最怕", "不代表", "應該", "不該", "窮人", "有錢人", "成功", "努力",
];

function analyze(text) {
  const lower = text.toLowerCase();
  const sentences = sentencesOf(text);
  const productScore = PRODUCT_WORDS.filter((word) => lower.includes(word)).length;
  const explicitProduct = includesAny(lower, [
    "新品", "產品", "服務", "課程", "方案", "豆漿", "咖啡", "蛋餅", "面膜",
    "工具", "軟體", "app", "上市", "開賣", "推出", "研發", "配方",
  ]);
  const storyScore =
    STORY_WORDS.filter((word) => text.includes(word)).length +
    (sentences.length > 1 ? 2 : 0) +
    (/我|他|她/.test(text) && /了|過|說|問|拿|走|哭|笑/.test(text) ? 2 : 0);
  const opinionScore = OPINION_WORDS.filter((word) => text.includes(word)).length;

  let type = "product";
  if (storyScore >= productScore && storyScore >= opinionScore && storyScore >= 2) {
    type = "story";
  } else if (!explicitProduct && opinionScore >= productScore && opinionScore > 0) {
    type = "opinion";
  }

  const people =
    text.match(/我爸|我媽|爸爸|媽媽|老婆|老公|兒子|女兒|朋友|客人|員工|老闆|老師|同事|學員|陌生人/) ||
    [];
  const protagonist = people[0] || (type === "story" ? "那個人" : "你");

  const emotion = includesAny(text, ["哭", "難過", "離開", "失去", "過世"])
    ? "難過"
    : includesAny(text, ["借錢", "欠", "賠", "負債", "沒錢"])
      ? "為難"
      : includesAny(text, ["生氣", "吵", "罵", "拒絕"])
        ? "衝突"
        : includesAny(text, ["成功", "賺", "成交", "做到", "升職"])
          ? "驚喜"
          : "意外";

  const price = text.match(/(?:NT\$?\s*)?\d+(?:,\d{3})*\s*元|只要\s*\d+|半價|\d+\s*折/)?.[0] || "";
  const firstSentence = sentences[0] || text;
  const lastSentence = sentences.at(-1) || text;

  return {
    text,
    type,
    sentences,
    protagonist,
    emotion,
    price,
    firstSentence,
    lastSentence,
    product: extractProduct(text),
    category: inferCategory(text),
  };
}

function extractProduct(text) {
  return shorten(
    text
      .replace(/^(新產品|新品|產品)\s*[：:]\s*/, "")
      .replace(/^(我們|我|最近|今天|全新|新推出|推出了|研發了|想賣|要賣)/, "")
      .replace(/，.*$/, "")
      .trim(),
    28,
  );
}

function inferCategory(text) {
  if (includesAny(text, ["豆漿", "咖啡", "早餐", "蛋餅", "吐司", "飲料", "食品", "好吃", "口味"])) {
    return {
      scene: "早上趕時間、又不想隨便吃的那一刻",
      desire: "吃得滿足，也覺得今天被好好照顧",
      proof: "第一口的味道、真實用料與做完後的表情",
      action: "今天早餐就換這一個選擇",
    };
  }
  if (includesAny(text, ["課程", "顧問", "教練", "諮詢", "培訓", "服務"])) {
    return {
      scene: "很努力，卻不知道下一步該往哪裡走的時候",
      desire: "少走冤枉路，更快看見可執行的方向",
      proof: "具體方法、前後差異與真實案例",
      action: "先來了解它能替你省下哪一段彎路",
    };
  }
  if (includesAny(text, ["保養", "面膜", "精華", "美容", "清潔", "洗髮", "香水"])) {
    return {
      scene: "照鏡子時，發現自己看起來比實際更疲憊",
      desire: "不用花很多時間，也能找回有精神的自己",
      proof: "使用前後的細節、觸感與持續使用的變化",
      action: "今晚就留一點時間，好好照顧自己",
    };
  }
  if (includesAny(text.toLowerCase(), ["app", "軟體", "工具", "系統", "ai", "平台", "程式"])) {
    return {
      scene: "每天重複處理同一件麻煩事的時候",
      desire: "把時間拿回來，專心做真正重要的事",
      proof: "實際操作畫面、節省的步驟與時間",
      action: "現在就拿一件最浪費時間的工作來試",
    };
  }
  return {
    scene: "原本的方法已經不夠用，卻一直沒有更好選擇的時候",
    desire: "用更簡單的方式，得到真正想要的結果",
    proof: "真實使用情境、細節與前後差異",
    action: "先別急著相信，親自感受一次差別",
  };
}

const storyFrameworks = [
  {
    name: "未說出口的真相",
    title: (a) => `${shorten(a.firstSentence, 18)}，但真正讓我難受的是後來`,
    hook: (a) => `${a.protagonist}做了這件事之後，我整整三分鐘說不出話。`,
    body: (a) => [
      `那天店裡正忙，我一邊顧著煎台，一邊聽見一件事：${a.text}。`,
      `你知道最讓人${a.emotion}的是什麼嗎？不是事情本身，而是${a.protagonist}開口前，可能已經一個人撐了很久。`,
      "很多人看起來和平常一樣，照常吃早餐、照常上班、照常說沒事。但真正的壓力，往往藏在那句「我可以」後面。",
      `那一刻我才懂，${a.lastSentence}，表面上是一件小事，背後其實是一個人不想麻煩別人的逞強。`,
      "所以遇到你在乎的人，別只問他缺不缺錢、需不需要幫忙。你可以問一句：「最近是不是很累？」有時候，這句話比答案更值錢。",
    ],
    insight: "真正的體貼，不是等對方求救，而是看見他努力藏起來的難。",
  },
  {
    name: "選擇的代價",
    title: (a) => `因為「${shorten(a.firstSentence, 16)}」，我重新認識了${a.protagonist}`,
    hook: (a) => `我一直以為我了解${a.protagonist}，直到那天發生這件事。`,
    body: (a) => [
      `故事是這樣的：${a.text}。`,
      `當下我的第一個反應不是感動，是${a.emotion}。因為一個人走到這一步，前面通常已經放棄過很多次開口。`,
      "我們總喜歡用結果判斷一個人，卻看不到他為了守住生活，曾經吞下多少話、做過多少不想做的選擇。",
      `後來我再回頭看「${shorten(a.lastSentence, 25)}」，才發現那不是一個事件，而是一個人的底線正在求救。`,
      "人生真正昂貴的，不是一次犯錯，而是我們太晚理解身邊的人。能早一點聽懂，就別等失去之後才說早知道。",
    ],
    insight: "成熟不是不需要別人，而是有人願意在你開口之前先靠近。",
  },
  {
    name: "早餐店的一分鐘",
    title: (a) => `早餐店裡的這一幕，讓我記了很多年`,
    hook: (a) => `今天早上，我因為${shorten(a.firstSentence, 20)}，少收了一位客人的錢。`,
    body: (a) => [
      `今天的故事不是雞湯，是真的：${a.text}。`,
      "煎台很吵，客人很多，但我腦袋突然安靜下來。因為有些話一出口，你就知道對方不是隨口說說。",
      `我看著${a.protagonist}，突然想到：我們每天都在算早餐多少錢、工作值多少錢，卻很少算一個人硬撐的代價。`,
      `如果你只看見「${shorten(a.firstSentence, 22)}」，你看到的是事件；如果你願意多停三秒，你會看見事件後面那個${a.emotion}的人。`,
      "做生意久了我才知道，客人記得的不一定是哪份早餐最好吃，而是他最狼狽的那天，有沒有人把他當一個人好好接住。",
    ],
    insight: "生意最後留下來的，不只是交易，而是你曾經怎麼對待一個人。",
  },
];

const productFrameworks = [
  {
    name: "價格反轉",
    title: (a) => `${a.price || "這個價格"}不是太貴，是你還沒看見它省下什麼`,
    hook: (a) => `第一次看到「${shorten(a.product, 20)}」，十個人有九個先問：憑什麼？`,
    body: (a) => [
      `如果我只跟你說「${a.product}」用了什麼、做得多仔細，你大概三秒就滑走了。`,
      `所以我不賣規格，我只問你：當你${a.category.scene}，你願意花多少錢，換回${a.category.desire}？`,
      `這就是我們做「${a.product}」的理由。它不是要成為最便宜的選項，而是把你原本會浪費的時間、失望和將就，一次拿掉。`,
      `${a.price ? `${a.price}買到的，不只是一個產品。` : "你付的不是產品本身。"}你買的是每次需要它時，都不用再賭運氣。`,
      `不要只聽我說。看${a.category.proof}，你就會知道差別到底值不值得。`,
    ],
    insight: "好的產品不是說服所有人，而是讓真正需要的人一眼看懂價值。",
  },
  {
    name: "生活痛點",
    title: (a) => `我們做了「${shorten(a.product, 18)}」，只為解決這個小麻煩`,
    hook: (a) => `這不是一個新產品，是我們受夠同一個問題之後的答案。`,
    body: (a) => [
      `每次看到有人${a.category.scene}，我都在想：為什麼大家只能繼續將就？`,
      `所以我們做了「${a.product}」。不是為了多賣一樣東西，而是想把那個每天都會發生、卻沒人認真處理的小麻煩解掉。`,
      `它真正給你的不是功能，而是${a.category.desire}。當產品離開鏡頭、回到真實生活，這件事才有價值。`,
      `你可以先不相信廣告，只要看${a.category.proof}。真正好用的東西，不需要靠形容詞撐場。`,
      `如果你也受夠原本的方法，${a.category.action}。你會明白，我們為什麼堅持把它做出來。`,
    ],
    insight: "新品不是多一個選擇，而是讓人終於不用繼續忍受舊問題。",
  },
  {
    name: "早餐店測試",
    title: (a) => `我把「${shorten(a.product, 16)}」放進早餐店，結果客人先問這句`,
    hook: (a) => `新品上架第一天，我故意一句介紹都沒說。`,
    body: (a) => [
      `我把「${a.product}」放在客人看得到的位置，沒有寫一堆厲害文案，也沒有急著推銷。`,
      `因為產品好不好，不是老闆講了算。真正的測試，是客人在${a.category.scene}，會不會主動停下來問。`,
      "第一個人問的是價格，第二個人問的是差在哪裡。第三個人用完之後，只說了一句：「早知道就不用撐那麼久。」",
      `那句話讓我確定，我們賣的不是「${a.product}」，而是${a.category.desire}。`,
      `生意最有力量的時刻，不是成交，而是客人發現：原來自己的麻煩，真的有人放在心上。`,
    ],
    insight: "不要把新品講得很厲害，要讓客人看見它跟自己有什麼關係。",
  },
  {
    name: "不適合所有人",
    title: (a) => `先說清楚：「${shorten(a.product, 18)}」不適合每一個人`,
    hook: (a) => `如果你只想找最便宜的，這個產品真的不用看。`,
    body: (a) => [
      `「${a.product}」不是做給所有人的。因為我們知道，一個什麼都想討好的產品，最後通常誰都幫不了。`,
      `它是做給那些正在${a.category.scene}，而且已經受夠反覆將就的人。`,
      `你在意的是${a.category.desire}，我們在意的是每一次交付，都能讓這件事真的發生。`,
      `所以判斷它值不值得，不要只看標價。請看${a.category.proof}，再決定它是不是你的答案。`,
      `如果你要的是便宜，我尊重你的選擇；如果你要的是把問題處理好，${a.category.action}。`,
    ],
    insight: "敢說不適合誰，客人才會相信你真的知道自己在幫誰。",
  },
];

const opinionFrameworks = [
  {
    name: "反常識拆解",
    title: (a) => `${shorten(a.text, 24)}？這句話只對了一半`,
    hook: (a) => `「${shorten(a.text, 28)}」——很多人就是從相信這句話開始吃虧。`,
    body: (a) => [
      `我以前也相信：${a.text}。直到我在早餐店看過太多人，把這句話活成完全不同的結果。`,
      "有人很省，最後卻花更多錢收拾問題；有人每天很忙，年底回頭看，真正累積下來的東西卻是零。",
      "問題不在這個觀點一定錯，而是你把它用在什麼地方。該省的是沒有價值的消耗，不是能讓自己成長的機會；該努力的是會累積的事，不是重複證明自己很辛苦。",
      `所以我現在更相信：${rewriteOpinion(a.text)}。`,
      "下次你準備做同一個選擇時，先問一句：它只是讓我今天比較舒服，還是真的讓明天的我更有選擇？",
    ],
    insight: "一個觀點有沒有價值，不看它多有道理，要看它最後把你帶去哪裡。",
  },
  {
    name: "兩種人的差距",
    title: (a) => `同樣相信「${shorten(a.text, 18)}」，兩種人的結局完全不同`,
    hook: (a) => `窮跟富的差別，有時候就藏在同一句話的不同理解裡。`,
    body: (a) => [
      `比如「${a.text}」。第一種人聽完，只拿它來證明自己是對的；第二種人會問：那我今天要改哪一個行動？`,
      "前者收藏觀點，後者使用觀點。前者害怕吃眼前的虧，後者在意五年後還剩下什麼。",
      "就像開早餐店，少放一點料，今天可能多賺十塊；把品質守住，客人才會在三年後還坐在你面前。",
      `真正的重點不是要不要相信「${shorten(a.text, 24)}」，而是這個相信，有沒有變成能累積的選擇。`,
      "人生不是被一句話改變的，是被你聽完那句話之後，重複做的事情改變的。",
    ],
    insight: "知道很多道理沒有用，把一個道理做久，才會變成你的生活。",
  },
  {
    name: "直接挑戰",
    title: (a) => `如果你認同「${shorten(a.text, 20)}」，請先回答這個問題`,
    hook: (a) => `接下來這句話可能不好聽，但它能替你省很多年。`,
    body: (a) => [
      `你說「${a.text}」。好，那我想問：你現在的生活，有因此變得更好嗎？`,
      "如果沒有，問題可能不是你不夠努力，而是這個信念正在替你的習慣找理由。",
      "很多人不是沒有能力改變，是太擅長解釋為什麼現在不能改。忙、沒錢、沒時間、等準備好——每一個理由都很合理，但加起來就是原地。",
      `一個有用的觀點，必須能讓你做出不同的選擇。否則「${shorten(a.text, 22)}」只是聽起來很對。`,
      "今天不用改很多。只做一件跟過去不同、而且能累積的事。你的答案，不在留言區，在下一個行動裡。",
    ],
    insight: "別用正確的道理安慰自己，要用它逼自己做出不同的選擇。",
  },
];

function rewriteOpinion(text) {
  if (text.includes("省")) return "真正的省，不是少花錢，而是不要為同一個問題付兩次代價";
  if (text.includes("努力")) return "努力要放在會累積的地方，否則只是高級的原地踏步";
  if (text.includes("成功")) return "成功不是一次做對，而是把對的選擇重複到別人看見";
  if (text.includes("錢")) return "錢不是目的，它只是讓你在人生重要時刻擁有選擇";
  return `真正重要的不是懂得「${shorten(text, 18)}」，而是你願不願意為它改變一個選擇`;
}

function visualsFor(a, framework) {
  if (a.type === "product") {
    return [
      `0–3 秒｜產品超近景，字幕：「${framework.title(a)}」`,
      `3–12 秒｜重現「${a.category.scene}」的生活情境，不先介紹產品`,
      `12–28 秒｜手持「${a.product}」說明它真正解決的麻煩`,
      `28–45 秒｜拍攝${a.category.proof}，穿插使用者反應`,
      `45–60 秒｜人物直視鏡頭說出核心洞察，最後定格產品與行動指令`,
    ];
  }
  if (a.type === "story") {
    return [
      `0–3 秒｜人物正面近景，直接說 Hook，不加片頭`,
      `3–15 秒｜早餐店工作 B-roll，字幕還原：「${shorten(a.firstSentence, 24)}」`,
      `15–32 秒｜手部動作與停頓特寫，講出${a.protagonist}沒有說出口的部分`,
      `32–48 秒｜鏡頭慢慢推近，從事件轉入人生洞察`,
      `48–60 秒｜環境聲降低，直視鏡頭說結論與 CTA`,
    ];
  }
  return [
    `0–3 秒｜黑底大字「${shorten(a.text, 20)}？」後立刻切人物`,
    "3–15 秒｜早餐店兩種客人的對比畫面，建立衝突",
    "15–32 秒｜邊工作邊拆解常見誤區，每句搭配關鍵字幕",
    "32–48 秒｜停下手邊動作，說出新的判斷標準",
    "48–60 秒｜正面定鏡提出一個問題，引導觀眾留言",
  ];
}

const ctas = {
  story: [
    (a) => `如果你也曾經看見${a.protagonist}逞強，把這支影片傳給他。不要等他開口，先問一句：「你最近還好嗎？」`,
    () => "留言告訴我：哪一個瞬間，讓你突然理解了自己的家人？你的故事，也可能接住另一個人。",
    () => "如果這段故事讓你想起某個人，先收藏，然後今天就去聯絡他。別把理解留到來不及。",
  ],
  product: [
    (a) => `想知道「${a.product}」到底適不適合你？留言「想試」，我把最真實的使用方式告訴你。`,
    (a) => `如果你也受夠${a.category.scene}，收藏這支影片，下一次別再用舊方法解決同一個問題。`,
    (a) => `${a.category.action}。用過之後，再回來告訴我：你最有感的是哪一個差別？`,
  ],
  opinion: [
    () => "你同意還是反對？不要只留一句同意，告訴我你親身遇過的例子。",
    () => "把這支影片收藏起來。下一次做決定前，再問自己一次：這個選擇能不能累積？",
    (a) => `留言完成這句話：「我以前相信${shorten(a.text, 16)}，但現在我會＿＿＿。」`,
  ],
};

function generateScript(rawTopic, version = 0) {
  const topic = cleanInput(rawTopic);
  const a = analyze(topic);
  const seed = hash(topic) + version * 7919;
  const frameworks =
    a.type === "story"
      ? storyFrameworks
      : a.type === "opinion"
        ? opinionFrameworks
        : productFrameworks;
  const framework = frameworks[(hash(topic) % frameworks.length + version) % frameworks.length];
  const body = framework.body(a);
  const insight = framework.insight;
  const ctaOptions = ctas[a.type];
  const cta = ctaOptions[(hash(topic) % ctaOptions.length + version) % ctaOptions.length](a);

  return {
    type: a.type,
    framework: framework.name,
    title: framework.title(a),
    hook: framework.hook(a),
    script: [...body.slice(0, 4), `所以我想留給你一句話：${insight}`, ...body.slice(4)].join("\n\n"),
    visuals: visualsFor(a, framework),
    cta,
  };
}

window.generateScript = generateScript;
