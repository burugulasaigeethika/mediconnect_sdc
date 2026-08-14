import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        },
        // Ensure proper SPA fallback for client-side routing
        historyApiFallback: true
    },
    // Add build configuration for proper SPA handling
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
})