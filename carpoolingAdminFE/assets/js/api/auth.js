// API liên quan đến xác thực
function login(email, password) {
  console.log('Attempting login for:', email);
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://localhost:8080/api/auth/login',
      type: 'POST',
      contentType: 'application/json',
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        email: email,
        password: password
      }),
      success: function(response) {
        console.log('Login success response:', response);
        
        if (response && (response.token || response.data?.token || response.accessToken)) {
          const token = response.token || response.data?.token || response.accessToken;
          const role = response.role || response.data?.role || 'ADMIN';
          const name = response.name || response.data?.name || email;
          
          // Lưu thông tin đăng nhập
          try {
            localStorage.setItem('token', token);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);
            localStorage.setItem('name', name);
            console.log('Login info saved successfully');
            resolve(response);
          } catch (error) {
            console.error('Error saving login info:', error);
            reject(new Error('Lỗi khi lưu thông tin đăng nhập'));
          }
        } else {
          reject(new Error('Token không hợp lệ từ server'));
        }
      },
      error: function(xhr, status, error) {
        console.error('Login error status:', status);
        console.error('Login error:', error);
        
        if (status === 'timeout') {
          reject(new Error('Server không phản hồi, vui lòng thử lại'));
        } else if (status === 'error' && xhr.status === 0) {
          reject(new Error('Không thể kết nối đến server'));
        } else if (xhr.status === 401 || xhr.status === 403) {
          reject(new Error('Email hoặc mật khẩu không đúng'));
        } else if (xhr.responseJSON) {
          reject(new Error(xhr.responseJSON.message || 'Lỗi đăng nhập'));
        } else if (xhr.responseText) {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.message || 'Lỗi đăng nhập'));
          } catch (e) {
            reject(new Error(xhr.responseText));
          }
        } else {
          reject(new Error('Đã xảy ra lỗi khi đăng nhập'));
        }
      }
    });
  });
}

// Hàm đăng xuất đơn giản
function logout() {
  console.log('Logging out...');
  
  // Hiển thị thông báo đang đăng xuất
  if ($('#logoutModal').length === 0) {
    $('body').append(`
      <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-body text-center">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="sr-only">Đang đăng xuất...</span>
              </div>
              <h5>Đang đăng xuất...</h5>
              <p class="text-muted">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    `);
  }
  
  $('#logoutModal').modal('show');
  
  // Lấy token hiện tại
  const token = localStorage.getItem('token');
  
  // Thực hiện logout request đến server (nếu cần)
  // Một số API không yêu cầu request logout, trong trường hợp đó
  // chỉ cần xóa token ở client và chuyển hướng về trang login
  try {
    if (token) {
      $.ajax({
        url: 'http://localhost:8080/api/auth/logout',
        type: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000,
        complete: function() {
          // Bất kể thành công hay thất bại, vẫn xóa token và chuyển hướng
          performLocalLogout();
        }
      });
    } else {
      performLocalLogout();
    }
  } catch (error) {
    console.error('Error during logout:', error);
    performLocalLogout();
  }
}

// Hàm thực hiện đăng xuất cục bộ
function performLocalLogout() {
  // Xóa tất cả dữ liệu trong localStorage
  localStorage.clear();
  
  // Thêm một chút delay để hiển thị animation đăng xuất
  setTimeout(function() {
    // Ẩn modal trước khi chuyển hướng
    if ($('#logoutModal').length > 0) {
      $('#logoutModal').modal('hide');
      // Đợi modal ẩn hoàn toàn trước khi chuyển hướng
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 300);
    } else {
      window.location.href = 'login.html';
    }
  }, 1000);
}

// Hàm kiểm tra token có hợp lệ không
function isTokenValid() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }

  try {
    // Giải mã token để kiểm tra thời gian hết hạn
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    if (!payload.exp) {
      return true; // Nếu không có exp, coi như token vẫn hợp lệ
    }

    const expiryTime = payload.exp * 1000; // Chuyển từ giây sang milliseconds
    const currentTime = new Date().getTime();
    
    return currentTime < expiryTime;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

// Hàm lấy token từ localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Middleware để thêm token vào header của mọi request
$.ajaxSetup({
  beforeSend: function(xhr, settings) {
    // Bỏ qua kiểm tra token cho request login và một số request khác
    if (settings.url.includes('/api/auth/login') || 
        settings.url.includes('/api/health') ||
        settings.url.includes('/api/public')) {
      return true;
    }
    
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
  }
});
