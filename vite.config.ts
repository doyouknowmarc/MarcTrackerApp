import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER
const isUserOrOrgPagesRepo = Boolean(
  repoOwner && repoName && repoName.toLowerCase() === `${repoOwner.toLowerCase()}.github.io`,
)
const githubPagesBase = repoName && !isUserOrOrgPagesRepo ? `/${repoName}/` : '/'
const isGithubActionsBuild = process.env.GITHUB_ACTIONS === 'true'
const basePath = isGithubActionsBuild ? githubPagesBase : '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'MarcTracker',
        short_name: 'MarcTracker',
        description: 'Tracke deine Körperwerte schnell vom Handy aus.',
        theme_color: '#0f766e',
        background_color: '#f4f7f3',
        display: 'standalone',
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
