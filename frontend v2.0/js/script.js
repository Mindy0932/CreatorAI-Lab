const button = document.getElementById("btn");
const resultDiv = document.getElementById("result");
const inputBox = document.getElementById("input");

let selectedStyle = "viral";

/* =========================
   STYLE SWITCH
========================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".direction-btn");
  if (!btn) return;

  document.querySelectorAll(".direction-btn").forEach(b => {
    b.classList.remove("active");
  });

  btn.classList.add("active");

  selectedStyle = btn.dataset.style || "viral";
});

/* =========================
   TYPE EFFECT
========================= */
function typeText(el, text, speed = 15) {
  el.innerHTML = "";
  let i = 0;

  const t = setInterval(() => {
    el.innerHTML += text[i];
    i++;
    if (i >= text.length) clearInterval(t);
  }, speed);
}

/* =========================
   MAIN
========================= */
button.addEventListener("click", async () => {

  const input = inputBox.value.trim();
  if (!input) return;

  resultDiv.innerHTML = "";
  button.disabled = true;
  button.textContent = "Generating...";

  const loading = document.createElement("div");
  loading.className = "card";
  loading.textContent = "AI thinking...";
  resultDiv.appendChild(loading);

  try {

    const res = await fetch("https://YOUR_BACKEND_URL/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        style: selectedStyle
      })
    });

    const data = await res.json();

    resultDiv.innerHTML = "";

    const ideas = data.ideas || [];

    /* =========================
       AI GUIDE
    ========================= */
    const guide = document.createElement("div");
    guide.className = "card";
    guide.innerHTML = `<h3>🧠 AI Guide</h3>`;
    resultDiv.appendChild(guide);

    typeText(
      guide,
      `Analyzing...\nStyle: ${selectedStyle}\nDone.`,
      20
    );

    /* =========================
       RECOMMENDED CARD (FIXED)
    ========================= */
    if (ideas.length > 0) {

      const idea = ideas[0];

      let rawPrompt =
        idea.imagePrompt?.trim() ||
        idea.concept?.trim() ||
        idea.title?.trim() ||
        "creative idea";

      const prompt = encodeURIComponent(rawPrompt.slice(0, 120));

      const rec = document.createElement("div");
      rec.className = "card recommended";

      rec.innerHTML = `
        <div class="badge">⭐ Highly Recommended</div>

        <img src="https://image.pollinations.ai/prompt/${prompt}"
             onerror="this.src='https://placehold.co/800x400?text=AI+Image'">

        <h2>${idea.title || ""}</h2>
        <p>${idea.reason || ""}</p>

        <div># ${(idea.tags || []).join(" # ")}</div>
      `;

      resultDiv.appendChild(rec);
    }

    /* =========================
       OTHER IDEAS
    ========================= */
    for (let i = 1; i < ideas.length; i++) {

      const idea = ideas[i];

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${idea.title}</h3>
        <p>${idea.reason}</p>
        <div># ${(idea.tags || []).join(" # ")}</div>
      `;

      resultDiv.appendChild(card);
    }

  } catch (e) {

    console.error(e);

    resultDiv.innerHTML = `
      <div class="error">ERROR</div>
    `;
  }

  button.disabled = false;
  button.textContent = "Generate";
});