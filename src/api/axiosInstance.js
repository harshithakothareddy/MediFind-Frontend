import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('medifind_token');
    if (token && token.startsWith('mdf_token_')) {
      localStorage.removeItem('medifind_token');
      token = null;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors and unwrap Spring Boot ApiResponse
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      const envelope = response.data;
      const payload = envelope.data;
      if (payload !== null && typeof payload === 'object') {
        if (!('data' in payload)) {
          try {
            Object.defineProperty(payload, 'data', {
              value: payload,
              enumerable: false,
              configurable: true,
            });
          } catch (_) {}
        }
        if (!('success' in payload)) {
          try {
            Object.defineProperty(payload, 'success', {
              value: envelope.success,
              enumerable: false,
              configurable: true,
            });
          } catch (_) {}
        }
      }
      response.data = payload !== undefined ? payload : envelope;
    }
    return response;
  },
  (error) => {
    const { response, config } = error || {};

    if (!response) {
      return Promise.reject({
        message: error?.message || 'Server is waking up — please wait a moment and try again. (Render free tier takes ~30-50s to start)',
        code: 'NETWORK_ERROR',
      });
    }

    switch (response.status) {
      case 401: {
        const isAuthRequest = Boolean(config?.url && (
          config.url.includes('/auth/login') ||
          config.url.includes('/auth/register') ||
          config.url.includes('/auth/forgot-password') ||
          config.url.includes('/auth/reset-password')
        ));
        const skipRedirect = Boolean(config?._skipAuthRedirect || isAuthRequest);
        const isOnAuthPage = typeof window !== 'undefined' && (
          window.location.pathname === '/login' ||
          window.location.pathname === '/register' ||
          window.location.pathname === '/forgot-password'
        );

        const hadToken = Boolean(localStorage.getItem('medifind_token'));
        localStorage.removeItem('medifind_token');
        localStorage.removeItem('medifind_user');

        // Only redirect with "session expired" if the user actually had an active token,
        // is not already on an auth page, and the request wasn't an explicit auth endpoint or silent check.
        if (!skipRedirect && !isOnAuthPage && hadToken) {
          toast.error('Your session has expired. Please login again.');
          window.location.href = '/login?session=expired';
        }
        break;
      }
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        break;
      case 422:
        break;
      case 429:
        toast.warning('Too many requests. Please wait a moment.');
        break;
      case 500:
      case 502:
      case 503:
        break;
      default:
        break;
    }

    return Promise.reject(response.data || { message: 'An error occurred' });
  }
);

export default axiosInstance;
