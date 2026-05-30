import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts'],
      compilerOptions: {
        skipLibCheck: true,
      },
    }),
  ],
  resolve: {
    alias: {
      'vue-cmdk': new URL('src/index.ts', import.meta.url).pathname,
    },
  },
  build: {
    lib: {
      entry: new URL('src/index.ts', import.meta.url).pathname,
      name: 'VueCmdk',
      fileName: 'vue-cmdk',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
