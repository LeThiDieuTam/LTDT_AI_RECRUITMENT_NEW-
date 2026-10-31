// src/utils/image.ts
// Chuẩn hóa URL ảnh từ backend.
// Ảnh upload trả về dạng "/uploads/<file>" (relative).
// Trên frontend chạy ở cổng khác (Vite 5173), cần ghép thêm baseURL backend (8080).

const BACKEND_URL = 'http://localhost:8080';

export const toImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  // Nếu đã là URL tuyệt đối (http/https) hoặc data URI thì giữ nguyên
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // URL relative "/uploads/..." -> ghép với backend
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
