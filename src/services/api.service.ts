
import envConfig from '@/config/env';

const BASE_URL = envConfig.socketUrl;  


interface RequestOptions extends RequestInit {
  data?: any;
}

const fetchWithAuth = async (url: string, options: RequestOptions = {}) => {
  const { data, ...fetchOptions } = options;
  const token = localStorage.getItem('auth_token');
  const role = (localStorage.getItem('user_role') || '').toLowerCase();
  const allowedRoles = new Set(['admin', 'user']);
  const roleHeader = allowedRoles.has(role) ? role : undefined;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(roleHeader && { 'X-User-Role': roleHeader }),
    ...(options.headers as Record<string, string>),
  };
  const response = await fetch(`${BASE_URL}${url}`, {
    ...fetchOptions,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw {
      message: responseData.message || `Error del servidor: ${response.status}`,
      type: responseData.type,
      statusCode: response.status,
      data: responseData.data
    };
  }

  return responseData;
};

const api = {
  get: (url: string, options?: RequestOptions) => 
    fetchWithAuth(url, { ...options, method: 'GET' }),
  
  post: (url: string, data?: any, options?: RequestOptions) => 
    fetchWithAuth(url, { ...options, method: 'POST', data }),
  
  put: (url: string, data?: any, options?: RequestOptions) => 
    fetchWithAuth(url, { ...options, method: 'PUT', data }),
  
  patch: (url: string, data?: any, options?: RequestOptions) => 
    fetchWithAuth(url, { ...options, method: 'PATCH', data }),
  
  delete: (url: string, data?: any, options?: RequestOptions) => 
    fetchWithAuth(url, { ...options, method: 'DELETE', data }),
  
  uploadFile: async (url: string, file: File, fieldName: string = 'file', additionalData?: Record<string, any>) => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // No establecemos Content-Type aquí porque fetch lo establece automáticamente con el boundary correcto para FormData
      },
      body: formData,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw {
        message: responseData.message || `Error del servidor: ${response.status}`,
        type: responseData.type,
        statusCode: response.status,
        data: responseData.data
      };
    }
    
    return responseData;
  },

  downloadFile: async (url: string, options?: RequestOptions) => {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || `Error del servidor: ${response.status}`,
        type: errorData.type,
        statusCode: response.status,
        data: errorData.data
      };
    }

    return response.blob();
  }
};

export default api;
