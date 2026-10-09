import axiosInstance from './axiosInstance';

const formatUser = (data) => {
  if (!data) throw new Error('The server returned no user profile.');
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
  return {
    id: data.userId ?? data.id,
    name: name || data.name || '',
    email: data.email,
    role: data.role,
    phone: data.phone ?? null,
    avatar: data.profileImage ?? null,
  };
};

const unwrap = (response) => response.data?.data || response.data;

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    const payload = unwrap(response);
    const token = payload?.accessToken || payload?.token;
    if (!token) throw new Error('The server did not return an access token.');
    return { data: { token, user: formatUser(payload) } };
  },
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/users/me');
    return { data: { user: formatUser(unwrap(response)) } };
  },
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    const payload = unwrap(response);
    const token = payload?.accessToken || payload?.token;
    return { data: { token, user: formatUser(payload) } };
  },
  registerPharmacy: (data) => axiosInstance.post('/auth/register', data),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
  changePassword: (data) => axiosInstance.put('/auth/change-password', data),
  logout: () => axiosInstance.post('/auth/logout'),
  verifyToken: () => axiosInstance.get('/users/me'),
  refreshToken: () => axiosInstance.post('/auth/refresh'),
};
