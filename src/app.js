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

function setLoading(loading) {
  generateButton.disabled = loading;
  regenerate.disabled = loading;
  generateButton.querySelector("span").textContent = loading ? "導演企劃中..." : "生成爆款腳本";
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

function generate(isRegenerate = false) {
  const topic = topicInput.value.trim();
  if (!topic) {
    error.textContent = "請填入店名、美食，最好再補充一個人物、習慣或故事細節。";
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
    render(window.generateDirectorScript(topic, version));
    setLoading(false);
    resultShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 600);
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
