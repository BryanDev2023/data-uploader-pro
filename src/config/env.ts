const normalizeApiBaseUrl = (value: string) => {
    const trimmed = value.replace(/\/+$/, '');
    if (trimmed.endsWith('/api/v1')) {
        return trimmed;
    }
    if (trimmed.endsWith('/api')) {
        return `${trimmed}/v1`;
    }
    return `${trimmed}/api/v1`;
};

const envConfig = {
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',
    // URLs del backend
    apiBaseUrl: normalizeApiBaseUrl(
        import.meta.env.VITE_API_BASE_URL || 'https://data-uploader-backend-production.up.railway.app/api/v1'
    ),
    socketUrl: import.meta.env.VITE_BACKEND_URL || 'https://data-uploader-backend-production.up.railway.app/',
} as const;

export default envConfig;
