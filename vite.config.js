import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
    plugins: [
        // Plugin de Laravel para integrar Vite con el backend
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
        // Plugin de React con SWC para compilacion rapida de JSX
        react(),
    ],
    server: {
        port: 5173,
        // Proxy: en desarrollo, redirige las llamadas a /api y /storage al servidor Laravel
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/storage': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
        watch: {
            // Ignoramos las vistas compiladas de Laravel para no reiniciar el servidor innecesariamente
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
