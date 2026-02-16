import "./style.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getSessionName, goHome, markDone } from "./flow.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://elfxuuyhaswzombgaqyh.supabase.co",
  "sb_publishable_vCse9y1Z3j-MHxZq_4ifUg_4G84oZnw"
);


/**
 * Fiche d’évaluation de formation – basée sur ton doc Biometrics :contentReference[oaicite:1]{index=1}
 * Export PDF : blocs (pas de coupure au milieu), boutons/status masqués dans le PDF.
 */

const GROUPS = [
  {
    title: "I - Objectifs du programme",
    items: [
      { id: "obj1", text: "Les objectifs du programme étaient clairement définis." },
      { id: "obj2", text: "Les objectifs du programme ont été abordés par le formateur." },
    ],
  },
  {
    title: "II - Contenu et pertinence de la formation",
    items: [
      { id: "cont1", text: "Le matériel était d'un niveau de complexité adapté à mon niveau." },
      { id: "cont2", text: "Le matériel de cours était bien organisé." },
      { id: "cont3", text: "Les supports de cours m'ont aidé à atteindre les objectifs du cours." },
      { id: "cont4", text: "Le contenu était adapté à mes besoins professionnels." },
    ],
  },
  {
    title: "III - Connaissances et efficacité du formateur",
    items: [
      { id: "form1", text: "Le formateur a fait preuve d'une bonne compréhension et a transmis efficacement le contenu du programme." },
      { id: "form2", text: "Le formateur a partagé ses expériences avec les participants pour qu'ils puissent s'identifier au contenu abordé." },
      { id: "form3", text: "Le formateur a encouragé les interactions tout en maintenant un environnement d'apprentissage sûr." },
      { id: "form4", text: "La cadence du programme était bien." },
      { id: "form5", text: "La durée de la séance était appropriée aux objectifs et à la complexité du contenu." },
      { id: "form6", text: "Les pauses étaient réparties aux bons moments." },
    ],
  },
  {
    title: "IV - Évaluation du programme",
    items: [
      { id: "eval1", text: "L'évaluation était une juste représentation du contenu du programme." },
      { id: "eval2", text: "Les jeux de rôle et simulations représentaient bien le contenu du programme." },
    ],
  },
  {
    title: "V - Lieu de production",
    items: [
      { id: "lieu1", text: "La salle était adaptée à une session d'apprentissage." },
      { id: "lieu2", text: "Accès à un ordinateur / outils pour simulations et exercices pratiques." },
    ],
  },
];

const SCALE_5 = ["1", "2", "3", "4", "5"];
const GLOBAL = ["Très satisfaisante", "Satisfaisante", "Peu satisfaisante"];

function esc(s) {
  return (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function radioRow(name, values) {
  return `
    <div class="choices" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
      ${values
        .map((v) => {
          const id = `${name}_${v}`.replaceAll(" ", "_");
          return `
            <label class="choice" for="${id}" style="align-items:center;">
              <input id="${id}" type="radio" name="${name}" value="${esc(v)}"/>
              <div>${esc(v)}</div>
            </label>
          `;
        })
        .join("")}
    </div>
  `;
}

function groupBlock(g) {
  return `
    <div class="q" style="padding:14px;">
      <div class="qtitle" style="margin-bottom:12px;">${esc(g.title)}</div>
      <div style="display:grid; gap:12px;">
        ${g.items
          .map(
            (it) => `
          <div class="q" style="margin:0;">
            <div class="qtitle" style="font-weight:600;">${esc(it.text)}</div>
              <div class="scaleWrap">
                ${radioRow(it.id, SCALE_5)}
                <div class="scaleLegend">
                  <span>1 = Nul</span>
                  <span>5 = Parfait</span>
                </div>
              </div>
          </div>
        `
          )
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
            <div class="title">FICHE D’ÉVALUATION DE FORMATION</div>
            <div class="subtitle">Biometrics • GAITRite AQM</div>
          </div>
        </div>
        <div class="meta">
          <div class="badge">🧾 Document qualité • PDF signé</div>
          <div class="badge">✔ Oui / Non / Sans objet</div>
        </div>
      </div>

      <div class="section">
        <div class="grid2">
          <label>Nom complet du formateur<br/><input id="formateur" type="text" placeholder="ex: M. Yann VILLARD" /></label>
          <label>Date et heure de l'évaluation<br/><input id="datetime" type="text" placeholder="ex: 16/02/2026 - 10:30" /></label>
          <label style="grid-column:1/-1;">Intitulé de la formation suivie<br/><input id="intitule" type="text" placeholder='ex: Formation « EXPERT » GAITRite' /></label>
        </div>
      </div>

      <div class="section">
        <div class="grid2">
          <label>Nom<br/><input id="nom" type="text" /></label>
          <label>Prénom<br/><input id="prenom" type="text" /></label>
          <label>Centre / Service<br/><input id="centre" type="text" /></label>
          <label>Email<br/><input id="email" type="email" /></label>
        </div>
      </div>

      <div class="section" id="blocks">
        ${GROUPS.map(groupBlock).join("")}

        <div class="q" style="padding:14px;">
          <div class="qtitle">VI - Réflexions finales</div>

          <div style="display:grid; gap:12px; margin-top:10px;">
            <div>
              <div class="small" style="margin-bottom:6px;">Qu'est-ce qui vous a le plus plu ?</div>
              <textarea id="rf1" rows="3" style="width:100%; padding:10px; border:1px solid rgba(150,144,162,.18); border-radius:10px;"></textarea>
            </div>
            <div>
              <div class="small" style="margin-bottom:6px;">Qu'est-ce qui devrait être changé ou amélioré ?</div>
              <textarea id="rf2" rows="3" style="width:100%; padding:10px; border:1px solid rgba(150,144,162,.18); border-radius:10px;"></textarea>
            </div>
            <div>
              <div class="small" style="margin-bottom:6px;">Impressions finales sur la session / le formateur</div>
              <textarea id="rf3" rows="3" style="width:100%; padding:10px; border:1px solid rgba(150,144,162,.18); border-radius:10px;"></textarea>
            </div>
          </div>
        </div>

        <div class="q" style="padding:14px;">
          <div class="qtitle">VII - Appréciation globale</div>

          <div class="q" style="margin-top:10px;">
            <div class="qtitle" style="font-weight:600;">Globalement vous direz que la formation a été :</div>
            ${radioRow("globale", GLOBAL)}
          </div>

          <div class="q" style="margin-top:12px;">
            <div class="qtitle" style="font-weight:600;">Recommanderez-vous cette formation à des collègues ?</div>
              <div class="q" style="margin-top:12px;">
                <div class="qtitle" style="font-weight:600;">
                  Recommanderez-vous cette formation à des collègues ?
                </div>

                <div class="scaleWrap">
                  ${radioRow("reco", SCALE_5)}
                  <div class="scaleLegend">
                    <span>1 = Nul</span>
                    <span>5 = Parfait</span>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div class="q" style="padding:14px;" id="scoreBox">
          <div class="qtitle">Score global (auto)</div>
          <div class="small">Calculé à partir des réponses notées (1 à 5). Les “Sans réponse” sont ignorées.</div>

          <div style="display:flex; gap:12px; align-items:center; margin-top:10px; flex-wrap:wrap;">
            <div class="badge" style="font-size:14px;">
              Moyenne : <b><span id="scoreAvg">—</span> / 5</b>
            </div>
            <div class="badge" style="font-size:14px;">
              Nb réponses : <b><span id="scoreN">0</span></b>
            </div>
            <div class="badge" style="font-size:14px;">
              Mention : <b><span id="scoreLabel">—</span></b>
            </div>
          </div>
        </div>

        <div class="q" style="padding:14px;">
          <div class="qtitle">VIII - Fin du questionnaire</div>

          <div class="grid2" style="margin-top:10px;">
            <label>Nom complet du signataire<br/><input id="sign_nom" type="text" /></label>
            <label>Fonction<br/><input id="sign_fonc" type="text" /></label>
          </div>

          <div class="sigWrap" style="margin-top:12px;">
            <div class="sigBox">
              <div class="qtitle" style="margin:0 0 8px 0;">Signature</div>
              <canvas id="sig" width="520" height="160"></canvas>
              <div class="actions" style="margin-top:10px;">
                <button id="clear">Effacer</button>
              </div>
            </div>
          </div>

          <div class="small" style="margin-top:10px;">
            Biometrics France • V1 NOV 2022 (référence) • Généré via AQM-Qualite-Forms
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

/* ===== Signature (souris + tactile) ===== */
const sig = document.getElementById("sig");
const ctx = sig.getContext("2d");
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

let drawing = false;

document.getElementById("back").onclick = () => {
  const session = getSessionName();
  goHome(session);
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

function computeScore() {
  // on prend tous les radios cochés qui sont "1..5"
  const checked = Array.from(document.querySelectorAll('input[type="radio"]:checked'));
  const vals = checked
    .map((r) => Number(r.value))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);

  const n = vals.length;
  const avg = n ? vals.reduce((a, b) => a + b, 0) / n : 0;

  let label = "—";
  if (n) {
    if (avg >= 4.2) label = "Excellent";
    else if (avg >= 3.6) label = "Très satisfaisant";
    else if (avg >= 3.0) label = "Satisfaisant";
    else label = "À améliorer";
  }

  const avgEl = document.getElementById("scoreAvg");
  const nEl = document.getElementById("scoreN");
  const labelEl = document.getElementById("scoreLabel");

  if (avgEl) avgEl.textContent = n ? avg.toFixed(1) : "—";
  if (nEl) nEl.textContent = String(n);
  if (labelEl) labelEl.textContent = label;
}

// recalcul à chaque clic sur une réponse
document.addEventListener("change", (e) => {
  if (e.target && e.target.matches('input[type="radio"]')) computeScore();
});

// calcul au chargement
computeScore();


/**
 * Clone imprimable:
 * - inputs/textarea => texte
 * - radios => ☑/☐
 * - signature canvas => image
 * - boutons/status => supprimés
 */
function buildPrintableClone() {
  const doc = document.getElementById("doc");
  const clone = doc.cloneNode(true);

  // Remplacer inputs par texte
  const inSel = 'input[type="text"], input[type="email"], input[type="date"]';
  const origInputs = doc.querySelectorAll(inSel);
  const clonInputs = clone.querySelectorAll(inSel);

  clonInputs.forEach((inp, i) => {
    const val = origInputs[i]?.value ?? "";
    const span = document.createElement("div");
    span.textContent = val || " ";
    span.style.marginTop = "6px";
    span.style.padding = "10px 10px";
    span.style.border = "1px solid rgba(150,144,162,.18)";
    span.style.borderRadius = "10px";
    span.style.fontSize = "14px";
    inp.replaceWith(span);
  });

  // textarea -> bloc texte
  const origTA = doc.querySelectorAll("textarea");
  const clonTA = clone.querySelectorAll("textarea");
  clonTA.forEach((ta, i) => {
    const val = origTA[i]?.value ?? "";
    const box = document.createElement("div");
    box.textContent = val || " ";
    box.style.padding = "10px 10px";
    box.style.border = "1px solid rgba(150,144,162,.18)";
    box.style.borderRadius = "10px";
    box.style.whiteSpace = "pre-wrap";
    box.style.minHeight = "56px";
    ta.replaceWith(box);
  });

  // radios => ☑/☐
  const origRadios = doc.querySelectorAll('input[type="radio"]');
  const clonRadios = clone.querySelectorAll('input[type="radio"]');
  clonRadios.forEach((r, i) => {
    const o = origRadios[i];
    const mark = document.createElement("span");
    mark.textContent = o?.checked ? "☑" : "☐";
    mark.style.fontSize = "16px";
    r.replaceWith(mark);
  });

  // signature canvas -> image
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

  // supprimer UI
  ["export", "status", "clear"].forEach((id) => clone.querySelector(`#${id}`)?.remove());
  clone.querySelectorAll("button").forEach((b) => b.remove());

  // wrapper hors écran
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = doc.offsetWidth + "px";

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

    async function addBlock(el, scale = 1.35) {
      const canvas = await html2canvas(el, { scale, useCORS: true });

      const img = canvas.toDataURL("image/jpeg", 0.82);

      const imgW = pageW - marginX * 2;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (y + imgH > pageH - 10) {
        pdf.addPage();
        y = 10;
      }

      pdf.addImage(img, "JPEG", marginX, y, imgW, imgH);
      y += imgH + 6;
    }

    // Blocs : header + sections + sous-blocs "q" (pour éviter coupures)
    const header = clone.querySelector(".header");
    if (header) await addBlock(header);

    const sections = Array.from(clone.querySelectorAll(".section"));

    // On ajoute chaque section, mais en “sous-blocs” pour éviter les coupures dans de gros paquets :
    for (const sec of sections) {
      // ignorer la section actions (elle est vide après suppression UI)
      if (!sec.textContent?.trim()) continue;

      // si la section contient des blocs .q, on ajoute .q par .q
      const qs = sec.querySelectorAll(".q");
      if (qs.length) {
        for (const q of qs) await addBlock(q);
      } else {
        await addBlock(sec);
      }
    }

    const nom = (document.getElementById("nom").value || "").trim();
    const prenom = (document.getElementById("prenom").value || "").trim();
    const centre = (document.getElementById("centre").value || "Centre").trim();

    const safeNom = nom || "SansNom";
    const safePrenom = prenom || "SansPrenom";
    const uid = crypto.randomUUID().slice(0, 8);

    const filename = `${safeNom}_${safePrenom}_EVAL_FORMATION_${uid}.pdf`.replaceAll(" ", "_");

    const params = new URLSearchParams(window.location.search);
    const sessionName =
      params.get("session") ||
      localStorage.getItem("aqm_session") ||
      `${centre}_${new Date().toISOString().slice(0, 10)}`;
    const path = `${sessionName}/${filename}`;

    status.textContent = "Upload vers cloud…";

    const pdfBlob = pdf.output("blob");

    const { error } = await supabase.storage.from("aqm").upload(path, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (error) {
      console.error(error);
      status.textContent = "❌ Upload échoué";
    } else {
      status.textContent = "✅ PDF envoyé dans le cloud";
      markDone(sessionName, "eval");
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

