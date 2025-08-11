import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

const name = '@echobridge/api'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        dts({ include: 'lib', rollupTypes: true }),
    ],
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
        },
        rollupOptions: {
            external: [
                'crypto'
            ],
            output: [
                { format: 'es', entryFileNames: 'main.es.js' },
                { format: 'umd', entryFileNames: 'main.umd.cjs', name }
            ]
        }
    }
})
