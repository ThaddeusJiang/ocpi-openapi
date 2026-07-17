import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './dist/yaml/openapi.ems.yaml',
  output: './src/generated',
});
