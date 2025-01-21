import {defineConfig} from 'vite'
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    assetsInclude: ['**/MTLLoader'],
    plugins: [topLevelAwait()],
    base: './',
    build: {
        target: 'esnext',
    },
})