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

// Base URL ending with /api
const API_URL = 'https://my-own-chat-gpt-nexai.onrender.com/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatic JWT Token Injection
api.interceptors.request.use(
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

export default api;
