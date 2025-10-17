// Chuyển đổi giữa các tab
function showTab(tabName) {
    // Ẩn tất cả tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Bỏ active tất cả tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Hiện tab được chọn
    if (tabName === 'text') {
        document.getElementById('text-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('image-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }

    // Ẩn kết quả cũ
    hideResults();
}

// Ẩn tất cả kết quả và error
function hideResults() {
    document.getElementById('textResult').style.display = 'none';
    document.getElementById('imageResult').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

// Hiển thị loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    hideResults();
}

// Ẩn loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Hiển thị lỗi
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '❌ Lỗi: ' + message;
    errorDiv.style.display = 'block';
    hideLoading();
}

// Preview ảnh trước khi upload
function previewImage() {
    const input = document.getElementById('imageInput');
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Dịch văn bản
async function translateText() {
    // Lấy dữ liệu từ form
    const text = document.getElementById('textInput').value.trim();
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;

    // Kiểm tra input
    if (!text) {
        showError('Vui lòng nhập văn bản cần dịch!');
        return;
    }

    if (sourceLang === targetLang) {
        showError('Ngôn ngữ nguồn và đích không thể giống nhau!');
        return;
    }

    // Hiện loading
    showLoading();

    try {
        // Gọi API
        const response = await fetch('/translate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                sourceLang: sourceLang,
                targetLang: targetLang
            })
        });

        const data = await response.json();

        // Xử lý kết quả
        if (response.ok) {
            document.getElementById('translatedText').textContent = data.translatedText;
            document.getElementById('textResult').style.display = 'block';
        } else {
            showError(data.error || 'Có lỗi xảy ra khi dịch văn bản');
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Dịch ảnh
async function translateImage() {
    // Lấy file ảnh
    const input = document.getElementById('imageInput');
    const sourceLang = document.getElementById('imageSourceLang').value;
    const targetLang = document.getElementById('imageTargetLang').value;

    // Kiểm tra input
    if (!input.files || !input.files[0]) {
        showError('Vui lòng chọn ảnh!');
        return;
    }

    if (sourceLang === targetLang) {
        showError('Ngôn ngữ nguồn và đích không thể giống nhau!');
        return;
    }

    // Hiện loading
    showLoading();

    try {
        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append('image', input.files[0]);
        formData.append('sourceLang', sourceLang);
        formData.append('targetLang', targetLang);

        // Gọi API
        const response = await fetch('/translate-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Xử lý kết quả
        if (response.ok) {
            if (data.message) {
                // Không phát hiện text
                showError(data.message);
            } else {
                // Hiện kết quả
                document.getElementById('originalText').textContent = data.originalText || '(Không có text)';
                document.getElementById('translatedImageText').textContent = data.translatedText || '(Không có bản dịch)';
                document.getElementById('imageResult').style.display = 'block';
            }
        } else {
            showError(data.error || 'Có lỗi xảy ra khi xử lý ảnh');
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Xử lý phím Enter trong textarea
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    
    textInput.addEventListener('keydown', function(e) {
        // Ctrl + Enter để dịch
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateText();
        }
    });
});
