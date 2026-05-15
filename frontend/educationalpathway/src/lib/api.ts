import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type RefreshTokenResponse = {
  accessToken?: string;
  user?: any;
  data?: {
    accessToken?: string;
    user?: any;
  };
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Helper to extract error messages without using 'any'
export const getErrorMessage = (error: unknown, defaultMessage: string = 'Something went wrong'): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string; error?: string; details?: string } | undefined;
    return responseData?.message || responseData?.error || responseData?.details || error.message || defaultMessage;
  }
  return error instanceof Error ? error.message : defaultMessage;
};

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and data unwrapping
api.interceptors.response.use(
  (response) => {
    // Automatically unwrap the standard JSend-like { status: 'success', data: ... } format
    // If pagination exists, we preserve the whole structure to avoid losing metadata
    if (response.data && (response.data.status === 'success' || response.data.success === true) && response.data.data !== undefined) {
      // If it's a paginated response (contains rows and total), don't unwrap 
      // or at least preserve the success/status at the top level.
      if (response.data.pagination || (response.data.data && response.data.data.rows && response.data.data.total !== undefined)) {
        return response;
      }
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshUrl = `${api.defaults.baseURL}/auth/refresh-token`;
        const response = await axios.post<RefreshTokenResponse>(refreshUrl, {}, {
          withCredentials: true
        });

        const accessToken = response.data?.accessToken || response.data?.data?.accessToken;
        if (!accessToken) {
          throw new Error('Refresh token response did not include accessToken');
        }

        const user = response.data?.user || response.data?.data?.user;
        
        localStorage.setItem('accessToken', accessToken);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
