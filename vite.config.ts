/// <reference types="vitest" />
import { defineConfig, loadEnv, type ServerOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'

type Mode = 'development' | 'production' | 'testing'

interface AppEnv {
    PORT: string
    BACKEND_URL: string
    SENTRY_AUTH_TOKEN: string
    VITE_ENVIRONMENT: Mode
}

const validateEnv = (envMode: Mode, env: AppEnv) => {
    const requiredVars: (keyof AppEnv)[] = ['VITE_ENVIRONMENT']

    if (envMode !== 'production') {
        requiredVars.push('PORT', 'BACKEND_URL')
    } else {
        // BACKEND_URL and SENTRY_AUTH_TOKEN are optional in production so Vercel can build
        // without a backend deployed yet.
    }

    for (const key of requiredVars) {
        if (!env[key]) {
            throw new Error(`Missing required environment variable: ${key}`)
        }
    }

    const typedEnv = env as unknown as AppEnv
    if (!['development', 'testing', 'production'].includes(typedEnv.VITE_ENVIRONMENT)) {
        throw new Error(`Invalid VITE_ENVIRONMENT value: ${typedEnv.VITE_ENVIRONMENT}. Must be 'development', 'testing', or 'production'.`)
    }
}

const normalizeport = (port: string): number => {
    const parsedPort = parseInt(port, 10)
    if (isNaN(parsedPort)) {
        throw new Error(`Invalid port number: ${port}`)
    }
    return parsedPort
}

export default defineConfig(({ mode }) => {
    const envMode = mode as Mode
    const env = loadEnv(envMode, process.cwd(), '') as unknown as AppEnv

    // Fallback if VITE_ENVIRONMENT is missing in CI/Vercel
    if (!env.VITE_ENVIRONMENT) {
        env.VITE_ENVIRONMENT = envMode
    }

    validateEnv(envMode, env)

    const port = env.PORT ? normalizeport(env.PORT) : 3000

    const config: ServerOptions = {
        port,
        open: true,
        proxy: {
            '/api': {
                target: env.BACKEND_URL || 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }

    return {
        plugins: [
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler']]
                }
            }),
            tailwindcss(),
            env.VITE_ENVIRONMENT === 'production' && env.SENTRY_AUTH_TOKEN
                ? sentryVitePlugin({
                      org: 'numl-xn',
                      project: 'react-production-setup',
                      authToken: env.SENTRY_AUTH_TOKEN,
                      sourcemaps: {
                          filesToDeleteAfterUpload: ['dist/assets/**/*.map']
                      }
                  })
                : undefined
        ],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setup-tests.ts',
            include: ['src/**/*.{test.ts,spec.ts}', 'src/**/*.{test.tsx,spec.tsx}'],
            coverage: {
                reporter: ['json', 'html'],
                include: ['src/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
                exclude: ['coverage', 'dist', 'build', 'src/super-tests.ts', 'src/**/*.{test,spec}.{ts,tsx}'],
                thresholds: {
                    // Maintain 80% coverage across the board, but you can adjust these as needed
                    statements: 50,
                    branches: 50,
                    functions: 50,
                    lines: 50
                }
            }
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        server: config,
        preview: config,
        build: {
            // 1. Explicitly use 'terser' for advanced uglification/minifying
            minify: 'terser',

            // 2. Uglify options to remove console logs, debuggers, and mangle names
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                },
                mangle: true // This is the "uglifying" part (obfuscates names)
            },

            sourcemap: env.VITE_ENVIRONMENT === 'production',

            // 3. Keep your custom chunking strategy
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            return 'vendor'
                        }
                    }
                },
                external: [/.*\.(test|spec)\.(ts|tsx)$/]
            },

            // 4. Vite uses esbuild for CSS by default; 'true' enables it
            cssMinify: true
        }
    }
})
