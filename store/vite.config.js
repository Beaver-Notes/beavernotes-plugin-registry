import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: 'dist',
  },
}));
