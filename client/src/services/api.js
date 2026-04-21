import axios from 'axios';

export const AUTH_EXPIRED_EVENT = 'app:auth-expired';

const DEV_API_URL = 'http://localhost:5000/api';

const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (import.meta.env.DEV) {
    return DEV_API_URL;
  }

  throw new Error(
    'Missing VITE_API_URL. Set it in Vercel project settings or client/.env.production before building.'
  );
};

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getApiErrorPayload = (error, fallbackMessage = 'Request failed') => {
  if (!axios.isAxiosError(error)) {
    return {
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage,
      status: null,
      details: null,
    };
  }

  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Khong ket noi duoc backend. Hay kiem tra server API.',
      status: null,
      details: null,
    };
  }

  const { status, data } = error.response;
  const code = typeof data?.code === 'string' ? data.code : null;
  const details = data?.details && typeof data.details === 'object' ? data.details : null;
  const message =
    typeof data?.message === 'string' && data.message.trim() !== '' ? data.message : fallbackMessage;

  return {
    code: code || 'REQUEST_FAILED',
    message,
    status,
    details,
  };
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, message, code } = getApiErrorPayload(error, 'Request failed');
    const requestUrl = error.config?.url || '';
    const isPublicAuthRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (status === 401 && !isPublicAuthRequest && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(AUTH_EXPIRED_EVENT, {
          detail: {
            code,
            message,
            status,
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;
