import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

let TOKEN: string | null = null;
let REFRESH_TOKEN: string | null = null;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- refresh handling ---
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // queue this request until refresh finishes
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        setToken(newAccess);

        refreshQueue.forEach((cb) => cb(newAccess));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        logout();
        // optionally: redirect to login screen here
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const setToken = (token: string) => {
  TOKEN = token;
  try { localStorage.setItem('fitparent_token', token); } catch (e) {}
};

export const getToken = () => {
  if (TOKEN) return TOKEN;
  try { TOKEN = localStorage.getItem('fitparent_token'); } catch (e) {}
  return TOKEN;
};

export const setRefreshToken = (token: string) => {
  REFRESH_TOKEN = token;
  try { localStorage.setItem('fitparent_refresh', token); } catch (e) {}
};

export const getRefreshToken = () => {
  if (REFRESH_TOKEN) return REFRESH_TOKEN;
  try { REFRESH_TOKEN = localStorage.getItem('fitparent_refresh'); } catch (e) {}
  return REFRESH_TOKEN;
};

export const logout = async () => {
  TOKEN = null;
  REFRESH_TOKEN = null;
  try {
    localStorage.removeItem('fitparent_token');
    localStorage.removeItem('fitparent_refresh');
  } catch (e) {}
};

// Auth

export const getProgressSummary = () => api.get('/health/progress-summary/');
export const register = (data: object) => api.post('/users/register/', data);
export const login = (username: string, password: string) =>
  api.post('/users/login/', { username, password });
export const getProfile = () => api.get('/users/profile/');
export const updateProfile = (data: object) => api.patch('/users/profile/', data);

// Workouts
export const getPrograms = () => api.get('/workouts/programs/');
export const startSession = (program_id: number | null = null) =>
  api.post('/workouts/session/start/', { program_id });
export const completeSession = (session_id: number) =>
  api.post(`/workouts/session/${session_id}/complete/`);
export const logExercises = (logs: object[]) =>
  api.post('/workouts/session/log-exercise/', logs);

// Health
export const logPain = (data: object) => api.post('/health/pain/log/', data);
export const getPainHistory = () => api.get('/health/pain/history/');
export const logRecovery = (data: object) => api.post('/health/recovery/log/', data);

// Coach
export const getCoachMessage = (message: string) => api.post('/coach/message/', { message });
export const smartCoach = (message: string) => api.post('/coach/smart/', { message });

export const completeRegistration = async (data: {
  username: string;
  password: string;
  [key: string]: any;
}) => {
  // Register user
  await register(data);

  // Login immediately
  const res = await login(data.username, data.password);

  // Store JWT tokens
  setToken(res.data.access);
  setRefreshToken(res.data.refresh);

  return res.data.user;
};
export default api;