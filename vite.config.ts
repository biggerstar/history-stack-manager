import {defineConfig} from 'vite'
import ts from 'vite-plugin-typescript'

export default defineConfig({
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [ ],
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
