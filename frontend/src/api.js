

// import axios from 'axios';

// const API = axios.create({ baseURL: 'https://my-own-chat-gpt-nexai.onrender.com' });

// export const sendMessage = (messageData) => API.post('/send', messageData);
// export const fetchHistory = () => API.get('/history'); // Naya function



import axios from 'axios';

// Base URL ko sirf main domain tak rakhein, routes niche alag se handle honge
const API = axios.create({ baseURL: 'https://my-own-chat-gpt-nexai.onrender.com' });

// 🔐 Authentication Routes (Ab sahi URL banega: /api/auth/signup)
export const signup = (userData) => API.post('/api/auth/signup', userData);
export const login = (userData) => API.post('/api/auth/login', userData);

// 💬 Chat Routes (Ab sahi URL banega: /api/chat/send)
export const sendMessage = (messageData) => API.post('/api/chat/send', messageData);
export const fetchHistory = (userId) => API.get(`/api/chat/history?userId=${userId}`);
export const deleteChat = (userId) => API.delete(`/api/chat/delete?userId=${userId}`);