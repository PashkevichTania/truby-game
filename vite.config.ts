import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";



// https://vite.dev/config/
export default defineConfig({
  base: '/truby-game/',
  plugins: [svgr({
    include: "**/*.svg?react",
  }),react(),tailwindcss()],
})
