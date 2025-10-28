import axios from 'axios';
import queryString from 'query-string';


const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    paramsSerializer: {
        serialize: (params) => queryString.stringify(params)
    }
});

// axiosClient.interceptors.response.use((response) => {
//     return response;
// }, (error) => {
//     if (!error.response || error.message === 'Network Error') {
//         window.location.href = '/error';
//     }
//     return Promise.reject(error);
// });


export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    paramsSerializer: {
        serialize: (params) => queryString.stringify(params)
    }
});


axiosPrivate.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axiosPrivate.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    } else if (!error.response || error.message === 'Network Error') {
        // Lỗi không kết nối được API
        window.location.href = '/error';
    }
    return Promise.reject(error);
});