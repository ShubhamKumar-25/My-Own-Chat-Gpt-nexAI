
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        
        console.log("Sending Token to Backend:", token ? "Token Found" : "No Token Found (null)");

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fetchHistory = (userId) => api.get(`/chat/history?userId=${userId}`);
export const sendMessage = (data) => api.post('/chat/send', data);
export const deleteChat = (id) => api.delete(`/chat/delete/${id}`);

export default api;