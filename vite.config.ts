// import { resolve } from 'path';
import { defineConfig, UserConfigExport } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const config: UserConfigExport = {
    plugins: [vue()],
    resolve: {
      alias: {
        // '@mxssfd': resolve(__dirname, 'packages'),
      },
    },
  };

  return config;
});
