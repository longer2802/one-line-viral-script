const topicInput = document.querySelector("#topic");
const count = document.querySelector("#count");
const form = document.querySelector("#generator");
const generateButton = document.querySelector("#generate-button");
const inputWrap = document.querySelector("#input-wrap");
const error = document.querySelector("#error");
const resultShell = document.querySelector("#result");
const resultContent = document.querySelector("#result-content");
const regenerate = document.querySelector("#regenerate");
const aiStatus = document.querySelector("#ai-status");
const apiAccess = document.querySelector("#api-access");
const apiPassword = document.querySelector("#api-password");
const modeInputs = [...document.querySelectorAll('input[name="script-mode"]')];

let currentTopic = "";
let currentMode = "director";
let version = 0;

const modeConfig = {
  director: {
    loading: "導演企劃中...",
    button: "生成爆款腳本",
    empty: "請填入店名、美食，最好再補充一個人物、習慣或故事細節。",
    placeholder: "填入店名或美食，也可以補充老闆故事、開店年份、習慣或在地文化…",
    resultTitle: "60 秒爆款拍攝企劃",
  },
  interview: {
    loading: "訪談企劃中...",
    button: "生成訪談腳本",
    empty: "請填入來賓身份、年齡、特徵、收入描述、辛苦處、夢想或想改變的事。",
    placeholder: "填入來賓背景，例如：冷氣師傅，35歲，收入約6萬，最辛苦的是戶外爬高修冷氣，夢想開自己的店…",
    resultTitle: "早餐桌上的人生訪談企劃",
  },
};

function getMode() {
  return modeInputs.find((input) => input.checked)?.value || "director";
}

function applyMode(mode) {
  const config = modeConfig[mode] || modeConfig.director;
  topicInput.placeholder = config.placeholder;
  generateButton.querySelector("span").textContent = config.button;
  document.querySelector(".result-header h2").textContent = config.resultTitle;
}

function setLoading(loading) {
  generateButton.disabled = loading;
  regenerate.disabled = loading;
  const config = modeConfig[getMode()] || modeConfig.director;
  generateButton.querySelector("span").textContent = loading ? config.loading : config.button;
}

function setAiStatus(mode, detail = "") {
  const states = {
    ai: ["● AI 動態生成", "status-ai"],
    fallback: ["● 本機備援生成", "status-fallback"],
    connecting: ["● AI 分析中", "status-connecting"],
    unavailable: ["● AI 尚未連接", "status-unavailable"],
  };
  const [label, className] = states[mode] || states.unavailable;
  aiStatus.textContent = detail ? `${label}｜${detail}` : label;
  aiStatus.className = className;
}

function editable(tag, text, className = "") {
  const node = document.createElement(tag);
  node.className = `editable ${className}`.trim();
  node.contentEditable = "true";
  node.spellcheck = true;
  node.textContent = text;
  return node;
}

async function copyCard(button) {
  const scope = button.closest(".copy-scope");
  const clone = scope.cloneNode(true);
  clone.querySelectorAll("button").forEach((item) => item.remove());
  await navigator.clipboard.writeText(clone.innerText.trim());
  const original = button.textContent;
  button.textContent = "✓ 已複製";
  window.setTimeout(() => (button.textContent = original), 1400);
}

function copyButton(label = "複製") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-button";
  button.textContent = `▣ ${label}`;
  button.addEventListener("click", () => copyCard(button));
  return button;
}

function cardHeading(number, title, copyLabel = "複製此卡") {
  const row = document.createElement("div");
  row.className = "section-heading";
  const name = document.createElement("div");
  name.className = "section-title";
  name.innerHTML = `<span>${number}</span><h2>${title}</h2>`;
  row.append(name, copyButton(copyLabel));
  return row;
}

function textCard(number, title, value, className = "") {
  const card = document.createElement("article");
  card.className = `director-card copy-scope ${className}`.trim();
  card.append(cardHeading(number, title));
  card.append(editable("p", value, title === "前 3 秒 Hook" ? "hook-editable" : ""));
  return card;
}

function listCard(number, title, values, className = "") {
  const card = document.createElement("article");
  card.className = `director-card copy-scope ${className}`.trim();
  card.append(cardHeading(number, title));
  const list = document.createElement("ol");
  list.className = "director-list";
  values.forEach((value) => {
    const item = document.createElement("li");
    item.append(editable("span", value));
    list.append(item);
  });
  card.append(list);
  return card;
}

function renderAnalysis(analysis) {
  const labels = [
    ["情緒核心", analysis.emotional_core],
    ["故事角度", analysis.story_angle],
    ["人性洞察", analysis.human_insight],
    ["上一層思維", analysis.upper_mindset],
    ["美食出場策略", analysis.food_reveal_strategy],
    ["觀眾互動觸發", analysis.audience_trigger],
  ];
  const block = document.createElement("section");
  block.className = "ai-analysis-block";
  const heading = document.createElement("div");
  heading.className = "block-title-row";
  heading.innerHTML = `<h2>AI 導演分析</h2><span>先理解情緒與故事，再開始寫</span>`;
  block.append(heading);
  const grid = document.createElement("div");
  grid.className = "ai-analysis-grid";
  labels.forEach(([label, value], index) => {
    const card = document.createElement("article");
    card.className = "analysis-mini-card copy-scope";
    card.append(cardHeading(String(index + 1).padStart(2, "0"), label));
    card.append(editable("p", value));
    grid.append(card);
  });
  block.append(grid);
  return block;
}

function renderShots(shots) {
  const block = document.createElement("section");
  block.className = "shots-block";
  const heading = document.createElement("div");
  heading.className = "block-title-row";
  heading.innerHTML = `<h2>分鏡腳本</h2><span>5 鏡頭・共 60 秒</span>`;
  block.append(heading);
  const grid = document.createElement("div");
  grid.className = "shots-grid";
  shots.forEach((shot) => {
    const card = document.createElement("article");
    card.className = "shot-card copy-scope";
    const top = document.createElement("div");
    top.className = "shot-top";
    top.innerHTML = `<div><span>${shot.shot}</span><strong>${shot.duration}</strong></div>`;
    top.append(copyButton());
    card.append(top);
    [
      ["畫面內容", shot.visual],
      ["口播內容", shot.voiceover],
      ["字幕內容", shot.subtitle],
    ].forEach(([label, value]) => {
      const field = document.createElement("div");
      field.className = "shot-field";
      const title = document.createElement("h4");
      title.textContent = label;
      field.append(title, editable("p", value));
      card.append(field);
    });
    grid.append(card);
  });
  block.append(grid);
  return block;
}

function render(result) {
  resultContent.replaceChildren();
  const meta = document.createElement("div");
  meta.className = "result-meta";
  meta.innerHTML = `
    <span>情緒｜${result.meta.emotion}</span>
    <span>觀察點｜${result.meta.observation}</span>
    <span>上一層思維｜${result.meta.mindset}</span>
    <span>${result.meta.priority}</span>
  `;
  resultContent.append(meta);
  if (result.analysis) resultContent.append(renderAnalysis(result.analysis));

  const mainGrid = document.createElement("div");
  mainGrid.className = "director-grid";
  mainGrid.append(
    textCard("01", "標題", result.title, "title-card"),
    textCard("02", "前 3 秒 Hook", result.hook, "hook-card"),
  );
  resultContent.append(mainGrid);
  resultContent.append(textCard("03", "60 秒完整腳本", result.script60, "full-script-card"));
  resultContent.append(renderShots(result.shots));

  const extras = document.createElement("div");
  extras.className = "director-extras";
  extras.append(
    listCard("05", "封面標題 3 組", result.covers, "cover-card"),
    listCard("06", "留言 CTA 3 組", result.ctas, "cta-card"),
    textCard("07", "置頂留言 1 組", result.pinnedComment, "pinned-card"),
  );
  resultContent.append(extras);
  resultShell.hidden = false;
}

function normalizeAiResult(result) {
  return {
    ...result,
    script60: result.script_lines.join("\n"),
    pinnedComment: result.pinned_comment,
  };
}

async function requestAi(topic, currentVersion, mode) {
  const baseUrl = String(window.APP_CONFIG?.apiBaseUrl || "").replace(/\/$/, "");
  if (!baseUrl) throw new Error("API_NOT_CONFIGURED");
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-Password": apiPassword.value,
    },
    body: JSON.stringify({ topic, version: currentVersion, mode }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.result) throw new Error(data.error || "AI_REQUEST_FAILED");
  return { result: normalizeAiResult(data.result), model: data.model || "OpenAI" };
}

async function generate(isRegenerate = false) {
  const topic = topicInput.value.trim();
  const mode = getMode();
  const config = modeConfig[mode] || modeConfig.director;
  if (!topic) {
    error.textContent = config.empty;
    error.hidden = false;
    inputWrap.classList.add("has-error");
    topicInput.focus();
    return;
  }
  error.hidden = true;
  inputWrap.classList.remove("has-error");
  if (topic !== currentTopic || mode !== currentMode) {
    currentTopic = topic;
    currentMode = mode;
    version = 0;
  } else if (isRegenerate) {
    version += 1;
  }
  setLoading(true);
  setAiStatus("connecting");
  try {
    const ai = await requestAi(topic, version, mode);
    render(ai.result);
    setAiStatus("ai", ai.model);
  } catch (apiError) {
    console.warn("AI fallback:", apiError.message);
    render(window.generateDirectorScript(topic, version));
    setAiStatus("fallback", apiError.message === "API_NOT_CONFIGURED" ? "後端尚未設定" : "AI 暫時無法使用");
  } finally {
    setLoading(false);
    resultShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate(false);
});

regenerate.addEventListener("click", () => generate(true));

document.querySelector("#copy-all").addEventListener("click", async (event) => {
  const clone = resultContent.cloneNode(true);
  clone.querySelectorAll("button").forEach((item) => item.remove());
  await navigator.clipboard.writeText(clone.innerText.trim());
  const old = event.currentTarget.textContent;
  event.currentTarget.textContent = "✓ 已複製全部修改內容";
  window.setTimeout(() => (event.currentTarget.textContent = old), 1500);
});

topicInput.addEventListener("input", () => {
  count.textContent = `${topicInput.value.length}/1000`;
  topicInput.style.height = "auto";
  topicInput.style.height = `${Math.min(topicInput.scrollHeight, 260)}px`;
  error.hidden = true;
  inputWrap.classList.remove("has-error");
});

document.querySelectorAll("[data-example]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.mode) {
      const target = modeInputs.find((input) => input.value === button.dataset.mode);
      if (target) {
        target.checked = true;
        applyMode(target.value);
      }
    }
    topicInput.value = button.dataset.example;
    topicInput.dispatchEvent(new Event("input"));
    topicInput.focus();
  });
});

modeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    applyMode(getMode());
  });
});

if (window.APP_CONFIG?.apiBaseUrl) {
  apiAccess.hidden = false;
  apiPassword.value = sessionStorage.getItem("longer-ai-access") || "";
  apiPassword.addEventListener("input", () => {
    sessionStorage.setItem("longer-ai-access", apiPassword.value);
  });
}

applyMode(getMode());
setAiStatus(window.APP_CONFIG?.apiBaseUrl ? "unavailable" : "fallback", window.APP_CONFIG?.apiBaseUrl ? "等待生成" : "後端尚未設定");
