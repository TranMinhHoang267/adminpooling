// Main.js - Quản lý việc tải trang và khởi tạo chức năng

// Biến toàn cục để theo dõi trang đã tải
let currentPage = '';

// Hàm tải nội dung
function loadContent(page) {
    console.log("Main.js: loadContent called for page:", page);
    
    // Kiểm tra xem đã tải trang này chưa
    if (currentPage === page) {
        console.log("Main.js: Page", page, "already loaded, skipping reload");
        return;
    }
    
    // Xóa active từ tất cả các liên kết
    $('a[data-page]').parent().removeClass('active');
    
    // Thêm active cho liên kết hiện tại
    $('a[data-page="' + page + '"]').parent().addClass('active');
    
    // Xác định đường dẫn file
    let filePath;
    if (page.includes('/')) {
        // Nếu page có dấu /, sử dụng đường dẫn trực tiếp
        filePath = `pages/${page}.html`;
    } else {
        // Ngược lại, tìm trong thư mục con
        filePath = `pages/${page}/index.html`;
    }
    
    console.log("Main.js: Loading file:", filePath);
    
    // Tải nội dung
    $('#main-content').load(filePath, function(response, status, xhr) {
        if (status == "error") {
            console.error("Main.js: Error loading page:", xhr.status, xhr.statusText);
            $('#main-content').html(`
                <div class="alert alert-danger">
                    Không tìm thấy trang. Lỗi: ${xhr.status} ${xhr.statusText}
                </div>
            `);
            return;
        }
        
        // Cập nhật trang hiện tại
        currentPage = page;
        console.log("Main.js: Content loaded successfully, initializing page:", page);
        
        // Khởi tạo các chức năng tương ứng với từng trang
        initializePage(page);
    });
}

// Hàm khởi tạo chức năng cho từng trang
function initializePage(page) {
    console.log("Main.js: Initializing page:", page);
    
    // Xóa tất cả event listeners cũ
    $(document).off('click', '#refreshDriversBtn');
    $(document).off('click', '#addDriverBtn');
    $(document).off('click', '#confirmReject');
    $(document).off('keyup', '#searchDrivers');

    if (page === 'drivers' || page === 'drivers/index') {
        console.log("Main.js: Initializing drivers page functionality");
        
        // Khởi tạo trang drivers
        if (typeof loadDrivers === 'function') {
            console.log("Main.js: loadDrivers function exists, calling it");
            loadDrivers();
        } else {
            console.error("Main.js: loadDrivers function not found");
        }
        
        $('#refreshDriversBtn').on('click', function() {
            console.log("Main.js: Refresh drivers button clicked");
            if (typeof loadDrivers === 'function') {
                loadDrivers();
            }
        });
        
        $('#addDriverBtn').on('click', function() {
            console.log("Main.js: Add driver button clicked");
            window.location.href = '?page=drivers/add';
        });
        
        $('#confirmReject').on('click', function() {
            console.log("Main.js: Confirm reject button clicked");
            const id = $('#rejectDriverId').val();
            const reason = $('#rejectionReason').val();
            if (!reason) {
                alert('Vui lòng nhập lý do từ chối!');
                return;
            }
            if (typeof handleRejectDriver === 'function') {
                handleRejectDriver(id, reason);
            }
        });
        
        $('#searchDrivers').on('keyup', function() {
            const value = $(this).val().toLowerCase();
            $("#driversTableBody tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    }
}

// Document ready
$(document).ready(function() {
    console.log("Main.js: Document ready");
});