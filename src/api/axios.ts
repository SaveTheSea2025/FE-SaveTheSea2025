// src/api/axios.ts
import axios from "axios";

// 환경 변수에 따라 Base URL 결정
// 개발 환경(development): 프록시를 타야 하므로 빈 문자열 "" (상대 경로)
// 배포 환경(production): 프록시가 없으므로 실제 백엔드 주소 입력
const isDev = import.meta.env.MODE === 'development';
const baseURL = isDev ? '' : 'https://api.savethesea.site';

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // 쿠키 사용 시 필요하면 주석 해제
});

// 요청 인터셉터 (토큰 자동 추가 등)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;