const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const rekognition = new AWS.Rekognition();

// Nhận diện text trong ảnh
async function detectTextInImage(imageBuffer) {
  try {
    const result = await rekognition
      .detectText({
        Image: { Bytes: imageBuffer },
      })
      .promise();

    // 📊 LOG TOÀN BỘ KẾT QUẢ TRẢ VỀ TỪ AWS REKOGNITION
    console.log("\n========== AWS REKOGNITION RESPONSE ==========");
    console.log("Total detections:", result.TextDetections.length);
    console.log("Full response:");
    console.log(JSON.stringify(result.TextDetections, null, 2));
    console.log("=============================================\n");

    return result.TextDetections.filter((item) => item.Type === "LINE")
      .map((item) => item.DetectedText)
      .join("\n");
  } catch (error) {
    throw new Error(`Không thể nhận diện text trong ảnh: ${error.message}`);
  }
}

module.exports = { detectTextInImage };
