// Service xử lý nhận diện text trong ảnh bằng AWS Rekognition
const AWS = require('aws-sdk');

// Cấu hình AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Khởi tạo AWS Rekognition client
const rekognition = new AWS.Rekognition();

/**
 * Hàm nhận diện text trong ảnh
 * @param {Buffer} imageBuffer - Dữ liệu ảnh dạng Buffer
 * @returns {Promise<string>} - Toàn bộ text được phát hiện trong ảnh
 */
async function detectTextInImage(imageBuffer) {
  try {
    // Chuẩn bị tham số cho AWS Rekognition
    const params = {
      Image: {
        Bytes: imageBuffer // Gửi ảnh dạng binary
      }
    };

    // Gọi API AWS Rekognition để detect text
    console.log('🔍 Đang phát hiện text trong ảnh...');
    const result = await rekognition.detectText(params).promise();

    // result.TextDetections chứa mảng các text được phát hiện
    // Mỗi phần tử có Type: 'LINE' hoặc 'WORD'
    // Ta chỉ lấy các dòng (LINE) để tránh trùng lặp
    
    const detectedLines = result.TextDetections
      .filter(item => item.Type === 'LINE') // Chỉ lấy dòng text
      .map(item => item.DetectedText) // Lấy nội dung text
      .join('\n'); // Ghép thành đoạn văn

    console.log(`✅ Phát hiện được ${result.TextDetections.length} text elements`);
    
    return detectedLines;

  } catch (error) {
    console.error('❌ Lỗi khi gọi AWS Rekognition:', error);
    throw new Error(`Không thể nhận diện text trong ảnh: ${error.message}`);
  }
}

// Export hàm để sử dụng ở file khác
module.exports = {
  detectTextInImage
};
