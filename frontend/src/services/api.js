import axios from 'axios';

const api = axios.create({ 
    
  baseURL: 'https://my-own-chat-gpt-nexai.onrender.com/api' 
});

export default api;