import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // 關鍵設定：GitHub Pages 通常部署在 https://username.github.io/repo-name/
    // 因此 base 必須設定為儲存庫名稱，或者使用 './' (相對路徑) 來自動適應
    base: './', 
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    // 定義全域常數替換，確保環境變數在靜態構建中正確注入
    define: {
      'process.env': {} 
    }
  };
});