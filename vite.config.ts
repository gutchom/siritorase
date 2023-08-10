import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

const entries = resolve(__dirname, 'src/pages');
const input = readdirSync(entries, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .reduce(
    (result, dirent) => ({
      ...result,
      [dirent.name]: resolve(entries, dirent.name, 'index.html'),
    }),
    {},
  );

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': `${root}/`,
    },
  },
  root,
  build: {
    outDir,
    rollupOptions: {
      input,
    },
  },
});
