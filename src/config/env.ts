const envConfig = {
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',
    // URLs del backend
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
    socketUrl: import.meta.env.VITE_SOCKET_BASE_URL || 'http://localhost:3002/',
} as const;

export default envConfig;
