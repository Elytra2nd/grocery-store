// vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        basicSsl(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        https: true,
        hmr: {
            clientPort: 443,
        },
        cors: {
            origin: /https?:\/\/.*\.ngrok-free\.app$/,
        }
    },
    allowedHosts: [
        'ngrok-free.app',
        'localhost',
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            'ziggy-js': path.resolve('vendor/tightenco/ziggy/dist/index.js'),
        },
    },
});
