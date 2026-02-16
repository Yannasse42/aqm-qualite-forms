import "./style.css";
import { getSessionName, setSessionName, getProgress, resetProgress, goForm } from "./flow.js";

const params = new URLSearchParams(window.location.search);
const sessionFromUrl = params.get("session");

document.querySelector("#app").innerHTML = `
  <div class="page">
    <div class="card" style="max-width:900px;margin:auto;">
      <div class="header">
        <div class="brand">
          <img src="/logo.png" alt="Biometrics" />
          <div class="hgroup">
            <div class="title">AQM – Formulaires Qualité</div>
            <div class="subtitle">Workflow : Pré → Post → Évaluation</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="qtitle">Session</div>
        <div class="small">Ex : CHU_LILLE_1602 (dossier dans Supabase)</div>
        <input id="session" type="text" placeholder="Session_Test" style="margin-top:8px;" />

        <div class="q" style="margin-top:14px;">
          <div class="qtitle" style="margin:0 0 8px 0;">Progression</div>
          <div class="small" id="progText">—</div>
        </div>

        <div class="actions" style="margin-top:14px; gap:10px; flex-wrap:wrap;">
          <button class="primary" id="goPre">1) QCM Pré</button>
          <button class="primary" id="goPost">2) QCM Post</button>
          <button class="primary" id="goEval">3) Évaluation</button>
          <button id="reset">Réinitialiser</button>
        </div>

        <div class="small" style="margin-top:10px; opacity:.8;">
          Les boutons se débloquent automatiquement quand l’upload est fait.
        </div>

        <div class="status" id="status" style="margin-top:10px;"></div>
      </div>
    </div>
  </div>
`;

const input = document.getElementById("session");
const status = document.getElementById("status");
const progText = document.getElementById("progText");
const btnPre = document.getElementById("goPre");
const btnPost = document.getElementById("goPost");
const btnEval = document.getElementById("goEval");

const currentSession = sessionFromUrl || getSessionName();
input.value = currentSession;
setSessionName(currentSession);

async function refreshUI() {
  const s = (input.value || "Session_Test").trim();
  setSessionName(s);
  const p = await getProgress(s);

  progText.textContent = `Pré: ${p.pre ? "✅" : "⏳"}  •  Post: ${p.post ? "✅" : "⏳"}  •  Éval: ${p.eval ? "✅" : "⏳"}`;

  // verrouillage
  btnPost.disabled = !p.pre;
  btnEval.disabled = !p.pre || !p.post;

  // style disabled (si ton CSS ne le fait pas déjà)
  [btnPost, btnEval].forEach((b) => {
    b.style.opacity = b.disabled ? "0.45" : "1";
    b.style.cursor = b.disabled ? "not-allowed" : "pointer";
  });
}

input.addEventListener("input", () => refreshUI());

btnPre.onclick = () => { const s = (input.value || "Session_Test").trim(); goForm("pre", s); };
btnPost.onclick = () => { const s = (input.value || "Session_Test").trim(); goForm("post", s); };
btnEval.onclick = () => { const s = (input.value || "Session_Test").trim(); goForm("eval", s); };

document.getElementById("reset").onclick = () => {
  const s = (input.value || "Session_Test").trim();
  resetProgress(s);
  status.textContent = "✅ Progression réinitialisée.";
  setTimeout(() => (status.textContent = ""), 1200);
  refreshUI();
};

refreshUI();
