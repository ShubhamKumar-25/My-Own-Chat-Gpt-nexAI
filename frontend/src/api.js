import axios from 'axios';

const API = axios.create({ baseURL: 'https://my-own-chat-gpt-nexai.onrender.com/api/chat' });

export const sendMessage = (messageData) => API.post('/send', messageData);
export const fetchHistory = (userId) => API.get(`/history?userId=${userId}`);
export const deleteChat = (userId) => API.delete(`/delete?userId=${userId}`);