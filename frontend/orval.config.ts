import {defineConfig} from 'orval';

export default defineConfig({
  roomflow: {
    input: {
      target: process.env.ORVAL_OPENAPI_URL ?? 'http://localhost:8081/v3/api-docs',
    },
    output: {
      target: './src/services/generated/client.ts',
      schemas: './src/services/generated/model',
      client: 'axios',
      mode: 'split',
      clean: true,
    },
  },
});
