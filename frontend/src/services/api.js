import axios from 'axios';

const api = axios.create({ 
  // Base URL mein hi humne Render ka sahi live domain aur '/api' jod diya hai
  baseURL: 'https://my-own-chat-gpt-nexai.onrender.com/api' 
});

export default api;