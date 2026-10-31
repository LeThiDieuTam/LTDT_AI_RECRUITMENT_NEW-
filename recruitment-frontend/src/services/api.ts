import axios from 'axios';

const api = axios.create({ // Tạo một instance Axios
  baseURL: 'http://localhost:8080', // Đảm bảo đây là URL chính xác của backend của bạn, ví dụ: http://localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm JWT token vào header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Đính kèm token vào header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu nhận được lỗi 401, xóa token và chuyển hướng về trang đăng nhập
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login'; // Chuyển hướng cứng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default api;