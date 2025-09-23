import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅✅✅ เพิ่มโค้ดส่วนนี้เข้าไปทั้งหมด ✅✅✅
  server: {
    proxy: {
      // เมื่อมีการเรียก URL ที่ขึ้นต้นด้วย /api
      // Vite จะส่ง request นั้นไปที่ http://localhost:3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});