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
});