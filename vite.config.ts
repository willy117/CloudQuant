import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 雖然這裡 loadEnv 讀取了 .env，但我們在 CI/CD 中會用另一種方式注入變數
  // const env = loadEnv(mode, '.', ''); // 這一行在部署時其實不會用到本地的 .env

  return {
    // 【重要修改 1】設定 GitHub Pages 的基礎路徑
    // 請將 '你的倉庫名稱' 替換成你實際的 GitHub Repository 名稱
    // 例如你的倉庫是 fintech-demo，這裡就寫 '/fintech-demo/'
    base: '/CloudQuant/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],

    // 【重要修改 2】移除這裡的 define 區塊
    // 因為我們已經改用 import.meta.env.VITE_ 的方式，
    // 且會在 GitHub Actions 中透過環境變數注入，所以這裡不再需要手動定義 process.env
    /*
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    */

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
