import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './dist/yaml/openapi.yaml',
  output: './src/generated',
});
