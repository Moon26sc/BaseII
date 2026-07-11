const BASE_URL = 'https://baseii.onrender.com/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    // Quitamos el 'Content-Type': 'application/json' por defecto aquí
    const headers = {}; 
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

async function request(endpoint, method = 'GET', data = null) {
    const headers = getHeaders();
    const options = {
        method,
        headers
    };

    if (data) {
        // Si la data es un formulario con archivos (FormData), dejamos que el navegador 
        // ponga el Content-Type automáticamente. Si no, lo forzamos a JSON.
        if (data instanceof FormData) {
            options.body = data;
        } else {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.reload(); 
            throw new Error('Sesión expirada');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la solicitud');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const api = {
    get: (endpoint) => request(endpoint, 'GET'),
    post: (endpoint, data) => request(endpoint, 'POST', data),
    patch: (endpoint, data) => request(endpoint, 'PATCH', data),
    put: (endpoint, data) => request(endpoint, 'PUT', data), // Asegúrate de tener PUT si lo usas
    delete: (endpoint) => request(endpoint, 'DELETE')
};