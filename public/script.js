// Chuyển đổi giữa các tab
function showTab(tabName) {
  // Ẩn tất cả tab content
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Bỏ active tất cả tab button
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Hiện tab được chọn
  if (tabName === "text") {
    document.getElementById("text-tab").classList.add("active");
    document.querySelectorAll(".tab-btn")[0].classList.add("active");
  } else {
    document.getElementById("image-tab").classList.add("active");
    document.querySelectorAll(".tab-btn")[1].classList.add("active");
  }

  // Ẩn kết quả cũ
  hideResults();
}

// Hàm load danh sách ngôn ngữ từ AWS
async function loadLanguages() {
  try {
    console.log("🔄 Đang tải danh sách ngôn ngữ...");
    const response = await fetch("/languages");
    const data = await response.json();

    if (data.languages) {
      console.log(`✅ Đã tải ${data.languages.length} ngôn ngữ`);

      // Populate tất cả các select boxes
      const selects = [
        document.getElementById("sourceLang"),
        document.getElementById("targetLang"),
        document.getElementById("imageSourceLang"),
        document.getElementById("imageTargetLang"),
      ];

      selects.forEach((select, index) => {
        // Xóa options cũ
        select.innerHTML = "";

        // Thêm option "Tự động nhận diện" cho source language (index 0 và 2)
        if (index === 0 || index === 2) {
          const autoOption = document.createElement("option");
          autoOption.value = "auto";
          autoOption.textContent = "🔍 Tự động nhận diện";
          select.appendChild(autoOption);
        }

        // Thêm options ngôn ngữ từ AWS
        data.languages.forEach((lang) => {
          const option = document.createElement("option");
          option.value = lang.code;
          option.textContent = `${lang.name} (${lang.code})`;
          select.appendChild(option);
        });
      });

      // Set giá trị mặc định
      document.getElementById("sourceLang").value = "auto";
      document.getElementById("targetLang").value = "vi";
      document.getElementById("imageSourceLang").value = "auto";
      document.getElementById("imageTargetLang").value = "vi";
    }
  } catch (error) {
    console.error("❌ Lỗi khi tải ngôn ngữ:", error);
    showError("Không thể tải danh sách ngôn ngữ từ AWS");
  }
}

// Ẩn tất cả kết quả và error
function hideResults() {
  document.getElementById("textResult").style.display = "none";
  document.getElementById("imageResult").style.display = "none";
  document.getElementById("errorMessage").style.display = "none";
}

// Hiển thị loading
function showLoading() {
  document.getElementById("loading").style.display = "block";
  hideResults();
}

// Ẩn loading
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// Hiển thị lỗi
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = "❌ Lỗi: " + message;
  errorDiv.style.display = "block";
  hideLoading();
}

// Preview ảnh trước khi upload
function previewImage() {
  const input = document.getElementById("imageInput");
  const preview = document.getElementById("imagePreview");
  const img = document.getElementById("previewImg");

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = e.target.result;
      preview.style.display = "block";
    };

    reader.readAsDataURL(input.files[0]);
  }
}

// Dịch văn bản
async function translateText() {
  // Lấy dữ liệu từ form
  const text = document.getElementById("textInput").value.trim();
  const sourceLang = document.getElementById("sourceLang").value;
  const targetLang = document.getElementById("targetLang").value;

  // Kiểm tra input
  if (!text) {
    showError("Vui lòng nhập văn bản cần dịch!");
    return;
  }

  if (!targetLang) {
    showError("Vui lòng chọn ngôn ngữ đích!");
    return;
  }

  if (sourceLang === targetLang && sourceLang !== "auto") {
    showError("Ngôn ngữ nguồn và đích không thể giống nhau!");
    return;
  }

  // Hiện loading
  showLoading();

  try {
    // Gọi API
    const response = await fetch("/translate-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang,
      }),
    });

    const data = await response.json();

    // Xử lý kết quả
    if (response.ok) {
      // Hiển thị kết quả dịch
      document.getElementById("translatedText").textContent =
        data.translatedText;
      
      // Nếu dùng auto-detect, hiển thị ngôn ngữ đã nhận diện được
      if (sourceLang === "auto" && data.detectedLanguage) {
        const langInfo = document.createElement("div");
        langInfo.style.marginBottom = "10px";
        langInfo.style.color = "#8b4513";
        langInfo.style.fontWeight = "bold";
        langInfo.innerHTML = `🔍 Ngôn ngữ phát hiện: ${data.detectedLanguage}`;
        
        const resultBox = document.getElementById("textResult");
        const translatedDiv = document.getElementById("translatedText");
        translatedDiv.parentNode.insertBefore(langInfo, translatedDiv);
      }
      
      document.getElementById("textResult").style.display = "block";
    } else {
      showError(data.error || "Có lỗi xảy ra khi dịch văn bản");
    }
  } catch (error) {
    showError("Không thể kết nối đến server: " + error.message);
  } finally {
    hideLoading();
  }
}

// Dịch ảnh
async function translateImage() {
  // Lấy file ảnh
  const input = document.getElementById("imageInput");
  const sourceLang = document.getElementById("imageSourceLang").value;
  const targetLang = document.getElementById("imageTargetLang").value;

  // Kiểm tra input
  if (!input.files || !input.files[0]) {
    showError("Vui lòng chọn ảnh!");
    return;
  }

  if (!targetLang) {
    showError("Vui lòng chọn ngôn ngữ đích!");
    return;
  }

  if (sourceLang === targetLang && sourceLang !== "auto") {
    showError("Ngôn ngữ nguồn và đích không thể giống nhau!");
    return;
  }

  // Hiện loading
  showLoading();

  try {
    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append("image", input.files[0]);
    formData.append("sourceLang", sourceLang);
    formData.append("targetLang", targetLang);

    // Gọi API
    const response = await fetch("/translate-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // Xử lý kết quả
    if (response.ok) {
      if (data.message) {
        // Không phát hiện text
        showError(data.message);
      } else {
        // Hiện kết quả text gốc
        document.getElementById("originalText").textContent =
          data.originalText || "(Không có text)";
        
        // Hiện kết quả dịch
        document.getElementById("translatedImageText").textContent =
          data.translatedText || "(Không có bản dịch)";
        
        // Nếu dùng auto-detect, hiển thị ngôn ngữ đã nhận diện
        const imageResultDiv = document.getElementById("imageResult");
        if (sourceLang === "auto" && data.detectedLanguage) {
          const langInfo = document.createElement("div");
          langInfo.style.marginBottom = "10px";
          langInfo.style.color = "#8b4513";
          langInfo.style.fontWeight = "bold";
          langInfo.innerHTML = `🔍 Ngôn ngữ phát hiện: ${data.detectedLanguage}`;
          
          const translatedDiv = document.getElementById("translatedImageText");
          translatedDiv.parentNode.insertBefore(langInfo, translatedDiv);
        }
        
        imageResultDiv.style.display = "block";
      }
    } else {
      showError(data.error || "Có lỗi xảy ra khi xử lý ảnh");
    }
  } catch (error) {
    showError("Không thể kết nối đến server: " + error.message);
  } finally {
    hideLoading();
  }
}

// Xử lý phím Enter trong textarea
document.addEventListener("DOMContentLoaded", function () {
  // Load danh sách ngôn ngữ khi trang load xong
  loadLanguages();

  const textInput = document.getElementById("textInput");

  textInput.addEventListener("keydown", function (e) {
    // Ctrl + Enter để dịch
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      translateText();
    }
  });
});
