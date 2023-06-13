import {defineConfig} from 'vite'

export default defineConfig({
    resolve: {
        extensions: [".ts", ".js"],
    },
    build: {
        minify: true,
        lib: {
            name: 'history',
            fileName: 'history',
            entry: "./main.ts",
            formats: ['umd']
        }
    },
})
