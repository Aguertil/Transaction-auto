import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gaId = (env.VITE_GA_MEASUREMENT_ID || '').trim();

  return {
    plugins: [
      react(),
      {
        name: 'inject-ga-measurement-id',
        transformIndexHtml(html) {
          const safe = gaId.startsWith('G-') ? gaId : '';
          return html.replace(
            '</head>',
            `<script>window.__GA_MEASUREMENT_ID__=${JSON.stringify(safe)};</script>\n  </head>`
          );
        }
      }
    ],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  };
});

