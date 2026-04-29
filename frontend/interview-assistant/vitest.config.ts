import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lucide-react': path.resolve(__dirname, 'src/__mocks__/lucide-react.ts'),
    },
  },
  server: {
    deps: {
      inline: ['@csstools/css-calc', '@asamuzakjp/css-color'],
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/setupTests.ts',
    deps: {
      optimizer: {
        web: {
          include: ['@csstools/css-calc', '@asamuzakjp/css-color'],
        },
      },
    },
  },
});
