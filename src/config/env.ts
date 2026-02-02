const envConfig = {
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',
    // URLs del backend
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://data-uploader-backend.railway.internal/api',
    socketUrl: import.meta.env.VITE_BACKEND_URL || 'https://data-uploader-backend.railway.internal',
} as const;

export default envConfig;
