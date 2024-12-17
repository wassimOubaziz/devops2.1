import axios from 'axios';

// Create API instances for each service
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const projectApi = axios.create({
  baseURL: import.meta.env.VITE_PROJECT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const taskApi = axios.create({
  baseURL: import.meta.env.VITE_TASK_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to all API instances
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to all API instances
[authApi, projectApi, taskApi, userApi].forEach(addAuthInterceptor);

// Export API instances and endpoint functions
export const auth = {
  login: (credentials) => authApi.post('/api/auth/login', credentials),
  signup: (userData) => authApi.post('/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  getProfile: () => authApi.get('/api/auth/profile'),
};

export const user = {
  getAll: () => userApi.get('/api/users'),
  getById: (id) => userApi.get(`/api/users/${id}`),
  updateProfile: (data) => userApi.put('/api/users/profile', data),
  changePassword: (data) => userApi.post('/api/users/change-password', data),
};

export const projects = {
  getAll: () => projectApi.get('/api/projects'),
  getById: (id) => projectApi.get(`/api/projects/${id}`),
  create: (data) => projectApi.post('/api/projects', data),
  update: (id, data) => projectApi.put(`/api/projects/${id}`, data),
  delete: (id) => projectApi.delete(`/api/projects/${id}`),
  getProjectTasks: (id) => projectApi.get(`/api/projects/${id}/tasks`),
  addProjectTask: (id, taskData) => projectApi.post(`/api/projects/${id}/tasks`, taskData),
};

export const tasks = {
  getAll: () => taskApi.get('/api/tasks'),
  getById: (id) => taskApi.get(`/api/tasks/${id}`),
  create: (data) => taskApi.post('/api/tasks', data),
  update: (id, data) => taskApi.put(`/api/tasks/${id}`, data),
  delete: (id) => taskApi.delete(`/api/tasks/${id}`),
  updateStatus: (id, status) => taskApi.patch(`/api/tasks/${id}/status`, { status }),
  assignTask: (id, userId) => taskApi.post(`/api/tasks/${id}/assign`, { userId }),
};

export { authApi, projectApi, taskApi, userApi };
