import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import {fileURLToPath, URL} from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxImportSource: "@emotion/react",
  })],
  assetsInclude: ['**/*.svg', "public/**/*"],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/breeze-color.scss";'
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    }
  },
  server: {
    host: '0.0.0.0'
  }
})
