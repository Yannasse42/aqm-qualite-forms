import "./style.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getSessionName, goHome, markDone, titleCaseName, loadProfile, safeKey, uploadPdf} from "./flow.js";


const QUESTIONS = [
  {
    id: "q1",
    pts: "1 pt",
    text: "Parmi les paramètres suivants, lequel appartient au domaine de l’allure ?",
    choices: [
      ["A", "Temps de double appui"],
      ["B", "Longueur de pas"],
      ["C", "Cadence"],
      ["D", "Angle du pied"],
    ],
    type: "single",
  },
  {
    id: "q2",
    pts: "1 pt",
    text: "Le “walk ratio” est un indicateur de…",
    choices: [
      ["A", "La symétrie inter-membre"],
      ["B", "La coordination bras-jambes"],
      ["C", "L'efficacité entre longueur de pas et cadence"],
      ["D", "La variabilité du cycle de marche"],
    ],
    type: "single",
  },
  {
    id: "q3",
    pts: "1 pt",
    text: "Une augmentation de la largeur de la base de support peut refléter :",
    choices: [
      ["A", "Une réduction de la cadence"],
      ["B", "Une compensation pour améliorer la stabilité"],
      ["C", "Une stratégie pour augmenter la vitesse"],
      ["D", "Une asymétrie spatio-temporelle"],
    ],
    type: "single",
  },
  {
    id: "q4",
    pts: "1 pt",
    text: "Le Gait Variability Index (GVI) mesure :",
    choices: [
      ["A", "L’équilibre global du tronc"],
      ["B", "La stabilité posturale uniquement"],
      ["C", "La variabilité de plusieurs paramètres spatio-temporels"],
      ["D", "Le niveau de performance par rapport à l’âge"],
    ],
    type: "single",
  },
  {
    id: "q5",
    pts: "1 pt",
    text: "Lors d’un enregistrement GAITRite, on observe une phase d’oscillation très écourtée à gauche. Cela peut traduire :",
    choices: [
      ["A", "Une hypertonie du membre controlatéral"],
      ["B", "Une perte d’équilibre à droite"],
      ["C", "Une douleur ou un déficit moteur gauche"],
      ["D", "Une stratégie d’optimisation énergétique"],
    ],
    type: "single",
  },
  {
    id: "q6",
    pts: "1 pt",
    text: "À vitesse constante, une cadence augmentée est généralement associée à :",
    choices: [
      ["A", "Des pas plus longs"],
      ["B", "Une réduction de la phase d’appui"],
      ["C", "Une augmentation de la largeur de pas"],
      ["D", "Des pas plus courts"],
    ],
    type: "single",
  },
  {
    id: "q7",
    pts: "1 pt (2 réponses)",
    text: "Entourez les paramètres typiquement associés au domaine du rythme (plusieurs réponses possibles) :",
    choices: [
      ["A", "Temps de pas"],
      ["B", "Vitesse de marche"],
      ["C", "Temps d’appui"],
      ["D", "Longueur de foulée"],
    ],
    type: "multi",
  },
  {
    id: "q8",
    pts: "1 pt",
    text: "Une asymétrie pathologique est suspectée lorsque :",
    choices: [
      ["A", "Le ratio de la longueur de pas dépasse 1.08"],
      ["B", "Le temps de foulée dépasse 1 seconde"],
      ["C", "La cadence est supérieure à 120 pas/min"],
      ["D", "Le GVI est supérieur à 100"],
    ],
    type: "single",
  },
  {
    id: "q9",
    pts: "1 pt",
    text: "Dans un profil ataxique, les paramètres les plus altérés sont souvent :",
    choices: [
      ["A", "L’allure et la symétrie"],
      ["B", "La cadence et le contrôle postural"],
      ["C", "La variabilité et la stabilité latérale"],
      ["D", "La phase d’appui et le temps d’oscillation"],
    ],
    type: "single",
  },
  {
    id: "q10",
    pts: "1 pt",
    text: "Le principal intérêt du système GAITRite est :",
    choices: [
      ["A", "De visualiser la marche en 3D"],
      ["B", "De détecter des pathologies articulaires"],
      ["C", "D’objectiver des paramètres spatio-temporels précis"],
      ["D", "De mesurer la force musculaire en dynamique"],
    ],
    type: "single",
  },
  {
    id: "q11",
    pts: "0,5 pt",
    text: "En moyenne, quelle est la durée approximative du double appui dans le cycle de marche ?",
    choices: [
      ["A", "5 %"],
      ["B", "10 %"],
      ["C", "20 %"],
      ["D", "40 %"],
    ],
    type: "single",
  },
  {
    id: "q12",
    pts: "0,5 pt",
    text: "Quelle stratégie est souvent utilisée par un patient instable pour sécuriser sa marche ?",
    choices: [
      ["A", "Réduction de la cadence"],
      ["B", "Raccourcissement de la longueur de pas"],
      ["C", "Augmentation de la phase d’oscillation"],
      ["D", "Diminution du nombre de pas"],
    ],
    type: "single",
  },
  {
    id: "q13",
    pts: "0,5 pt",
    text: "En condition normale, la phase d’appui représente environ :",
    choices: [
      ["A", "30 % du cycle"],
      ["B", "50 % du cycle"],
      ["C", "60 % du cycle"],
      ["D", "70 % du cycle"],
    ],
    type: "single",
  },
];

function escapeHtml(s) {
  return (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderQuestion(q, idx) {
  const name = q.id;
  const inputType = q.type === "multi" ? "checkbox" : "radio";

  return `
    <div class="q" data-qid="${q.id}">
      <div class="qtitle">${idx + 1}. ${escapeHtml(q.text)} <span class="small">(${q.pts})</span></div>
      <div class="choices">
        ${q.choices
          .map(([k, label]) => {
            const id = `${q.id}_${k}`;
            return `
              <label class="choice" for="${id}">
                <input id="${id}" type="${inputType}" name="${name}" value="${k}" />
                <div><b>${k}.</b> ${escapeHtml(label)}</div>
              </label>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

document.querySelector("#app").innerHTML = `
  <div class="page">
    <div class="card" id="doc">
      <div class="header">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <button id="back" class="ghost">← Retour</button>
        </div>
        <div class="brand">
          <img src="/logo.png" alt="Biometrics" />
          <div class="hgroup">
            <div class="title">QCM – Évaluation des connaissances (POST FORMATION)</div>
            <div class="subtitle">Pré formation • GAITRite Pro – Analyse spatio-temporelle de la marche</div>
          </div>
        </div>

        <div class="meta">
          <div class="badge">⏱ Durée conseillée : <b>15 min</b></div>
          <div class="badge">✔ Une seule réponse par question (sauf Q7)</div>
        </div>
      </div>

      <div class="section">
        <div class="grid2">
          <label>Nom<br/><input id="nom" type="text" /></label>
          <label>Prénom<br/><input id="prenom" type="text" /></label>
          <label>Date<br/><input id="date" type="date" /></label>
          <label>Nom du centre<br/><input id="centre" type="text" /></label>
          <label style="grid-column: 1 / -1;">Adresse mail<br/><input id="email" type="email" /></label>
        </div>
      </div>

      <div class="section">
        ${QUESTIONS.map(renderQuestion).join("")}
      </div>

      <div class="section">
        <div class="sigWrap">
          <div style="flex:1; min-width:280px;">
            <div class="qtitle" style="margin:0 0 8px 0;">Remarques</div>
            <input id="remarques" type="text" placeholder="(optionnel)" />
            <div class="small" style="margin-top:8px;">Note : (laisser vide si correction par ton logiciel)</div>
            <input id="note" type="text" placeholder="/10" />
          </div>

          <div class="sigBox">
            <div class="qtitle" style="margin:0 0 8px 0;">Signature stagiaire</div>
            <canvas id="sig" width="520" height="160"></canvas>
            <div class="actions" style="margin-top:10px;">
              <button id="clear">Effacer</button>
            </div>
          </div>
        </div>
      </div>

      <div class="section" style="border-bottom:0;">
        <div class="actions">
          <button class="primary" id="export">Exporter PDF</button>
          <span class="status" id="status"></span>
        </div>
      </div>
    </div>
  </div>
`;

// ✅ Auto-remplissage depuis le PRE (compatible async)
const sessionName = getSessionName();

(async () => {
  const prof = await Promise.resolve(loadProfile(sessionName));

  if (prof?.nom && document.getElementById("nom")) document.getElementById("nom").value = prof.nom;
  if (prof?.prenom && document.getElementById("prenom")) document.getElementById("prenom").value = prof.prenom;
  if (prof?.centre && document.getElementById("centre")) document.getElementById("centre").value = prof.centre;
  if (prof?.email && document.getElementById("email")) document.getElementById("email").value = prof.email;
})();

/* ===== Signature (souris + tactile) ===== */
const sig = document.getElementById("sig");
const ctx = sig.getContext("2d");
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

let drawing = false;

document.getElementById("back").onclick = () => {
  goHome(sessionName);
};

function getPos(e) {
  const r = sig.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - r.left, y: clientY - r.top };
}

function startDraw(e) {
  drawing = true;
  const p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  e.preventDefault?.();
}
function moveDraw(e) {
  if (!drawing) return;
  const p = getPos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  e.preventDefault?.();
}
function endDraw() {
  drawing = false;
}

sig.addEventListener("mousedown", startDraw);
sig.addEventListener("mousemove", moveDraw);
sig.addEventListener("mouseup", endDraw);
sig.addEventListener("mouseleave", endDraw);

sig.addEventListener("touchstart", startDraw, { passive: false });
sig.addEventListener("touchmove", moveDraw, { passive: false });
sig.addEventListener("touchend", endDraw);

document.getElementById("clear").addEventListener("click", () => {
  ctx.clearRect(0, 0, sig.width, sig.height);
});

function buildPrintableClone() {
  const doc = document.getElementById("doc");
  const clone = doc.cloneNode(true);

  const originalInputs = doc.querySelectorAll('input[type="text"], input[type="email"], input[type="date"]');
  const cloneInputs = clone.querySelectorAll('input[type="text"], input[type="email"], input[type="date"]');

  cloneInputs.forEach((inp, i) => {
    const val = originalInputs[i]?.value ?? "";
    const span = document.createElement("div");
    span.textContent = val || " ";
    span.style.marginTop = "6px";
    span.style.padding = "10px 10px";
    span.style.border = "1px solid rgba(150,144,162,.18)";
    span.style.borderRadius = "10px";
    span.style.fontSize = "14px";
    inp.replaceWith(span);
  });

  QUESTIONS.forEach((q) => {
    q.choices.forEach(([k]) => {
      const id = `${q.id}_${k}`;
      const o = doc.querySelector(`#${id}`);
      const c = clone.querySelector(`#${id}`);
      if (!o || !c) return;
      const mark = document.createElement("span");
      mark.textContent = o.checked ? "☑" : "☐";
      mark.style.fontSize = "16px";
      c.replaceWith(mark);
    });
  });

  const cloneSig = clone.querySelector("#sig");
  if (cloneSig) {
    const img = document.createElement("img");
    img.src = sig.toDataURL("image/png");
    img.style.maxWidth = "520px";
    img.style.width = "100%";
    img.style.border = "1px solid rgba(0,0,0,.35)";
    img.style.borderRadius = "10px";
    cloneSig.replaceWith(img);
  }

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = doc.offsetWidth + "px";

  ["export", "status", "clear"].forEach((id) => clone.querySelector(`#${id}`)?.remove());
  clone.querySelectorAll("button").forEach((b) => b.remove());

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { wrapper, clone };
}

document.getElementById("export").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Génération du PDF…";

  const { wrapper, clone } = buildPrintableClone();

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let y = 10;
    const marginX = 10;

    async function addBlockToPdf(el, scale = 1.5) {
      const canvas = await html2canvas(el, { scale, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.82);

      const imgW = pageW - marginX * 2;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (y + imgH > pageH - 10) {
        pdf.addPage();
        y = 10;
      }

      pdf.addImage(imgData, "JPEG", marginX, y, imgW, imgH);
      y += imgH + 6;
    }

    const header = clone.querySelector(".header");
    const sections = clone.querySelectorAll(".section");

    if (header) await addBlockToPdf(header);
    if (sections[0]) await addBlockToPdf(sections[0]);

    const questions = clone.querySelectorAll(".q");
    for (const q of questions) await addBlockToPdf(q);

    const sigSection = clone.querySelector(".sigWrap")?.closest(".section");
    if (sigSection) await addBlockToPdf(sigSection);

    // noms normalisés (affichage)
    const rawNom = (document.getElementById("nom").value || "").trim();
    const rawPrenom = (document.getElementById("prenom").value || "").trim();

    const nom = titleCaseName(rawNom);
    const prenom = titleCaseName(rawPrenom);
    document.getElementById("nom").value = nom || "";
    document.getElementById("prenom").value = prenom || "";

    const centre = (document.getElementById("centre").value || "Centre").trim();

    // ✅ noms safe pour Storage (sans accents/espaces)
    const safeNom = safeKey(nom || "SansNom");
    const safePrenom = safeKey(prenom || "SansPrenom");
    const uid = crypto.randomUUID().slice(0, 8);

    const filename = `${safeNom}_${safePrenom}_QCM_POST_${uid}.pdf`;

    // ✅ session safe uniquement pour le PATH storage
    const params = new URLSearchParams(window.location.search);
    const sessionForPath = params.get("session") || sessionName || `${centre}_${new Date().toISOString().slice(0, 10)}`;
    const safeSession = safeKey(sessionForPath);

    const path = `${safeSession}/${filename}`;

    status.textContent = "Upload vers cloud…";
    const pdfBlob = pdf.output("blob");

    const { error } = await uploadPdf(path, pdfBlob);


    if (error) {
      console.error(error);
      status.textContent = "❌ Upload échoué";
    } else {
      status.textContent = "✅ PDF envoyé dans le cloud";
      await markDone(sessionName, "post");
      setTimeout(() => goHome(sessionName), 400);
    }
  } catch (e) {
    console.error(e);
    status.textContent = "❌ Erreur PDF: " + (e?.message || e);
  } finally {
    wrapper.remove();
    setTimeout(() => {
      const s = document.getElementById("status");
      if (s) s.textContent = "";
    }, 1200);
  }
});