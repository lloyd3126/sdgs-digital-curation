import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const basePath = process.env.VITE_BASE_PATH
  ?? (repositoryName && !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}/`
    : '/')

export default defineConfig({
  base: basePath,
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        pro: fileURLToPath(new URL('./pro/index.html', import.meta.url)),
        v1: fileURLToPath(new URL('./v1/index.html', import.meta.url)),
      },
    },
  },
})
