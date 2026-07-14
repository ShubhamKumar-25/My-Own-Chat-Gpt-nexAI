// import axios from 'axios';

// const api = axios.create({ 
    
//   baseURL: 'https://my-own-chat-gpt-nexai.onrender.com/api' 
// });

// export default api;











// import axios from 'axios';

// const API_URL = 'https://my-own-chat-gpt-nexai.onrender.com/api'; 

// const api = axios.create({
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers['Authorization'] = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// export default api;





import axios from 'axios';

// 1. Single Base URL configuration
const API = axios.create({ 
  baseURL: 'https://my-own-chat-gpt-nexai.onrender.com' 
});

// 2. Request Interceptor (JWT Token automatically authorization header me add karega)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 🔐 Authentication Endpoints
export const signup = (userData) => API.post('/api/auth/signup', userData);
export const login = (userData) => API.post('/api/auth/login', userData);

// 4. 💬 AI Chat Endpoints
export const sendMessage = (messageData) => API.post('/api/chat/send', messageData);
export const fetchHistory = (userId) => API.get(`/api/chat/history?userId=${userId}`);
export const deleteChat = (userId) => API.delete(`/api/chat/delete?userId=${userId}`);

export default API;