const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const translate = new AWS.Translate();

// Dịch văn bản
async function translateText(text, sourceLang, targetLang) {
  try {
    const result = await translate
      .translateText({
        Text: text,
        SourceLanguageCode: sourceLang,
        TargetLanguageCode: targetLang,
      })
      .promise();

    // LOG TOÀN BỘ KẾT QUẢ TRẢ VỀ TỪ AWS TRANSLATE
    console.log("\n========== AWS TRANSLATE RESPONSE ==========");
    console.log(JSON.stringify(result, null, 2));
    console.log("==========================================\n");

    const response = { translatedText: result.TranslatedText };

    if (sourceLang === "auto" && result.SourceLanguageCode) {
      response.detectedLanguage = result.SourceLanguageCode;
    }

    return response;
  } catch (error) {
    throw new Error(`Không thể dịch văn bản: ${error.message}`);
  }
}

// Lấy danh sách ngôn ngữ
async function getLanguages() {
  try {
    const result = await translate.listLanguages().promise();

    // LOG MỘT VÀI NGÔN NGỮ ĐẦU TIÊN ĐỂ XEM CẤU TRÚC
    console.log("\n========== AWS LIST LANGUAGES RESPONSE ==========");
    console.log("Total languages:", result.Languages.length);
    console.log("Sample (first 3):");
    console.log(JSON.stringify(result.Languages.slice(0, 3), null, 2));
    console.log("================================================\n");

    return result.Languages.map((lang) => ({
      code: lang.LanguageCode,
      name: lang.LanguageName,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    throw new Error(`Không thể lấy danh sách ngôn ngữ: ${error.message}`);
  }
}

module.exports = { translateText, getLanguages };
