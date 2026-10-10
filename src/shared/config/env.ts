// Import and export all environment variables from here

/** The shopping assistant's frontend switch (VITE_AGENT_ENABLED), matching the backend's AGENT_ENABLED. */
export const isAgentEnabled = (): boolean => import.meta.env.VITE_AGENT_ENABLED === 'true'
