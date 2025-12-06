// src/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://your-api-url.com', // API 기본 URL 설정
    withCredentials: true, // 쿠키 자동 포함 (HttpOnly 쿠키 포함)
});

// 요청 인터셉터: Access Token 자동 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`; // 헤더에 accessToken 추가
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
