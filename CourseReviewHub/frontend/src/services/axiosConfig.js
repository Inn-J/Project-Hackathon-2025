import axios from 'axios';
import { auth } from './firebaseConfig';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor: แนบ Token ทุกครั้งที่ยิง API
instance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;