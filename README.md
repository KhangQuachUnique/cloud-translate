# AWS Translate & Rekognition API

Project Node.js/Express đơn giản để dịch văn bản và nhận diện + dịch text trong ảnh sử dụng AWS services.

## 📦 Cài đặt

1. **Clone project và cài dependencies:**

```bash
npm install
```

2. **Tạo file `.env` và điền thông tin AWS:**

```bash
cp .env.example .env
```

Sau đó mở file `.env` và điền:

```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
PORT=3000
```

## 🚀 Chạy server

```bash
npm start
```

Hoặc dùng nodemon để tự động restart khi có thay đổi:

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## 🎨 Sử dụng giao diện Web

Sau khi chạy server, mở trình duyệt và truy cập:

```
http://localhost:3000
```

Giao diện có 2 tab:

- **📝 Dịch văn bản**: Nhập text và chọn ngôn ngữ nguồn/đích
- **🖼️ Dịch ảnh**: Upload ảnh có chứa text để nhận diện và dịch

**Tips**: Nhấn `Ctrl + Enter` trong ô nhập text để dịch nhanh!

## 📝 API Endpoints

### 1. Dịch văn bản (POST /translate-text)

**Request:**

```bash
curl -X POST http://localhost:3000/translate-text \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","sourceLang":"en","targetLang":"vi"}'
```

**Response:**

```json
{
  "translatedText": "Xin chào thế giới"
}
```

### 2. Dịch text trong ảnh (POST /translate-image)

**Request:**

```bash
curl -X POST http://localhost:3000/translate-image \
  -F "image=@path/to/your/image.jpg" \
  -F "sourceLang=en" \
  -F "targetLang=vi"
```

**Response:**

```json
{
  "originalText": "Hello World\nWelcome to AWS",
  "translatedText": "Xin chào thế giới\nChào mừng đến với AWS"
}
```

## 📁 Cấu trúc project

```
aws-translate/
├── app.js                    # File chính, khởi động server
├── services/
│   ├── translateService.js   # Logic dịch văn bản (AWS Translate)
│   └── imageService.js       # Logic nhận diện text (AWS Rekognition)
├── .env                      # Biến môi trường (không commit)
├── .env.example              # Mẫu file .env
├── package.json
└── README.md
```

## 🔑 AWS Permissions cần thiết

IAM user cần có các quyền sau:

- `translate:TranslateText`
- `rekognition:DetectText`

## 🌍 Ngôn ngữ hỗ trợ

AWS Translate hỗ trợ rất nhiều ngôn ngữ. Một số mã phổ biến:

- `en` - English
- `vi` - Vietnamese
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese (Simplified)
- `fr` - French
- `de` - German
- `es` - Spanish

Xem đầy đủ: https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html

## 🛠️ Test với Postman

### Test translate-text:

1. Method: POST
2. URL: `http://localhost:3000/translate-text`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "text": "Hello world",
  "sourceLang": "en",
  "targetLang": "vi"
}
```

### Test translate-image:

1. Method: POST
2. URL: `http://localhost:3000/translate-image`
3. Body (form-data):
   - Key: `image`, Type: File, Value: chọn file ảnh
   - Key: `sourceLang`, Type: Text, Value: `en`
   - Key: `targetLang`, Type: Text, Value: `vi`

## 📄 License

ISC
