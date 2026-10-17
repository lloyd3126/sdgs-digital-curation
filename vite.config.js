import { defineConfig } from 'vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const basePath = process.env.VITE_BASE_PATH
  ?? (repositoryName && !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}/`
    : '/')

export default defineConfig({
  base: basePath,
})
