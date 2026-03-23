import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        tailwindcss(),
        AutoImport({
            imports: ['vue', 'vue-router'],
            eslintrc: {
                enabled: true
            },
            vueTemplate: true
        }),
        Components({
            dirs: ['src/components', 'src/layouts', 'src/views'],
            extensions: ['vue'],
            deep: true,
            resolvers: [
                name => {
                    if (name.startsWith('Lucide')) {
                        const iconName = name.slice(6)
                        return {
                            importName: iconName,
                            path: 'lucide-vue-next'
                        }
                    }
                }
            ]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
    },
    css: {
        preprocessorOptions: {
            sass: {
                api: 'modern-compiler'
            }
        }
    }
})
