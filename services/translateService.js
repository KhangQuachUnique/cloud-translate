// Service xử lý dịch văn bản bằng AWS Translate
const AWS = require("aws-sdk");

// Cấu hình AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Khởi tạo AWS Translate client
const translate = new AWS.Translate();

/**
 * Hàm dịch văn bản từ ngôn ngữ này sang ngôn ngữ khác
 * @param {string} text - Văn bản cần dịch
 * @param {string} sourceLang - Mã ngôn ngữ nguồn (ví dụ: 'en', 'vi', 'auto' để tự động nhận diện)
 * @param {string} targetLang - Mã ngôn ngữ đích (ví dụ: 'vi', 'en')
 * @returns {Promise<Object>} - Object chứa translatedText và detectedLanguage (nếu dùng auto)
 */
async function translateText(text, sourceLang, targetLang) {
  try {
    // Chuẩn bị tham số cho AWS Translate
    const params = {
      Text: text,
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
    };

    // Gọi API AWS Translate
    console.log(`🔄 Đang dịch từ ${sourceLang} sang ${targetLang}...`);
    const result = await translate.translateText(params).promise();

    // Trả về object với text đã dịch và ngôn ngữ nguồn (nếu auto-detect)
    const response = {
      translatedText: result.TranslatedText
    };
    
    // Nếu dùng auto-detect, thêm thông tin ngôn ngữ đã phát hiện
    if (sourceLang === 'auto' && result.SourceLanguageCode) {
      response.detectedLanguage = result.SourceLanguageCode;
      console.log(`🔍 Phát hiện ngôn ngữ nguồn: ${result.SourceLanguageCode}`);
    }
    
    return response;
  } catch (error) {
    console.error("❌ Lỗi khi gọi AWS Translate:", error);
    throw new Error(`Không thể dịch văn bản: ${error.message}`);
  }
}

// Export hàm để sử dụng ở file khác
module.exports = {
  translateText,
};
