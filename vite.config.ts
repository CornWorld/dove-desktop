import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import {fileURLToPath, URL} from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [solid()],
  assetsInclude: ['**/*.svg', "public/**/*"],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/breeze-color" as *;'
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
