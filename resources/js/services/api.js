import axios from 'axios';

// Configuracion base del cliente HTTP para comunicarse con el backend Laravel
// Usa la variable de entorno VITE_API_URL o por defecto /api
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Accept': 'application/json' },
});

// Interceptor de request: agrega el token Bearer automaticamente si existe en localStorage
// Tambien maneja el Content-Type: si es FormData no lo setea (para subida de archivos),
// de lo contrario usa application/json
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

// Interceptor de respuesta: si el backend devuelve 401 (no autorizado),
// limpia localStorage y redirige al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
