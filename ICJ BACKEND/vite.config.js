import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const appBasePath = env.VITE_APP_BASE_PATH || "/";
  const enableSourceMaps = env.VITE_BUILD_SOURCEMAP === "true";

  return {
    base: appBasePath,
    plugins: [react()],
    build: {
      sourcemap: enableSourceMaps,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
              return "react-vendor";
            }
            if (id.includes("node_modules/@mui") || id.includes("node_modules/@emotion")) {
              return "mui-vendor";
            }
            if (id.includes("node_modules/@supabase")) {
              return "supabase-vendor";
            }
            return undefined;
          },
        },
      },
    },
  };
})
