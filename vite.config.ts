import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sentryConfigured =
    Boolean(env.SENTRY_AUTH_TOKEN?.trim()) &&
    Boolean(env.SENTRY_ORG?.trim()) &&
    Boolean(env.SENTRY_PROJECT?.trim());

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/email': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      sentryConfigured &&
        sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          authToken: env.SENTRY_AUTH_TOKEN,
          release: {
            name: env.SENTRY_RELEASE || undefined,
            inject: true,
            create: true,
            finalize: true,
          },
          sourcemaps: {
            assets: "./dist/assets/**",
            filesToDeleteAfterUpload: ["./dist/**/*.map"],
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: sentryConfigured ? "hidden" : false,
      minify: "esbuild",
      cssMinify: "esbuild",
      reportCompressedSize: false,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
  };
});
