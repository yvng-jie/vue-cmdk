import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/vue-cmdk/',
  build: {
    outDir: 'dist-demo',
  },
})
