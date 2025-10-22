require("dotenv").config();
const express = require("express");
const multer = require("multer");
const translateService = require("./services/translateService");
const imageService = require("./services/imageService");

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
app.use(express.static("public"));

// Dịch văn bản
app.post("/translate-text", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || !sourceLang || !targetLang) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin: text, sourceLang, targetLang" });
    }

    const result = await translateService.translateText(
      text,
      sourceLang,
      targetLang
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dịch ảnh
app.post("/translate-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không tìm thấy ảnh" });
    }

    const { sourceLang = "auto", targetLang = "vi" } = req.body;
    const detectedText = await imageService.detectTextInImage(req.file.buffer);

    if (!detectedText || detectedText.trim() === "") {
      return res.json({
        originalText: "",
        translatedText: "",
        message: "Không phát hiện văn bản trong ảnh",
      });
    }

    const result = await translateService.translateText(
      detectedText,
      sourceLang,
      targetLang
    );
    res.json({
      originalText: detectedText,
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách ngôn ngữ
app.get("/languages", async (req, res) => {
  try {
    const languages = await translateService.getLanguages();
    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "AWS Translate API đang hoạt động!",
    endpoints: {
      translateText: "POST /translate-text",
      translateImage: "POST /translate-image",
      languages: "GET /languages",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
