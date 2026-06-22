const BRAND_CONTEXT = {
  person: "黃俊榮（俊榮 Longer）",
  identities: ["艾格森蛋餅創辦人", "早餐店老闆", "退伍軍人", "財富教練", "屏東九如創業者"],
  brand: "艾格森蛋餅 Egg Grove",
  series: "早餐店人生觀察室",
  core: "從早餐店的小事，看見人生的大事。",
  goal: "讓觀眾認識老闆、認識艾格森蛋餅、認識品牌背後的價值觀。",
};

const STYLE_ORDER = ["visit", "life", "product", "legend", "founder", "comment"];

const STYLE_NAMES = {
  visit: "探店版",
  life: "早餐店人生觀察室版",
  product: "新品上市版",
  legend: "都市傳說版",
  founder: "創業故事版",
  comment: "高互動留言版",
};

const clean = (value) =>
  value.trim().replace(/\s+/g, " ").replace(/[。！!？?]+$/g, "");

const hash = (text) =>
  [...text].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) >>> 0, 5381);

const pick = (items, seed, offset = 0) =>
  items[Math.abs(seed + offset * 97) % items.length];

const short = (text, length = 24) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

const has = (text, words) => words.some((word) => text.includes(word));

const sentences = (text) =>
  text.split(/[。！？!?\n]+/).map((item) => item.trim()).filter(Boolean);

function analyzeMaterial(text) {
  const category = classifyMaterial(text);
  const theme = inferTheme(text);
  const person =
    text.match(/小朋友|客人|員工|夥伴|阿姨|阿伯|媽媽|爸爸|外送員|夫妻|學生|老闆/)?.[0] ||
    (category === "新品上市" ? "客人" : "現場的人");
  const product = extractProduct(text);
  const time = text.match(/\d+\s*分鐘/)?.[0] || "";
  const price = text.match(/\d+(?:,\d{3})*\s*元/)?.[0] || "";
  const human = inferHuman(text, theme);
  const life = inferLife(theme);
  const customer = inferCustomer(text, category);
  const business = inferBusiness(theme, category);
  const brand = inferBrand(theme, category);
  const local = has(text, ["屏東", "九如", "在地"]) ? "屏東九如在地感" : "屏東九如的早餐店現場";
  const seed = hash(text);

  return {
    text,
    category,
    theme,
    person,
    product,
    time,
    price,
    human,
    life,
    customer,
    business,
    brand,
    local,
    event: sentences(text)[0] || text,
    seed,
  };
}

function classifyMaterial(text) {
  if (has(text, ["新品", "新口味", "上市", "推出", "開賣", "拿鐵", "新產品"])) return "新品上市";
  if (has(text, ["小朋友", "小孩", "孩子", "貼紙"])) return "小朋友故事";
  if (
    has(text, ["一準備", "每次只要", "就突然", "一定會", "都市傳說", "神奇", "魔咒"]) ||
    (/員工/.test(text) && /客人.*進來|客人.*來/.test(text))
  ) return "早餐店都市傳說";
  if (has(text, ["員工", "夥伴", "同事", "團隊"])) return "夥伴故事";
  if (has(text, ["活動", "週年", "抽獎", "市集", "公益", "比賽", "聚會"])) return "店內活動";
  if (has(text, ["創業", "開店", "現金流", "成本", "經營", "管理", "失敗"])) return "創業觀察";
  if (has(text, ["探店", "帶你吃", "開箱", "必吃", "來屏東", "來九如"])) return "探店內容";
  return "客人故事";
}

function inferTheme(text) {
  if (has(text, ["等", "排隊", "分鐘", "離開", "多久"])) return "等待與確定感";
  if (has(text, ["貼紙", "禮物", "獎勵", "開心"])) return "被看見與被記得";
  if (has(text, ["收餐盤", "跟著收", "主動", "模仿"])) return "示範與從眾";
  if (has(text, ["員工", "夥伴", "團隊"])) return "團隊默契與生活巧合";
  if (has(text, ["新品", "拿鐵", "新口味", "推出"])) return "儀式感與新鮮感";
  if (has(text, ["錢", "價格", "元", "貴", "便宜"])) return "價值與選擇";
  if (has(text, ["活動", "市集", "公益", "聚會"])) return "參與感與歸屬";
  if (has(text, ["創業", "開店", "經營", "成本"])) return "選擇與承擔";
  return "習慣與選擇";
}

function inferHuman(text, theme) {
  const map = {
    "等待與確定感": "人們不一定討厭等待，而是討厭等待背後的不確定感。當不知道還要多久，再短的時間都會被放大。",
    "被看見與被記得": "人真正喜歡的不只是拿到東西，而是發現有人記得自己。被看見的感覺，常比禮物本身更有價值。",
    "示範與從眾": "人會觀察現場其他人怎麼做，再決定自己的行為。只要第一個人做出好示範，就可能改變整個空間的默契。",
    "團隊默契與生活巧合": "忙碌生活裡的巧合，會變成團隊共同的幽默。一起笑過的荒謬時刻，往往也是關係變好的開始。",
    "儀式感與新鮮感": "人買的不只是新口味，也是在平凡生活裡替自己安排一個值得期待的小儀式。",
    "價值與選擇": "人不是只在意價格，而是害怕花了錢卻不值得。價格問題背後，通常是對結果的不確定。",
    "參與感與歸屬": "人願意參加活動，往往不是因為活動本身，而是想成為某個群體的一部分。",
    "選擇與承擔": "創業的每個選擇都伴隨代價。人真正害怕的不是辛苦，而是不確定自己的辛苦會不會有結果。",
    "習慣與選擇": `「${short(text, 28)}」看似只是小事，其實反映人會依照熟悉經驗快速做選擇。`,
  };
  return map[theme];
}

function inferLife(theme) {
  const map = {
    "等待與確定感": "很多選擇不是不能等，而是看不到等待是否值得。人生走得慢沒關係，最怕的是不知道自己正走去哪裡。",
    "被看見與被記得": "每個人都希望自己的存在被記得。很多關係能走得更久，只是因為有人願意記住一件小事。",
    "示範與從眾": "影響別人不一定要講很多話。你長期做出的選擇，會慢慢成為身邊人的參考答案。",
    "團隊默契與生活巧合": "生活不會等你準備好才開始。真正的默契，是再忙也能一起把事情做完，之後還能笑著談起。",
    "儀式感與新鮮感": "人生不需要每天都有大事，偶爾為自己保留一點期待，就能讓普通的一天有不同的開始。",
    "價值與選擇": "真正值得的選擇，不一定最便宜，而是多年後回頭看，仍然覺得當時的決定沒有辜負自己。",
    "參與感與歸屬": "人會記住的不是活動流程，而是自己曾經在那個地方被歡迎、被需要。",
    "選擇與承擔": "創業不是一直做正確選擇，而是選了之後願意承擔、修正，繼續把路走出來。",
    "習慣與選擇": "人生不是被一次大決定改變，而是被每天看似不起眼的選擇慢慢推向不同方向。",
  };
  return map[theme];
}

function inferBusiness(theme, category) {
  if (theme === "等待與確定感") return "服務業不是只提供產品，也是在管理顧客的期待。清楚告知進度，比模糊地說「快好了」更能建立信任。";
  if (theme === "示範與從眾") return "店內文化不只靠規定，也能透過空間設計與第一個示範者被建立。好的行為一旦容易被看見，就更容易被跟隨。";
  if (theme === "團隊默契與生活巧合") return "團隊管理不只有排班與效率，也需要共同語言。能把高壓時刻轉成默契，是小店很重要的韌性。";
  if (category === "新品上市") return "新品不是增加菜單品項，而是測試品牌能不能回應新的需求，同時維持原本的信任。";
  if (category === "店內活動") return "活動的價值不是當天人多，而是能不能讓客人從消費者變成參與品牌故事的人。";
  return "每次現場互動都是顧客體驗的一部分。流程處理事情，溝通處理感受，兩者一起做好才會形成口碑。";
}

function inferBrand(theme, category) {
  if (theme === "等待與確定感") return "艾格森可以透過誠實告知等待時間，建立真實、透明、尊重客人選擇的品牌形象。";
  if (theme === "被看見與被記得") return "艾格森可以成為一間會記得客人的早餐店，讓貼紙與小互動累積成孩子和家庭的共同記憶。";
  if (theme === "示範與從眾") return "艾格森可以把主動與體貼變成店內文化，讓客人感受到這裡不只是吃早餐，也是一個彼此尊重的空間。";
  if (category === "新品上市") return "新品應該延伸艾格森的在地、真實與有溫度，而不是突然變成只談規格和促銷的廣告。";
  return `艾格森可以把「${theme}」變成品牌記憶，讓大家看見這是一間認真觀察人、也認真對待小事的早餐店。`;
}

function inferCustomer(text, category) {
  if (has(text, ["等", "多久", "分鐘", "離開"])) return "客人真正想知道的不是「多久」，而是「這份等待值不值得」，以及自己有沒有被店家放在心上。";
  if (has(text, ["貼紙", "小朋友"])) return "孩子要的是驚喜和被記得，家長要的是一段輕鬆、友善、願意再回來的用餐記憶。";
  if (has(text, ["收餐盤", "跟著收"])) return "客人想知道這個空間期待大家怎麼相處；清楚而友善的暗示，會讓人更願意一起維持環境。";
  if (category === "新品上市") return "客人不只想知道新品好不好喝，而是它能不能讓平凡的早餐多一點期待，並成為值得分享的體驗。";
  if (category === "店內活動") return "客人要的不只是優惠，而是參與感、被歡迎的感覺，以及一個能和家人朋友共同記住的理由。";
  return "客人要的不只是把餐點拿走，而是在忙碌的一天開始前，感覺自己的時間與選擇被尊重。";
}

function extractProduct(text) {
  const cleaned = text
    .replace(/^(新品|新產品|產品)\s*[：:，,]?\s*/, "")
    .replace(/^(艾格森)?\s*(準備)?\s*(推出|研發|製作)(了)?\s*(一款|一個|一份)?\s*/, "")
    .split(/[，。；;]/)[0]
    .trim();
  return short(cleaned || "這項新品", 30);
}

function productReason(a) {
  if (has(a.text, ["抹茶", "拿鐵", "咖啡", "飲料"])) {
    return "我們發現很多人來吃早餐，不只想填飽肚子，也想在趕路以前，先替自己留一杯慢下來的時間。";
  }
  return `我們不是為了讓菜單看起來更多，而是想回應客人在早餐時真正需要的「${short(a.customer, 34)}」。`;
}

function styleProfile(style, a, version) {
  const seed = a.seed + version * 911;
  const profiles = {
    visit: {
      name: STYLE_NAMES.visit,
      title: pick([
        `走，帶你看屏東九如早餐店今天發生的事`,
        `艾格森今天這一幕，比早餐更值得看`,
        `${short(a.event, 22)}，剛好被我看見了`,
      ], seed),
      hook: pick([
        "走，帶你看早餐店今天發生的一件小事。",
        `今天來艾格森，剛好遇到「${short(a.event, 22)}」。`,
        "本來只是忙著做早餐，結果現場出現一個很有意思的畫面。",
      ], seed, 1),
      opening: `今天帶你來屏東九如的艾格森蛋餅。店裡跟平常一樣忙，結果發生了這件事：${a.text}。`,
      bridge: "我沒有急著講道理，先站在現場看。因為早餐店真正有意思的，常常是人遇到事情時最自然的反應。",
      brandLine: `這也是我喜歡在艾格森記錄日常的原因。早餐會吃完，但一間店怎麼對待人，客人會記得。`,
      cta: "如果你剛好在現場，你第一個反應會是什麼？",
    },
    life: {
      name: STYLE_NAMES.life,
      title: `早餐店裡的「${a.theme}」，也是很多人的人生`,
      hook: pick([
        "今天早餐店發生一件小事，卻讓我想到很多人的人生。",
        `做早餐這麼多年，我發現人最在意的，常常不是表面那件事。`,
        `${short(a.event, 20)}。事情不大，但我想了很久。`,
      ], seed, 2),
      opening: `今天店裡發生這件事：${a.text}。一開始我只覺得這是每天都可能遇到的小插曲。`,
      bridge: `忙完再回頭看，我才發現它在說的是「${a.theme}」。`,
      brandLine: "這就是早餐店人生觀察室想記錄的：從早餐店的小事，看見人生的大事。",
      cta: `你也遇過關於「${a.theme}」的故事嗎？`,
    },
    product: {
      name: STYLE_NAMES.product,
      title: `我們為什麼做「${a.product}」？`,
      hook: pick([
        `走，帶你去喝屏東早餐店也有的「${a.product}」。`,
        `先說清楚，這杯「${a.product}」可能不適合每一個人。`,
        `先不介紹味道，我想先說這杯「${a.product}」為什麼會出現。`,
      ], seed, 3),
      opening: a.category === "新品上市"
        ? productReason(a)
        : `今天這件事讓我重新想：客人走進早餐店時，真正想帶走的除了早餐，還有什麼？`,
      bridge: a.category === "新品上市"
        ? `所以才有了「${a.product}」。它和一般早餐店飲料最大的不同，不只是配方，而是想讓一個普通早晨多一點儀式感。`
        : `產品只是最後被看見的答案，前面真正重要的，是先理解客人的生活。`,
      brandLine: `我們希望大家因為「${a.product}」認識艾格森，也認識這間店背後那個相信小事值得被認真對待的老闆。`,
      cta: `如果是你，會想在什麼樣的早晨喝一杯「${a.product}」？`,
    },
    legend: {
      name: STYLE_NAMES.legend,
      title: `早餐店真的有這個都市傳說，而且每天都在發生`,
      hook: pick([
        "早餐店有一個都市傳說：只要一準備吃飯，客人就會突然出現。",
        "這件事沒有科學根據，但每個早餐店員工都相信。",
        `先別笑，艾格森今天又遇到那個傳說了。`,
      ], seed, 4),
      opening: `事情是這樣：${a.text}。你可以說是巧合，但早餐店做久了，真的會開始相信某些神秘規律。`,
      bridge: `好笑歸好笑，它背後其實也是「${a.theme}」。忙碌現場裡，這些共同經驗會慢慢變成團隊的默契。`,
      brandLine: "艾格森不只記錄好吃的早餐，也想記下只有早餐店人才懂的那些荒謬又真實的瞬間。",
      cta: "你還聽過哪些早餐店都市傳說？留言讓同行來認證。",
    },
    founder: {
      name: STYLE_NAMES.founder,
      title: `開早餐店後，我從「${a.theme}」學到的一課`,
      hook: pick([
        "開早餐店以前，我以為把東西做好就夠了。",
        "創業後才知道，最難處理的從來不是蛋餅。",
        `今天店裡這件小事，讓我重新想起創業的代價。`,
      ], seed, 5),
      opening: `我是俊榮，退伍後在屏東九如開了艾格森蛋餅。今天店裡發生了這件事：${a.text}。`,
      bridge: `以前的我可能只想趕快把問題處理完。現在我更在意，這件事會讓客人和夥伴留下什麼感受。`,
      brandLine: `創業不是一直證明老闆是對的，而是讓艾格森每天比昨天更值得被信任一點。`,
      cta: "如果你也在創業，遇到同樣的事會怎麼處理？",
    },
    comment: {
      name: STYLE_NAMES.comment,
      title: `這件事沒有標準答案，你會怎麼選？`,
      hook: pick([
        "先別急著看答案。如果是你，會怎麼處理？",
        "早餐店今天遇到一道沒有標準答案的題目。",
        "我把今天店裡發生的事講完，你幫我評評理。",
      ], seed, 6),
      opening: `事情很簡單：${a.text}。`,
      bridge: `站在${a.person}的角度，他想要的是${customerDesire(a)}；站在店家的角度，我們也有流程與其他客人要顧。`,
      brandLine: `我後來做了一個決定，但先不說結果。因為艾格森想聽的不只是標準答案，而是不同位置的真實想法。`,
      cta: "A 照原則處理，B 多做一點通融。你選哪一個？為什麼？",
    },
  };
  return profiles[style];
}

function customerDesire(a) {
  if (a.theme === "等待與確定感") return "知道還要等多久，也確認自己沒有被遺忘";
  if (a.theme === "被看見與被記得") return "得到一點驚喜和被重視的感覺";
  if (a.theme === "價值與選擇") return "確認自己的選擇值得";
  if (a.category === "新品上市") return "知道這個新品能不能替平凡早晨增加一點期待";
  return "被理解，也被公平地對待";
}

function buildScript(style, a, version) {
  const p = styleProfile(style, a, version);
  const script30 = [
    p.hook,
    p.opening,
    a.human,
    p.brandLine,
    p.cta,
  ].join("\n\n");
  const script60 = [
    p.hook,
    p.opening,
    p.bridge,
    `我看到的人性是：${a.human}`,
    `再往人生裡想：${a.life}`,
    p.brandLine,
    p.cta,
  ].join("\n\n");

  const storyboard = [
    `0–3 秒｜${shotOpening(style, a)}`,
    `3–12 秒｜交代現場故事：「${short(a.event, 28)}」`,
    `12–25 秒｜${shotMiddle(style, a)}`,
    `25–42 秒｜俊榮在工作狀態中說出人性觀察，不看稿說教`,
    `42–53 秒｜${shotBrand(style, a)}`,
    `53–60 秒｜正面鏡頭說 CTA，畫面停在問題字幕`,
  ];
  const subtitles = [
    p.hook,
    short(a.event, 28),
    `人性觀察｜${short(a.human, 42)}`,
    `人生體悟｜${short(a.life, 42)}`,
    `${BRAND_CONTEXT.brand}｜${BRAND_CONTEXT.core}`,
    p.cta,
  ];
  const posts = buildSocialPosts(p, a);
  const score = scoreScript(style, a, p);

  return {
    id: style,
    name: p.name,
    title: p.title,
    hook: p.hook,
    script30,
    script60,
    storyboard,
    subtitles,
    cta: p.cta,
    posts,
    score,
  };
}

function shotOpening(style, a) {
  if (style === "visit") return "手持鏡頭從店外走進艾格森，保留煎台與客人環境聲";
  if (style === "product") return `先拍客人的早晨，再用超近景帶到「${a.product}」`;
  if (style === "legend") return "員工準備坐下吃早餐，畫面突然切到門口客人進來";
  if (style === "founder") return "俊榮開店、備料或穿上工作服的紀錄畫面";
  if (style === "comment") return "俊榮直視鏡頭，字幕先出現「你會怎麼選？」";
  return "俊榮停下手邊動作，直接說 Hook，不加片頭";
}

function shotMiddle(style, a) {
  if (style === "product") return `拍攝「${a.product}」製作過程、質地與拿在手上的儀式感`;
  if (style === "legend") return "用快節奏重演巧合，搭配員工無奈表情與幽默音效";
  if (style === "comment") return "左右畫面分別呈現客人與店家兩種立場";
  if (style === "founder") return "穿插早年創業、備料、收店與團隊工作的畫面";
  return `拍攝${a.person}、煎台、取餐區與事件發生位置的細節`;
}

function shotBrand(style, a) {
  if (style === "product") return `產品交到客人手中，艾格森招牌自然入鏡，不做促銷口播`;
  if (style === "founder") return "俊榮與夥伴一起工作的畫面，帶出創業者身份";
  return "餐點交到客人手中，帶到艾格森招牌與屏東九如環境";
}

function buildSocialPosts(p, a) {
  return {
    ig: `${p.hook}\n\n${a.text}。\n\n這件事讓我看見：${a.human}\n\n在早餐店工作久了，會發現每天的小事，都可能是某個人的人生縮影。\n\n${p.cta}\n\n#早餐店人生觀察室 #艾格森蛋餅 #屏東九如 #俊榮Longer`,
    facebook: `今天在艾格森發生一件事。\n\n${a.text}。\n\n一開始只是現場的小插曲，後來我想到，${a.human}\n\n做早餐店不只是把餐點做完。每一次等待、互動、選擇，都在告訴我們客人真正在意什麼。\n\n${a.life}\n\n${p.cta}`,
    threads: `${p.hook}\n\n${short(a.text, 80)}。\n\n後來我發現：${short(a.human, 80)}\n\n${p.cta}`,
  };
}

function scoreScript(style, a, profile) {
  const noise = (hash(`${a.text}-${style}`) % 7) - 3;
  const isLocal = has(a.text, ["屏東", "九如", "在地"]);
  const isLegend = a.category === "早餐店都市傳說";
  const isProduct = a.category === "新品上市";
  const items = {
    好奇心: Math.min(100, 80 + noise + (style === "legend" || style === "comment" ? 11 : 4) + (isLegend ? 3 : 0)),
    反差感: Math.min(100, 67 + noise + (style === "product" || style === "legend" ? 15 : 5) + (isProduct || isLegend ? 5 : 0)),
    人性觀察: Math.min(100, 82 + noise + (style === "life" ? 12 : style === "comment" ? 7 : 4)),
    在地特色: Math.min(100, 72 + noise + (isLocal ? 12 : 3) + (style === "visit" || style === "founder" ? 9 : 2)),
    留言互動: Math.min(100, 75 + noise + (style === "comment" ? 20 : style === "life" ? 10 : 6)),
    品牌記憶點: Math.min(100, 81 + noise + (style === "founder" || style === "product" ? 12 : 5)),
  };
  const total = Math.round(Object.values(items).reduce((sum, value) => sum + value, 0) / 6);
  const strengths = Object.entries(items)
    .filter(([, value]) => value >= 86)
    .sort((aItem, bItem) => bItem[1] - aItem[1])
    .slice(0, 3)
    .map(([name]) => `${name}${name === "人性觀察" ? "完整" : "強"}`);
  const improvements = Object.entries(items)
    .filter(([, value]) => value < 82)
    .sort((aItem, bItem) => aItem[1] - bItem[1])
    .slice(0, 2)
    .map(([name]) => `${name}可以再更明確`);
  if (!improvements.length) improvements.push("可再加入更具體的現場細節，提升真實感");

  return { total, items, strengths, improvements, hook: profile.hook };
}

function generateStudioV2(rawMaterial, selectedStyle = "all", version = 0) {
  const material = clean(rawMaterial);
  const analysis = analyzeMaterial(material);
  const selected = selectedStyle === "all" ? STYLE_ORDER : [selectedStyle];

  return {
    role: BRAND_CONTEXT,
    material,
    meta: {
      category: analysis.category,
      theme: analysis.theme,
      brand: BRAND_CONTEXT.brand,
      series: BRAND_CONTEXT.series,
    },
    observations: {
      human: analysis.human,
      life: analysis.life,
      business: analysis.business,
      brand: analysis.brand,
      customer: analysis.customer,
    },
    scripts: selected.map((style) => buildScript(style, analysis, version)),
  };
}

window.generateStudioV2 = generateStudioV2;
window.BREAKFAST_STYLES = STYLE_NAMES;
