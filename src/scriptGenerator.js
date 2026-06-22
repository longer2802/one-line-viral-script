const CREATOR_CONTEXT = {
  creator: "黃俊榮（俊榮 Longer）",
  roles: ["早餐店老闆", "創業家", "財富教練", "美食探店者"],
  content: ["分享美食", "分享創業", "分享人生觀察", "分享理財思維"],
  principle: "不是介紹食物，而是透過食物講故事、透過店家講人生、透過創業講思維。",
  priority: ["情緒", "故事", "觀點", "美食", "店家資訊"],
};

const clean = (value) =>
  value.trim().replace(/\s+/g, " ").replace(/[。！!？?]+$/g, "");

const hash = (text) =>
  [...text].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) >>> 0, 5381);

const pick = (items, seed, offset = 0) =>
  items[Math.abs(seed + offset * 97) % items.length];

const short = (text, length = 12) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

const has = (text, words) => words.some((word) => text.includes(word));

function analyzeTopic(text) {
  const seed = hash(text);
  const subject = extractSubject(text);
  const location = text.match(/屏東|九如|高雄|台南|台中|台北|[一-龥]{2,4}(?:鄉|鎮|區|市)/)?.[0] || "屏東";
  const observation = inferObservation(text);
  const mindset = inferMindset(text, observation);
  const emotion = inferEmotion(text);
  const food = inferFood(text, subject);
  const person = text.match(/老闆|老闆娘|夫妻|阿嬤|阿公|爸爸|媽媽|師傅|店員|一家人/)?.[0] || "做早餐的人";

  return { text, seed, subject, location, observation, mindset, emotion, food, person };
}

function extractSubject(text) {
  const first = text.split(/[，。；;]/)[0].trim();
  return short(first.replace(/^(主題|店名|美食)\s*[：:]\s*/, ""), 18) || "這家店";
}

function inferFood(text, fallback) {
  const match = text.match(/飯湯|蛋餅|吐司|豆漿|咖啡|拿鐵|漢堡|麵|粥|燒餅|油條|早餐|小籠包|水煎包|肉燥飯|鍋燒|蘿蔔糕/);
  return match?.[0] || fallback;
}

function inferObservation(text) {
  if (has(text, ["年", "老店", "每天", "凌晨", "堅持", "傳承"])) return "堅持";
  if (has(text, ["夫妻", "爸爸", "媽媽", "阿嬤", "阿公", "家人", "一家"])) return "家庭";
  if (has(text, ["創業", "開店", "成本", "賠", "生意", "老闆"])) return "創業";
  if (has(text, ["客人", "招呼", "記得", "人情", "鄰居"])) return "人情味";
  if (has(text, ["傳統", "文化", "市場", "在地", "屏東", "九如"])) return "文化";
  return "努力";
}

function inferMindset(text, observation) {
  if (has(text, ["錢", "價格", "便宜", "貴", "成本"])) return "財富思維";
  if (observation === "創業" || has(text, ["開店", "生意"])) return "創業思維";
  if (observation === "家庭") return "家庭思維";
  if (has(text, ["服務", "客人", "招呼"])) return "服務思維";
  if (has(text, ["品牌", "傳承", "在地"])) return "品牌思維";
  return "人生思維";
}

function inferEmotion(text) {
  if (has(text, ["辛苦", "凌晨", "堅持", "年"])) return "敬佩";
  if (has(text, ["家人", "夫妻", "阿嬤", "阿公"])) return "溫暖";
  if (has(text, ["失敗", "賠", "離開", "關店"])) return "心疼";
  return "意外";
}

function insightLine(a) {
  const map = {
    堅持: "真正難的不是做好一次，而是沒人看見時，還願意每天做好。",
    家庭: "一家店能走得久，靠的不只是分工，而是有人願意一起扛住生活。",
    創業: "創業不是把夢想說得多大，而是把同一件小事，穩定做好很多次。",
    人情味: "客人會忘記價格，卻很難忘記自己被怎麼對待。",
    文化: "一種味道能留下來，是因為有人願意替一個地方守住記憶。",
    努力: "努力真正有價值的時候，是它慢慢變成別人可以信任的日常。",
  };
  return map[a.observation];
}

function upperThought(a) {
  const map = {
    "創業思維": `很多人以為${a.person}賣的是${a.food}，其實賣的是一次次兌現承諾。`,
    "財富思維": "真正值得的價格，不只是買到食物，而是買到時間、手藝和不必擔心的信任。",
    "人生思維": `很多人以為平凡沒有故事，其實能把${a.food}做好很多年，本身就是答案。`,
    "家庭思維": "一起吃飯看起來很平常，但很多家庭最珍貴的記憶，都發生在同一張桌上。",
    "品牌思維": `品牌不是招牌有多大，而是提到${a.subject}時，大家會想起同一種感受。`,
    "服務思維": "真正好的服務，不是多說幾句歡迎光臨，而是讓人感覺自己有被記得。",
  };
  return map[a.mindset];
}

function goldLine(a) {
  const map = {
    堅持: "真正讓人懷念的，不只是味道，而是有人一直都在。",
    家庭: "真正讓人懷念的，從來不是食物，而是一起吃飯的人。",
    創業: "生意能做多久，最後看的不是運氣，而是你願意為誰一直做下去。",
    人情味: "一間店最貴的不是裝潢，而是客人走進來時，那份被記得的感覺。",
    文化: "食物會被吃完，但一個地方的記憶，可以被一代一代留下來。",
    努力: "便宜的不是早餐，而是有人願意每天早起，替你準備一個開始。",
  };
  return map[a.observation];
}

function hookOptions(a) {
  return [
    `這可能是${a.location}最不會做生意的一家店。`,
    "如果你正在創業，這段一定要看完。",
    "我原本只是來吃早餐，結果看到一件很有意思的事。",
    `${a.location}人一定懂這種感覺。`,
  ];
}

function buildScriptLines(a, hook) {
  const subject = short(a.subject, 10);
  const food = short(a.food, 8);
  const lines = [
    hook,
    `今天來到${short(a.location, 5)}`,
    `原本只想吃${food}`,
    "但我先注意到人",
    `店裡沒有大場面`,
    `只有反覆的日常`,
    `同一個動作`,
    `每天再做一次`,
    insightLine(a),
    "結果最意外的是",
    `眼前這份${food}`,
    "不是因為多豪華",
    "而是每一口裡",
    `都有${a.observation}`,
    upperThought(a),
    goldLine(a),
    `這裡是${subject}`,
  ];
  return lines.flatMap((line) => splitCaption(line));
}

function splitCaption(text, max = 15) {
  const value = text.replace(/[，。]/g, (mark) => mark);
  if (value.length <= max) return [value];
  const parts = value.split(/(?<=[，。！？])/).filter(Boolean);
  if (parts.length > 1 && parts.every((part) => part.length <= max)) return parts;
  const result = [];
  let current = value;
  while (current.length > max) {
    result.push(current.slice(0, max));
    current = current.slice(max);
  }
  if (current) result.push(current);
  return result;
}

function buildShots(a, hook, scriptLines) {
  const subtitles = [
    short(hook, 14),
    `我先看到的不是${short(a.food, 5)}`,
    `${a.observation}，才是靈魂`,
    short(upperThought(a), 14),
    short(goldLine(a), 14),
  ];
  return [
    {
      shot: "鏡頭1",
      visual: `手持鏡頭走進${a.location}街道，再帶到店門口；不要先拍食物。`,
      voiceover: hook,
      subtitle: subtitles[0],
      duration: "0–3 秒",
    },
    {
      shot: "鏡頭2",
      visual: `拍${a.person}、店內習慣、備料雙手與客人互動，保留現場聲。`,
      voiceover: scriptLines.slice(1, 6).join(" "),
      subtitle: subtitles[1],
      duration: "3–15 秒",
    },
    {
      shot: "鏡頭3",
      visual: `近拍重複工作的細節，從人物表情帶出「${a.observation}」。`,
      voiceover: `${insightLine(a)} 我看到的不是一份早餐，而是一個人怎麼面對每天的生活。`,
      subtitle: subtitles[2],
      duration: "15–30 秒",
    },
    {
      shot: "鏡頭4",
      visual: `到影片中段才讓${a.food}完整出場，拍製作、盛裝與第一口。`,
      voiceover: `結果最讓我意外的是這份${a.food}。不是因為它多豪華，而是${upperThought(a)}`,
      subtitle: subtitles[3],
      duration: "30–47 秒",
    },
    {
      shot: "鏡頭5",
      visual: `俊榮與店家或食物同框，最後停在店內真實日常，不做硬性促銷。`,
      voiceover: `${goldLine(a)} ${primaryCta(a)}`,
      subtitle: subtitles[4],
      duration: "47–60 秒",
    },
  ];
}

function primaryCta(a) {
  if (a.observation === "創業" || a.observation === "堅持") {
    return "如果是你，願意每天提早起床，把同一件事做好嗎？";
  }
  if (a.observation === "家庭") return "你心中最有故事的一頓飯，是跟誰一起吃的？";
  return "你心中最有故事的一家店是哪間？留言告訴我。";
}

function buildCtas(a) {
  return [
    primaryCta(a),
    "你吃過哪一家店，記住的不是味道，而是老闆？",
    `如果要帶朋友認識${a.location}，你第一站會帶他去哪裡？`,
  ];
}

function buildCovers(a) {
  return [
    `${short(a.subject, 9)}賣的不是早餐`,
    `最不會做生意的店？`,
    `這份${short(a.food, 6)}藏著一段人生`,
  ];
}

function generateDirectorScript(rawTopic, version = 0) {
  const topic = clean(rawTopic);
  const analysis = analyzeTopic(topic);
  const hook = pick(hookOptions(analysis), analysis.seed, version);
  const scriptLines = buildScriptLines(analysis, hook);
  const title = pick([
    `${analysis.subject}賣的不是${analysis.food}，而是${analysis.observation}`,
    `我原本只是來吃${analysis.food}，最後記住的卻是人`,
    `${analysis.location}這家店，最值錢的不是招牌`,
    `一份${analysis.food}背後，藏著${analysis.person}的日常`,
  ], analysis.seed, version + 2);
  const ctas = buildCtas(analysis);

  return {
    role: CREATOR_CONTEXT,
    meta: {
      subject: analysis.subject,
      emotion: analysis.emotion,
      observation: analysis.observation,
      mindset: analysis.mindset,
      priority: CREATOR_CONTEXT.priority.join(" → "),
    },
    title,
    hook,
    script60: scriptLines.join("\n"),
    shots: buildShots(analysis, hook, scriptLines),
    covers: buildCovers(analysis),
    ctas,
    pinnedComment: `我最想知道的是：${ctas[0]} 我會認真看每一則留言，下一站也可能照你說的去拍。`,
  };
}

window.generateDirectorScript = generateDirectorScript;
