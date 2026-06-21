const topicInput = document.querySelector("#topic");
const count = document.querySelector("#count");
const form = document.querySelector("#generator");
const generateButton = document.querySelector("#generate-button");
const inputWrap = document.querySelector("#input-wrap");
const error = document.querySelector("#error");
const resultShell = document.querySelector("#result");
const regenerate = document.querySelector("#regenerate");

let currentResult = null;
let currentTopic = "";
let version = 0;

const setLoading = (loading) => {
  generateButton.disabled = loading;
  regenerate.disabled = loading;
  generateButton.querySelector("span").textContent = loading ? "正在說故事..." : "生成腳本";
};

const showError = (message) => {
  error.textContent = message;
  error.hidden = false;
  inputWrap.classList.add("has-error");
};

const clearError = () => {
  error.hidden = true;
  inputWrap.classList.remove("has-error");
};

const fullText = () => {
  if (!currentResult) return "";
  return [
    `標題｜${currentResult.title}`,
    `前 3 秒 Hook｜${currentResult.hook}`,
    `60 秒腳本｜\n${currentResult.script}`,
    `畫面提示｜\n${currentResult.visuals.map((item, index) => `${index + 1}. ${item}`).join("\n")}`,
    `CTA｜${currentResult.cta}`,
  ].join("\n\n");
};

const render = (result) => {
  document.querySelector("#output-title").textContent = result.title;
  document.querySelector("#output-hook").textContent = `「${result.hook}」`;

  const scriptOutput = document.querySelector("#output-script");
  scriptOutput.replaceChildren();
  result.script.split("\n\n").forEach((paragraph) => {
    const node = document.createElement("p");
    node.textContent = paragraph;
    scriptOutput.append(node);
  });

  const visualOutput = document.querySelector("#output-visuals");
  visualOutput.replaceChildren();
  result.visuals.forEach((visual, index) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    const text = document.createElement("p");
    number.textContent = String(index + 1).padStart(2, "0");
    text.textContent = visual;
    item.append(number, text);
    visualOutput.append(item);
  });

  document.querySelector("#output-cta").textContent = result.cta;
  resultShell.hidden = false;
};

const generate = (isRegenerate = false) => {
  const topic = topicInput.value.trim();
  if (!topic) {
    showError("先給我一句話，我才能幫你把故事說好。");
    topicInput.focus();
    return;
  }

  clearError();
  if (topic !== currentTopic) {
    currentTopic = topic;
    version = 0;
  } else if (isRegenerate) {
    version += 1;
  }
  setLoading(true);
  window.setTimeout(() => {
    currentResult = window.generateScript(topic, version);
    render(currentResult);
    setLoading(false);
    resultShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 650);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

regenerate.addEventListener("click", () => generate(true));

topicInput.addEventListener("input", () => {
  count.textContent = `${topicInput.value.length}/500`;
  topicInput.style.height = "auto";
  topicInput.style.height = `${Math.min(topicInput.scrollHeight, 190)}px`;
  clearError();
});

document.querySelectorAll("[data-example]").forEach((button) => {
  button.addEventListener("click", () => {
    topicInput.value = button.dataset.example;
    count.textContent = `${topicInput.value.length}/500`;
    topicInput.dispatchEvent(new Event("input"));
    clearError();
    topicInput.focus();
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!currentResult) return;
    const key = button.dataset.copy;
    const values = {
      all: fullText(),
      title: currentResult.title,
      hook: currentResult.hook,
      script: currentResult.script,
      visuals: currentResult.visuals.join("\n"),
      cta: currentResult.cta,
    };

    await navigator.clipboard.writeText(values[key]);
    const oldText = button.textContent;
    button.textContent = "✓ 已複製";
    window.setTimeout(() => {
      button.textContent = oldText;
    }, 1500);
  });
});
