import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

const installedVersion = (pkg: string) =>
  JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, 'utf8')).version

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build works under any GitHub Pages subpath
  base: './',
  plugins: [react()],
  define: {
    __VERSIONS__: JSON.stringify({
      legacy: installedVersion('react-fontawesome-0.2.6'),
      latest: installedVersion('@fortawesome/react-fontawesome'),
      core: installedVersion('@fortawesome/fontawesome-svg-core'),
      react: installedVersion('react'),
    }),
  },
})
