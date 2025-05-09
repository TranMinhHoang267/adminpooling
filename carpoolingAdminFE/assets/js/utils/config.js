// Cấu hình chung
const CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api',
  TOKEN_KEY: 'token',
  EMAIL_KEY: 'email',
  ROLE_KEY: 'role'
};

// Hàm kiểm tra token
function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const expiryTime = payload.exp * 1000;
    return expiryTime > new Date().getTime();
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
}

// Hàm lưu thông tin đăng nhập
function saveLoginInfo(token, email, role) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
  localStorage.setItem(CONFIG.EMAIL_KEY, email);
  localStorage.setItem(CONFIG.ROLE_KEY, role);
}

// Hàm xóa thông tin đăng nhập
function clearLoginInfo() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.EMAIL_KEY);
  localStorage.removeItem(CONFIG.ROLE_KEY);
}

// Hàm lấy thông tin đăng nhập
function getLoginInfo() {
  return {
    token: localStorage.getItem(CONFIG.TOKEN_KEY),
    email: localStorage.getItem(CONFIG.EMAIL_KEY),
    role: localStorage.getItem(CONFIG.ROLE_KEY)
  };
} 