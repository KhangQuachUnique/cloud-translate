// Import các thư viện cần thiết
require('dotenv').config(); // Load biến môi trường từ file .env
const express = require('express');
const multer = require('multer'); // Xử lý upload file

// Import services
const translateService = require('./services/translateService');
const imageService = require('./services/imageService');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Serve static files từ thư mục public (HTML, CSS, JS)
app.use(express.static('public'));

// Cấu hình multer để lưu file tạm thời trong memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// ============== ROUTES ==============

// Route 1: Dịch văn bản thuần
app.post('/translate-text', async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { text, sourceLang, targetLang } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin: text, sourceLang, targetLang' 
      });
    }

    // Gọi service để dịch
    const translatedText = await translateService.translateText(
      text, 
      sourceLang, 
      targetLang
    );

    // Trả về kết quả
    res.json({ translatedText });

  } catch (error) {
    console.error('Lỗi khi dịch text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 2: Nhận diện text trong ảnh và dịch
app.post('/translate-image', upload.single('image'), async (req, res) => {
  try {
    // Kiểm tra xem có file được upload không
    if (!req.file) {
      return res.status(400).json({ error: 'Không tìm thấy ảnh. Hãy gửi file với key "image"' });
    }

    // Lấy ngôn ngữ target từ query hoặc body (mặc định là tiếng Việt)
    const targetLang = req.body.targetLang || req.query.targetLang || 'vi';
    const sourceLang = req.body.sourceLang || req.query.sourceLang || 'en';

    // Bước 1: Detect text trong ảnh bằng AWS Rekognition
    const detectedText = await imageService.detectTextInImage(req.file.buffer);

    // Nếu không detect được text nào
    if (!detectedText || detectedText.trim() === '') {
      return res.json({ 
        originalText: '', 
        translatedText: '',
        message: 'Không phát hiện văn bản trong ảnh'
      });
    }

    // Bước 2: Dịch text đã detect sang ngôn ngữ target
    const translatedText = await translateService.translateText(
      detectedText,
      sourceLang,
      targetLang
    );

    // Trả về kết quả
    res.json({ 
      originalText: detectedText,
      translatedText: translatedText
    });

  } catch (error) {
    console.error('Lỗi khi xử lý ảnh:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route mặc định (health check)
app.get('/', (req, res) => {
  res.json({ 
    message: 'AWS Translate API đang hoạt động!',
    endpoints: {
      translateText: 'POST /translate-text',
      translateImage: 'POST /translate-image'
    }
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Để test:`);
  console.log(`   - Dịch text: POST http://localhost:${PORT}/translate-text`);
  console.log(`   - Dịch ảnh: POST http://localhost:${PORT}/translate-image`);
});
