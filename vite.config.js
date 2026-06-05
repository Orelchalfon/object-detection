import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert(), // Enable HTTPS with a locally trusted certificate
  ],
  server: {
    https: true, // Serve the development server over HTTPS
  },
  build: {
    sourcemap: true, // ship source maps for first-party JS (Lighthouse best-practices)
    rollupOptions: {
      output: {
        // Split heavy vendors into their own cacheable chunks. TF.js is only
        // pulled in via dynamic import(), so this chunk loads on demand — not
        // on first paint.
        manualChunks: {
          tfjs: ["@tensorflow/tfjs", "@tensorflow-models/coco-ssd"],
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});