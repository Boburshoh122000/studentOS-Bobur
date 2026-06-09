import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: Number(process.env.PORT) || 5173,
      host: '0.0.0.0',
    },
    preview: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 4173,
      allowedHosts: ['localhost', '.railway.app', '.studentos.uz'],
    },
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
      },
      rollupOptions: {
        output: {
          // Split heavyweight vendors out of the entry chunk so routes only
          // pay for what they use and vendor code caches independently
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (
              /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)
            )
              return 'react-vendor';
            if (id.includes('framer-motion') || id.includes('/gsap')) return 'motion';
            if (id.includes('i18next')) return 'i18n';
            if (id.includes('recharts') || id.includes('/d3-')) return 'charts';
            if (id.includes('@tsparticles')) return 'particles';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
