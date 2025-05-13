import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add historyApiFallback for client-side routing
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /^\/.*/, to: '/index.html' }
      ]
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure the base path is set correctly for production
  base: '/',
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Output directory (default is 'dist')
    outDir: 'dist',
    // Ensure assets are properly handled
    assetsDir: 'assets',
    // Configure rollup options
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            // Add other UI libraries as needed
          ],
        },
      },
    },
  },
}));
