/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENVIRONMENT: 'development' | 'production'
    /** 'true' shows the shopping assistant's chat launcher. */
    readonly VITE_AGENT_ENABLED?: string
}
