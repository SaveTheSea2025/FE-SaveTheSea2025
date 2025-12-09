import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const defineEnv = {
    'import.meta.env.VITE_KAKAO_MAP_KEY': JSON.stringify(env.VITE_KAKAO_MAP_KEY),
    'import.meta.env.VITE_MOF_KEY': JSON.stringify(env.VITE_MOF_KEY),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
  };

  return {
    plugins: [react()],

    define: defineEnv, 

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      proxy: {
        "/api": {
         
          target: env.VITE_API_BASE_URL || "https://api.savethesea.site",
          changeOrigin: true,
          secure: false, 
          rewrite: (path) => path.replace(/^\/api/, "/api"), 
        },
      },
    },
  };
});
