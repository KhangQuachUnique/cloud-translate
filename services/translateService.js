// Service xử lý dịch văn bản bằng AWS Translate
const AWS = require('aws-sdk');

// Cấu hình AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Khởi tạo AWS Translate client
const translate = new AWS.Translate();

/**
 * Hàm dịch văn bản từ ngôn ngữ này sang ngôn ngữ khác
 * @param {string} text - Văn bản cần dịch
 * @param {string} sourceLang - Mã ngôn ngữ nguồn (ví dụ: 'en', 'vi')
 * @param {string} targetLang - Mã ngôn ngữ đích (ví dụ: 'vi', 'en')
 * @returns {Promise<string>} - Văn bản đã được dịch
 */
async function translateText(text, sourceLang, targetLang) {
  try {
    // Chuẩn bị tham số cho AWS Translate
    const params = {
      Text: text,
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang
    };

    // Gọi API AWS Translate
    console.log(`🔄 Đang dịch từ ${sourceLang} sang ${targetLang}...`);
    const result = await translate.translateText(params).promise();

    // Trả về text đã dịch
    return result.TranslatedText;

  } catch (error) {
    console.error('❌ Lỗi khi gọi AWS Translate:', error);
    throw new Error(`Không thể dịch văn bản: ${error.message}`);
  }
}

// Export hàm để sử dụng ở file khác
module.exports = {
  translateText
};
