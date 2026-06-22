const topicInput = document.querySelector("#topic");
const count = document.querySelector("#count");
const form = document.querySelector("#generator");
const generateButton = document.querySelector("#generate-button");
const inputWrap = document.querySelector("#input-wrap");
const error = document.querySelector("#error");
const resultShell = document.querySelector("#result");
const resultContent = document.querySelector("#result-content");
const regenerate = document.querySelector("#regenerate");

let currentKey = "";
let version = 0;

const observationLabels = {
  human: ["01", "人性觀察"],
  life: ["02", "人生觀察"],
  business: ["03", "創業觀察"],
  brand: ["04", "品牌觀察"],
  customer: ["05", "客戶觀察"],
};

function selectedStyle() {
  return document.querySelector('input[name="script-style"]:checked')?.value || "all";
}

function setLoading(loading) {
  generateButton.disabled = loading;
  regenerate.disabled = loading;
  generateButton.querySelector("span").textContent = loading ? "內容總監分析中..." : "生成 V2 腳本";
}

function editable(tag, text, className = "") {
  const node = document.createElement(tag);
  node.className = `editable ${className}`.trim();
  node.contentEditable = "true";
  node.spellcheck = true;
  node.textContent = text;
  return node;
}

async function copyScope(button) {
  const scope = button.closest(".copy-scope");
  const clone = scope.cloneNode(true);
  clone.querySelectorAll("button, .score-bar-track").forEach((item) => item.remove());
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
  button.addEventListener("click", () => copyScope(button));
  return button;
}

function sectionHeading(number, title, label = "複製") {
  const row = document.createElement("div");
  row.className = "section-heading";
  const name = document.createElement("div");
  name.className = "section-title";
  const index = document.createElement("span");
  const heading = document.createElement("h2");
  index.textContent = number;
  heading.textContent = title;
  name.append(index, heading);
  row.append(name, copyButton(label));
  return row;
}

function renderObservations(observations) {
  const block = document.createElement("section");
  block.className = "analysis-block";
  block.innerHTML = `
    <div class="block-label">HUMAN INSIGHT ENGINE / 人性觀察引擎</div>
    <div class="block-title-row">
      <h2>先看懂人，再決定內容怎麼說</h2>
      <span>所有文字皆可點擊修改</span>
    </div>
  `;
  const grid = document.createElement("div");
  grid.className = "analysis-grid";
  Object.entries(observationLabels).forEach(([key, [number, title]]) => {
    const card = document.createElement("article");
    card.className = "analysis-card copy-scope";
    card.append(sectionHeading(number, title));
    card.append(editable("p", observations[key]));
    grid.append(card);
  });
  block.append(grid);
  return block;
}

function textField(label, value, type = "default") {
  const field = document.createElement("div");
  field.className = `script-field script-field-${type} copy-scope`;
  const heading = document.createElement("div");
  heading.className = "field-label";
  const title = document.createElement("h4");
  title.textContent = label;
  heading.append(title, copyButton());
  field.append(heading, editable("p", value, type === "hook" ? "hook-editable" : ""));
  return field;
}

function listCard(title, eyebrow, values, ordered = true, className = "") {
  const card = document.createElement("article");
  card.className = `output-card copy-scope ${className}`.trim();
  card.append(sectionHeading(eyebrow, title, "複製此卡"));
  const list = document.createElement(ordered ? "ol" : "ul");
  list.className = "output-list";
  values.forEach((value) => {
    const item = document.createElement("li");
    item.append(editable("span", value));
    list.append(item);
  });
  card.append(list);
  return card;
}

function renderScriptCard(script) {
  const card = document.createElement("article");
  card.className = "script-card copy-scope";
  const top = document.createElement("div");
  top.className = "script-card-top";
  const identity = document.createElement("div");
  identity.innerHTML = `<span>SCRIPT / ${script.id.toUpperCase()}</span>`;
  identity.append(editable("h3", script.name));
  top.append(identity, copyButton("複製腳本"));
  card.append(top);
  card.append(textField("1. 標題", script.title, "title"));
  card.append(textField("2. 前 3 秒 Hook", script.hook, "hook"));
  card.append(textField("3. 30 秒腳本", script.script30, "long"));
  card.append(textField("4. 60 秒腳本", script.script60, "long"));
  card.append(textField("7. CTA", script.cta, "cta"));
  return card;
}

function socialPost(label, content) {
  const section = document.createElement("div");
  section.className = "social-post copy-scope";
  const top = document.createElement("div");
  top.className = "social-post-top";
  const title = document.createElement("h4");
  title.textContent = label;
  top.append(title, copyButton());
  section.append(top, editable("p", content));
  return section;
}

function renderSocialCard(posts) {
  const card = document.createElement("article");
  card.className = "output-card social-card";
  const heading = document.createElement("div");
  heading.className = "section-heading";
  heading.innerHTML = `<div class="section-title"><span>08–10</span><h2>社群文案卡</h2></div>`;
  card.append(heading);
  card.append(socialPost("8. IG 貼文", posts.ig));
  card.append(socialPost("9. Facebook 貼文", posts.facebook));
  card.append(socialPost("10. Threads 貼文", posts.threads));
  return card;
}

function renderScoreCard(score) {
  const card = document.createElement("article");
  card.className = "score-card copy-scope";
  const top = document.createElement("div");
  top.className = "score-top";
  const title = document.createElement("div");
  title.innerHTML = `<span>VIRAL POTENTIAL</span><h3>爆款潛力</h3>`;
  const total = document.createElement("strong");
  total.textContent = `${score.total}分`;
  top.append(title, total, copyButton("複製評分"));
  card.append(top);

  const bars = document.createElement("div");
  bars.className = "score-bars";
  Object.entries(score.items).forEach(([name, value]) => {
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <div><span>${name}</span><b>${value}</b></div>
      <div class="score-bar-track"><i style="width:${value}%"></i></div>
    `;
    bars.append(row);
  });

  const notes = document.createElement("div");
  notes.className = "score-notes";
  const strengths = document.createElement("div");
  strengths.innerHTML = "<h4>優點</h4>";
  const goodList = document.createElement("ul");
  score.strengths.forEach((item) => {
    const li = document.createElement("li");
    li.append(editable("span", item));
    goodList.append(li);
  });
  strengths.append(goodList);
  const improvements = document.createElement("div");
  improvements.innerHTML = "<h4>可加強</h4>";
  const improveList = document.createElement("ul");
  score.improvements.forEach((item) => {
    const li = document.createElement("li");
    li.append(editable("span", item));
    improveList.append(li);
  });
  improvements.append(improveList);
  notes.append(strengths, improvements);
  card.append(bars, notes);
  return card;
}

function renderVersion(script, index) {
  const group = document.createElement("section");
  group.className = "version-group";
  const header = document.createElement("div");
  header.className = "version-heading";
  header.innerHTML = `
    <div><span>VERSION ${String(index + 1).padStart(2, "0")}</span><h2>${script.name}</h2></div>
    <p>Hook → 故事 → 人性 → 人生 → 品牌／產品 → CTA</p>
  `;
  const grid = document.createElement("div");
  grid.className = "version-grid";
  grid.append(renderScriptCard(script));
  const side = document.createElement("div");
  side.className = "version-side";
  side.append(
    listCard("5. 分鏡畫面", "STORYBOARD", script.storyboard, true, "storyboard-card"),
    listCard("6. 字幕重點", "SUBTITLES", script.subtitles, false, "subtitles-card"),
  );
  grid.append(side);
  group.append(header, grid, renderSocialCard(script.posts), renderScoreCard(script.score));
  return group;
}

function render(result) {
  resultContent.replaceChildren();
  const meta = document.createElement("div");
  meta.className = "result-meta";
  meta.innerHTML = `
    <span>自動分類｜${result.meta.category}</span>
    <span>觀察主題｜${result.meta.theme}</span>
    <span>${result.meta.brand}</span>
    <span>${result.meta.series}</span>
  `;
  resultContent.append(meta, renderObservations(result.observations));

  const heading = document.createElement("div");
  heading.className = "scripts-heading";
  heading.innerHTML = `
    <div class="block-label">SCRIPT SYSTEM / V2 腳本系統</div>
    <div class="block-title-row">
      <h2>${result.scripts.length === 1 ? result.scripts[0].name : "六種風格，完整生成"}</h2>
      <span>70% 探店感・20% 人生觀察・10% 產品介紹</span>
    </div>
  `;
  resultContent.append(heading);
  result.scripts.forEach((script, index) => resultContent.append(renderVersion(script, index)));
  resultShell.hidden = false;
}

function generate(isRegenerate = false) {
  const topic = topicInput.value.trim();
  const style = selectedStyle();
  if (!topic) {
    error.textContent = "先輸入一件早餐店裡發生的小事、新品、互動、夥伴故事或店內活動。";
    error.hidden = false;
    inputWrap.classList.add("has-error");
    topicInput.focus();
    return;
  }
  error.hidden = true;
  inputWrap.classList.remove("has-error");
  const key = `${topic}::${style}`;
  if (key !== currentKey) {
    currentKey = key;
    version = 0;
  } else if (isRegenerate) {
    version += 1;
  }
  setLoading(true);
  window.setTimeout(() => {
    render(window.generateStudioV2(topic, style, version));
    setLoading(false);
    resultShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 650);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate(false);
});

regenerate.addEventListener("click", () => generate(true));

document.querySelector("#copy-all").addEventListener("click", async (event) => {
  const clone = resultContent.cloneNode(true);
  clone.querySelectorAll("button, .score-bar-track").forEach((item) => item.remove());
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
    topicInput.value = button.dataset.example;
    topicInput.dispatchEvent(new Event("input"));
    topicInput.focus();
  });
});
