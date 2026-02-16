import express from "express";
import multer from "multer";
import cors from "cors";
import axios from "axios";
import FormData from "form-data";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ⚠️ Mets ton token pCloud ici (ou mieux: via .env, on le fera après)
const PCLOUD_TOKEN = process.env.PCLOUD_TOKEN || "https://e.pcloud.com/#/puplink?code=8XP7ZuQ7Wi0asfDY6Ud9JXJCyjfR9B0Wk";

// Upload endpoint : reçoit un PDF et l’envoie vers pCloud
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const { session = "Session_Test", filename = "document.pdf" } = req.body;
    if (!req.file) return res.status(400).json({ ok: false, error: "No file" });

    // Dossier cible dans pCloud
    const path = `/AQM_Formations/${session}`;

    const fd = new FormData();
    fd.append("file", req.file.buffer, { filename, contentType: "application/pdf" });

    const url = `https://api.pcloud.com/uploadfile`;
    const response = await axios.post(url, fd, {
      params: { access_token: PCLOUD_TOKEN, path },
      headers: fd.getHeaders(),
      maxBodyLength: Infinity,
    });

    return res.json({ ok: true, pcloud: response.data });
  } catch (e) {
    console.error(e?.response?.data || e);
    return res.status(500).json({ ok: false, error: "Upload failed", details: e?.response?.data || String(e) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Upload proxy running on http://localhost:${PORT}`));
