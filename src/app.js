const topicInput = document.querySelector("#topic");
const count = document.querySelector("#count");
const form = document.querySelector("#generator");
const generateButton = document.querySelector("#generate-button");
const inputWrap = document.querySelector("#input-wrap");
const error = document.querySelector("#error");
const resultShell = document.querySelector("#result");
const resultContent = document.querySelector("#result-content");
const regenerate = document.querySelector("#regenerate");

let currentTopic = "";
let version = 0;

const labels = {
  human: ["01", "人性觀察分析"],
  life: ["02", "人生觀察分析"],
  business: ["03", "創業觀察分析"],
  brand: ["04", "品牌觀察分析"],
  customer: ["05", "客戶觀察分析"],
};

function setLoading(loading) {
  generateButton.disabled = loading;
  regenerate.disabled = loading;
  generateButton.querySelector("span").textContent = loading ? "正在觀察..." : "生成內容企劃";
}

function editable(tag, text, className = "") {
  const node = document.createElement(tag);
  node.className = `editable ${className}`.trim();
  node.contentEditable = "true";
  node.spellcheck = true;
  node.textContent = text;
  return node;
}

function makeCopyButton(label = "複製") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-button";
  button.textContent = `▣ ${label}`;
  button.addEventListener("click", async () => {
    const scope = button.closest(".copy-scope");
    const clone = scope.cloneNode(true);
    clone.querySelectorAll("button").forEach((item) => item.remove());
    await navigator.clipboard.writeText(clone.innerText.trim());
    const old = button.textContent;
    button.textContent = "✓ 已複製修改內容";
    window.setTimeout(() => (button.textContent = old), 1500);
  });
  return button;
}

function heading(number, title, copyLabel) {
  const row = document.createElement("div");
  row.className = "section-heading";
  const titleWrap = document.createElement("div");
  titleWrap.className = "section-title";
  titleWrap.innerHTML = `<span>${number}</span><h2>${title}</h2>`;
  row.append(titleWrap, makeCopyButton(copyLabel));
  return row;
}

function renderObservations(observations) {
  const wrap = document.createElement("section");
  wrap.className = "analysis-block";
  wrap.innerHTML = `
    <div class="block-label">OBSERVATION / 觀察拆解</div>
    <div class="block-title-row">
      <h2>先看懂這件事，再開始寫腳本</h2>
      <span>點擊文字即可修改</span>
    </div>
  `;
  const grid = document.createElement("div");
  grid.className = "analysis-grid";
  Object.entries(labels).forEach(([key, [number, title]]) => {
    const card = document.createElement("article");
    card.className = "analysis-card copy-scope";
    card.append(heading(number, title, "複製"));
    card.append(editable("p", observations[key]));
    grid.append(card);
  });
  wrap.append(grid);
  return wrap;
}

function field(label, value, kind = "text") {
  const wrap = document.createElement("div");
  wrap.className = `script-field script-field-${kind}`;
  const title = document.createElement("h4");
  title.textContent = label;
  wrap.append(title);
  if (Array.isArray(value)) {
    const list = document.createElement(kind === "storyboard" ? "ol" : "ul");
    value.forEach((item) => {
      const li = document.createElement("li");
      li.append(editable("span", item));
      list.append(li);
    });
    wrap.append(list);
  } else {
    wrap.append(editable("p", value, kind === "hook" ? "hook-editable" : ""));
  }
  return wrap;
}

function renderScript(script, index) {
  const card = document.createElement("article");
  card.className = "script-card copy-scope";
  const top = document.createElement("div");
  top.className = "script-card-top";
  const identity = document.createElement("div");
  identity.innerHTML = `<span>VERSION ${String(index + 1).padStart(2, "0")}</span>`;
  identity.append(editable("h3", script.name));
  top.append(identity, makeCopyButton("複製本版"));
  card.append(top);
  card.append(field("標題", script.title, "title"));
  card.append(field("前 3 秒 Hook", script.hook, "hook"));
  card.append(field("分鏡", script.storyboard, "storyboard"));
  card.append(field("口播", script.voiceover, "voiceover"));
  card.append(field("重點字幕", script.subtitles, "subtitles"));
  card.append(field("CTA", script.cta, "cta"));
  return card;
}

function render(result) {
  resultContent.replaceChildren();
  const meta = document.createElement("div");
  meta.className = "result-meta";
  meta.innerHTML = `
    <span>${result.meta.series}</span>
    <span>${result.meta.theme}</span>
    <span>${result.meta.brand}</span>
  `;
  resultContent.append(meta, renderObservations(result.observations));

  const scriptsBlock = document.createElement("section");
  scriptsBlock.className = "scripts-block";
  scriptsBlock.innerHTML = `
    <div class="block-label">CONTENT / 四種內容角度</div>
    <div class="block-title-row">
      <h2>同一份素材，四種拍法</h2>
      <span>70% 探店感・20% 人生觀察・10% 產品</span>
    </div>
  `;
  const scripts = document.createElement("div");
  scripts.className = "scripts-list";
  result.scripts.forEach((script, index) => scripts.append(renderScript(script, index)));
  scriptsBlock.append(scripts);
  resultContent.append(scriptsBlock);
  resultShell.hidden = false;
}

function generate(isRegenerate = false) {
  const topic = topicInput.value.trim();
  if (!topic) {
    error.textContent = "先放進一段早餐店素材、故事、觀點或新品資訊。";
    error.hidden = false;
    inputWrap.classList.add("has-error");
    topicInput.focus();
    return;
  }
  error.hidden = true;
  inputWrap.classList.remove("has-error");
  if (topic !== currentTopic) {
    currentTopic = topic;
    version = 0;
  } else if (isRegenerate) {
    version += 1;
  }
  setLoading(true);
  window.setTimeout(() => {
    render(window.generateStudio(topic, version));
    setLoading(false);
    resultShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 550);
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
    topicInput.value = button.dataset.example;
    topicInput.dispatchEvent(new Event("input"));
    topicInput.focus();
  });
});
