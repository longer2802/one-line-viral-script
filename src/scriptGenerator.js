const clean = (value) =>
  value.trim().replace(/\s+/g, " ").replace(/[。！!？?]+$/g, "");

const hash = (text) =>
  [...text].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) >>> 0, 5381);

const pick = (items, seed, offset = 0) =>
  items[Math.abs(seed + offset * 97) % items.length];

const short = (text, length = 24) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

const has = (text, words) => words.some((word) => text.includes(word));

const sentenceList = (text) =>
  text.split(/[。！？!?\n]+/).map((item) => item.trim()).filter(Boolean);

function understand(text) {
  const sentences = sentenceList(text);
  const isProduct = has(text.toLowerCase(), [
    "新品", "產品", "推出", "上市", "開賣", "蛋餅", "豆漿", "咖啡", "早餐",
    "吐司", "飲料", "口味", "套餐", "服務", "課程", "app", "商品",
  ]);
  const isStory = sentences.length > 1 || has(text, [
    "那天", "今天", "剛剛", "客人", "員工", "夥伴", "小朋友", "阿姨", "阿伯",
    "朋友", "我爸", "我媽", "發生", "離開", "等了", "主動", "突然",
  ]);
  const type = isProduct ? "product" : isStory ? "story" : "observation";
  const person =
    text.match(/小朋友|客人|員工|夥伴|阿姨|阿伯|媽媽|爸爸|我爸|我媽|老闆|外送員|夫妻|學生/)?.[0] ||
    (type === "product" ? "客人" : "那個人");
  const price = text.match(/\d+(?:,\d{3})*\s*元/)?.[0] || "";
  const minutes = text.match(/\d+\s*分鐘/)?.[0] || "";
  const product = extractProduct(text);
  const event = sentences[0] || text;
  const ending = sentences.at(-1) || text;
  const theme = inferTheme(text);
  const human = inferHuman(text, theme);
  const customerNeed = inferCustomerNeed(text, type);

  return {
    text, sentences, type, person, price, minutes, product, event, ending,
    theme, human, customerNeed,
  };
}

function extractProduct(text) {
  return short(
    text
      .replace(/^(新品|新產品|產品|我們推出|今天推出)\s*[：:，,]?\s*/, "")
      .replace(/^(艾格森)?\s*(準備)?\s*(推出|研發|製作)(了)?\s*(一款|一個|一份)?\s*/, "")
      .split(/[，。；;]/)[0]
      .trim(),
    30,
  );
}

function inferTheme(text) {
  if (has(text, ["等", "排隊", "分鐘", "離開", "還沒好"])) return "等待與確定感";
  if (has(text, ["貼紙", "禮物", "獎勵", "稱讚", "開心"])) return "肯定與被看見";
  if (has(text, ["收餐盤", "整理", "主動", "幫忙"])) return "示範與影響力";
  if (has(text, ["員工", "夥伴", "遲到", "請假", "犯錯"])) return "責任與團隊信任";
  if (has(text, ["錢", "價格", "元", "貴", "便宜"])) return "價值與選擇";
  if (has(text, ["新品", "推出", "產品", "口味"])) return "改變與被理解";
  if (has(text, ["陪", "家人", "爸爸", "媽媽", "孩子"])) return "陪伴與關係";
  return "習慣與選擇";
}

function inferHuman(text, theme) {
  if (theme === "等待與確定感") {
    return "人不一定不能等，真正讓人焦慮的是不知道還要等多久。當一件事失去確定感，再短的等待都會變得很長。";
  }
  if (theme === "肯定與被看見") {
    return "人真正喜歡的往往不是獎品本身，而是收到獎品時那種「我被注意到了」的感覺。";
  }
  if (theme === "示範與影響力") {
    return "多數人會觀察現場怎麼做，再決定自己怎麼做。好的行為只要有人先開始，就可能變成新的默契。";
  }
  if (theme === "責任與團隊信任") {
    return "團隊最在意的不只是誰做得快，而是出了狀況時，彼此能不能誠實面對並一起補位。";
  }
  if (theme === "價值與選擇") {
    return "人不是單純害怕價格，而是害怕花了錢卻得不到期待的結果。價格背後，其實是對失望的防備。";
  }
  if (theme === "改變與被理解") {
    return "人不會因為一個東西很新就需要它。只有當它說中了生活裡的麻煩，改變才會變成需求。";
  }
  if (theme === "陪伴與關係") {
    return "很多關係不是缺少愛，而是大家都以為對方知道。真正的陪伴，需要被說出來，也需要被做出來。";
  }
  return `「${short(text, 30)}」反映的不是單一事件，而是人在熟悉情境裡，會依照過去經驗快速做出選擇。`;
}

function inferCustomerNeed(text, type) {
  if (has(text, ["等", "排隊", "離開", "分鐘"])) {
    return "客戶要的不只是速度，而是清楚知道目前進度、還要多久，以及自己沒有被遺忘。";
  }
  if (has(text, ["小朋友", "貼紙", "禮物"])) {
    return "孩子想得到驚喜，家長想得到一段輕鬆、被善待的用餐記憶。";
  }
  if (has(text, ["貴", "價格", "元", "便宜"])) {
    return "客戶要的不是最低價，而是一個能放心做決定、事後不後悔的理由。";
  }
  if (type === "product") {
    return "客戶不只想知道產品有什麼，而是想知道它能替自己的早晨省下什麼麻煩、增加什麼感受。";
  }
  return "客戶要的不只是把早餐拿走，而是在忙碌的一天開始前，感覺自己被理解、被尊重。";
}

function buildAnalyses(a) {
  const lifeLessons = {
    "等待與確定感": "人生很多焦慮也來自不確定。目標可以很遠，但只要知道下一步在哪裡，人就比較走得下去。",
    "肯定與被看見": "成長不只靠要求，也靠被肯定。很多人願意繼續努力，只因為有人看見他做對了一件小事。",
    "示範與影響力": "影響別人最有效的方法，往往不是要求，而是自己先做。你重複的行為，會變成身邊人的標準。",
    "責任與團隊信任": "人生不是永遠不犯錯，而是犯錯之後願不願意承擔。信任不是完美換來的，是一次次負責累積的。",
    "價值與選擇": "每一次花錢都在選擇自己重視什麼。真正的省，不是永遠選最便宜，而是不為同一個失望付兩次錢。",
    "改變與被理解": "好的改變不是逼別人接受，而是先理解對方為什麼不想改。當人感覺被理解，才願意往前一步。",
    "陪伴與關係": "人生重要的不是一直待在一起，而是在對方需要時，讓他知道自己不是一個人。",
    "習慣與選擇": "人生不是被一次大決定改變，而是被每天看似不起眼的選擇慢慢推向不同方向。",
  };

  return {
    human: a.human,
    life: lifeLessons[a.theme],
    business: `這件事提醒創業者：${businessLesson(a)}。流程處理的是事情，溝通處理的是感受；兩件事都做好，才會形成口碑。`,
    brand: `艾格森蛋餅可以把「${a.theme}」變成品牌記憶。不是宣傳早餐多厲害，而是讓大家看見：這間店會認真看待每一位客人與每一件小事。`,
    customer: a.customerNeed,
  };
}

function businessLesson(a) {
  if (a.theme === "等待與確定感") return "顧客體驗不能只管理速度，也要管理等待中的確定感";
  if (a.theme === "肯定與被看見") return "超出預期的小互動，常比折扣更容易被記住";
  if (a.theme === "示範與影響力") return "現場文化不是貼在牆上的規則，而是團隊每天示範的行為";
  if (a.theme === "責任與團隊信任") return "管理不能只追究錯誤，更要建立能主動回報與補位的環境";
  if (a.theme === "價值與選擇") return "品牌必須先說清楚價值，客戶才不會只剩價格可以比較";
  if (a.type === "product") return "新品不是增加品項，而是回應一個已經存在的顧客需求";
  return "每一次看似普通的服務現場，都是品牌文化被看見的時刻";
}

function createVariant(kind, a, analyses, version) {
  const seed = hash(a.text) + version * 719;
  const common = {
    visit: {
      name: "A. 探店版腳本",
      title: pick([
        `走，帶你看艾格森今天發生的這件小事`,
        `屏東九如這間早餐店，今天有點不一樣`,
        `${short(a.event, 22)}，我在現場看見了`,
      ], seed),
      hook: pick([
        "走，帶你看早餐店今天發生的一件小事。",
        `今天來艾格森，剛好遇到「${short(a.event, 22)}」。`,
        "本來只是來吃早餐，結果看到一個很有意思的畫面。",
      ], seed, 1),
      voiceover: [
        `今天帶你來屏東九如的艾格森蛋餅。店裡跟平常一樣忙，結果發生了這件事：${a.text}。`,
        "我沒有急著下結論，先站在旁邊看。因為早餐店最好看的，常常不是餐點，而是人遇到事情時的反應。",
        `後來我發現，這件事其實在說「${a.theme}」。${analyses.human}`,
        `所以艾格森想做的，不只是把早餐做好，也希望每個走進來的人，都能感覺自己有被好好對待。`,
      ],
      storyboard: [
        "0–3 秒｜手持鏡頭從店門口走進艾格森，保留環境聲",
        `3–15 秒｜拍攝煎台、客人與現場，口述事件：「${short(a.event, 28)}」`,
        "15–35 秒｜重現事情發生的關鍵位置與人物動作",
        "35–50 秒｜俊榮邊工作邊說出觀察，不正襟危坐",
        "50–60 秒｜餐點送到客人手中，帶到艾格森招牌",
      ],
      subtitles: [
        "早餐店最好看的，有時候不是早餐",
        short(a.event, 26),
        `這件事讓我看見：${a.theme}`,
        "從早餐店的小事，看見人生的大事",
      ],
      cta: "如果你在現場，你第一個反應會是什麼？留言告訴我。",
    },
    life: {
      name: "B. 早餐店人生觀察室版腳本",
      title: `早餐店裡的「${a.theme}」，也是很多人的人生`,
      hook: pick([
        `今天早餐店發生一件小事，卻讓我想到很多人的人生。`,
        `做早餐這麼多年，我發現人最在意的，常常不是表面那件事。`,
        `${short(a.event, 20)}。事情不大，但我想了很久。`,
      ], seed, 2),
      voiceover: [
        `今天店裡發生這件事：${a.text}。`,
        "一開始我只覺得這是每天都可能遇到的小插曲。可是忙完回頭想，才發現它沒有那麼簡單。",
        `${analyses.human}`,
        `${analyses.life}`,
        "這就是我喜歡開早餐店的原因。每天接觸很多人，也每天從一些小事，重新認識生活。",
      ],
      storyboard: [
        "0–3 秒｜俊榮停下手邊動作，直接說 Hook",
        "3–18 秒｜早餐店工作畫面，完整說清楚發生什麼事",
        `18–35 秒｜人物或現場細節特寫，字幕「${a.theme}」`,
        "35–52 秒｜鏡頭慢慢靠近，從人性拉到人生",
        "52–60 秒｜回到煎台繼續工作，自然說 CTA",
      ],
      subtitles: [
        short(a.event, 28),
        "先別急著評斷",
        analyses.human,
        analyses.life,
      ],
      cta: pick([
        "你最有感的是哪一句？留言讓我知道。",
        "如果是你，你會怎麼做？",
        `你也遇過關於「${a.theme}」的故事嗎？留言跟我分享。`,
      ], seed, 3),
    },
    product: {
      name: "C. 產品介紹版腳本",
      title: a.type === "product"
        ? `我們為什麼做「${short(a.product, 20)}」？`
        : `一份早餐之外，艾格森真正想給你的東西`,
      hook: a.type === "product"
        ? `先不介紹產品，我想先講它為什麼會出現。`
        : "我們賣的是早餐，但客人帶走的不該只有早餐。",
      voiceover: [
        a.type === "product"
          ? `做「${a.product}」以前，我們先看到一件事：${a.customerNeed}`
          : `今天這件事是這樣：${a.text}。它讓我重新想，客人走進早餐店時，真正需要的是什麼。`,
        `${analyses.customer}`,
        a.type === "product"
          ? `所以我們才做了「${a.product}」。不是為了菜單多一項，而是希望客人的早晨少一個麻煩，多一點被照顧的感覺。`
          : "所以我們把這個觀察放進服務、產品和每一次互動裡。不是刻意感動誰，只是不想把任何一位客人當成下一張訂單。",
        `艾格森蛋餅想做的，是一間有故事、也懂生活的早餐店。產品只是故事的一部分，人才是主角。`,
      ],
      storyboard: [
        "0–3 秒｜先拍客人的生活情境，不拍產品正面",
        "3–18 秒｜說出問題與推出產品／服務的原因",
        "18–38 秒｜近拍製作過程、原料與使用情境",
        "38–52 秒｜產品交到客人手上，拍真實反應",
        "52–60 秒｜產品與人物同框，輕帶品牌理念",
      ],
      subtitles: [
        "先不賣產品，先說為什麼做",
        analyses.customer,
        a.type === "product" ? `這就是「${a.product}」出現的原因` : "早餐只是開始，感受才會被記住",
        "艾格森蛋餅｜一間充滿故事的早餐店",
      ],
      cta: a.type === "product"
        ? `如果是你，願意為「${short(a.product, 18)}」買單嗎？為什麼？`
        : "你希望一間早餐店，除了好吃以外還能帶給你什麼？",
    },
    comment: {
      name: "D. 高互動留言版腳本",
      title: `這件事沒有標準答案，你會怎麼選？`,
      hook: pick([
        `先別急著看答案。如果是你，會怎麼處理？`,
        `早餐店今天遇到一道沒有標準答案的題目。`,
        `我把今天店裡發生的事講完，你幫我評評理。`,
      ], seed, 4),
      voiceover: [
        `事情很簡單：${a.text}。`,
        `站在${a.person}的角度，他可能只是想要${customerDesirePhrase(a)}。站在店家的角度，我們也有現場必須顧好的事情。`,
        "我後來做了一個決定，但先不告訴你結果。因為我更想知道，不同位置的人會怎麼看。",
        `這件事背後其實是「${a.theme}」。沒有誰一定對，也沒有一句話能處理所有情況。`,
      ],
      storyboard: [
        "0–3 秒｜鏡頭直視，畫面打上「你會怎麼做？」",
        "3–18 秒｜快速交代人物、場景與衝突",
        "18–35 秒｜用左右畫面列出客人與店家兩種立場",
        "35–50 秒｜俊榮說明沒有標準答案，保留結果",
        "50–60 秒｜畫面定格在問題字幕，等待留言",
      ],
      subtitles: [
        "如果是你，會怎麼做？",
        `客人的立場：${customerDesirePhrase(a)}`,
        "店家的立場：現場流程與每位客人的公平",
        "先留言，再看大家怎麼選",
      ],
      cta: pick([
        "A 照原則處理，B 多做一點通融。你選哪一個？",
        "如果是你會怎麼做？留言只要寫下第一個反應。",
        "你覺得誰比較有道理？也歡迎早餐店同行一起回答。",
      ], seed, 5),
    },
  };
  return common[kind];
}

function customerDesirePhrase(a) {
  if (a.theme === "等待與確定感") return "知道還要等多久，不想被遺忘";
  if (a.theme === "肯定與被看見") return "得到一點驚喜和被重視的感覺";
  if (a.theme === "價值與選擇") return "確認自己花的錢值得";
  if (a.type === "product") return "知道這個新品能不能解決自己的需要";
  return "被理解，也被公平地對待";
}

function generateStudio(rawMaterial, version = 0) {
  const material = clean(rawMaterial);
  const analysis = understand(material);
  const observations = buildAnalyses(analysis);
  return {
    material,
    meta: {
      type: analysis.type,
      theme: analysis.theme,
      brand: "艾格森蛋餅 Egg Grove",
      series: "早餐店人生觀察室",
    },
    observations,
    scripts: [
      createVariant("visit", analysis, observations, version),
      createVariant("life", analysis, observations, version),
      createVariant("product", analysis, observations, version),
      createVariant("comment", analysis, observations, version),
    ],
  };
}

window.generateStudio = generateStudio;
