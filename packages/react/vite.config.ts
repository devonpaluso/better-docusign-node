import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

const name = '@echobridge/react'

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
            onwarn(warning, warn) {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                warn(warning)
            },
            external: [
                'react',
                'react/jsx-runtime',
                //'@mui/material'
            ],
            output: [
                { format: 'es', entryFileNames: 'main.es.js' },
                { format: 'umd', entryFileNames: 'main.umd.cjs', name }
            ]
        }
    }
})
