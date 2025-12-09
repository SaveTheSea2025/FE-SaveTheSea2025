/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/auth.ts
/**
 * =========================================================
 * Auth API Client
 * =========================================================
 */

// ✅ 1. User 정보 타입 정의 (AuthContext와 공유)
export interface User {
    userId: number;
    email: string;
    userName: string;

    memberType: 'PERSONAL' | 'GROUP';
    region: string;
    profileUrl: string | null;
}

export interface ApiResponse<T = any> {
    errorMessage: string;
    code: number;
    message: string;
    data: T | null;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 공통 Fetch Wrapper (제네릭 적용)
 * AccessToken 자동 삽입 로직 포함
 * @param url 요청 URL
 * @param options fetch 옵션
 * @returns Promise<ApiResponse<T>>
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const isFormData = options.body instanceof FormData;

    // 토큰을 가져와 모든 요청에 Authorization 헤더 자동 추가
    const token = localStorage.getItem("accessToken");

    // Content-Type 기본 헤더 설정
    const defaultHeaders: Record<string, string> = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
    };

    // AccessToken이 있을 경우 Authorization 헤더 추가
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            ...defaultHeaders, // 기본 헤더 (Content-Type, Authorization) 먼저 적용
            ...(options.headers || {}), // options에서 전달된 헤더로 덮어쓰거나 병합
        },
        credentials: "include", // refreshToken 쿠키 포함
    });

    // accessToken 헤더에 담겨오면 저장 (서버가 헤더로 토큰을 줄 경우 대비)
    const newAccessToken = res.headers.get("accessToken");
    if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
    }

    // JSON 응답을 ApiResponse<T> 타입으로 반환
    return res.json() as Promise<ApiResponse<T>>;
}

/* =========================================================
 * 이메일 인증 API
 * ========================================================= */

/**
 * 이메일 인증 코드 발송
 * POST /api/auth/send-code
 */
export function sendEmailCode(email: string): Promise<ApiResponse> {
    return request(`/api/auth/send-code`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

/**
 * 이메일 인증 코드 검증
 * POST /api/auth/verify-code
 */
export function verifyEmailCode(email: string, code: string): Promise<ApiResponse> {
    return request(`/api/auth/verify-code`, {
        method: "POST",
        body: JSON.stringify({ email, code }),
    });
}

// src/api/auth.ts (login 함수 수정)

/**
 * 로그인
 * POST /api/auth/login
 * 응답 데이터에 User 정보 또는 accessToken이 포함
 */

export function login(email: string, password: string, memberType: string): Promise<ApiResponse<User | { accessToken?: string }> | ApiResponse<unknown>> {
    return request(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
            memberType
        }),
    }).then((response) => {
        if (
            response.code === 0 &&
            response.data &&
            typeof response.data === 'object' && // 객체 타입인지 확인 (TypeScript에게 안전함을 보장)
            !Array.isArray(response.data) && // 배열이 아닌지 확인 (선택적)
            'accessToken' in response.data
        ) {
            // response.data를 { accessToken: string } 타입으로 단언하고 저장
            const responseDataWithToken = response.data as { accessToken: string };
            localStorage.setItem('accessToken', responseDataWithToken.accessToken);
        }
        return response;
    });
}

/**
 * 내 정보 조회
 * GET /api/auth/me
 * request 함수에서 토큰을 자동 삽입하므로, 수동 삽입 로직 제거
 */
export function getMyInfo(): Promise<ApiResponse<User>> {
    return request(`/api/auth/me`, {
        method: "GET",
    });
}

/* =========================================================
 * 회원가입 API (FormData)
 * ========================================================= */

/**
 * 회원가입
 * POST /api/auth/signup
 */
export async function signup(data: any, photos?: File[]): Promise<ApiResponse> {
    const formData = new FormData();

    // JSON 파트
    formData.append(
        "data",
        new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    // 파일 파트: 회원가입 API가 'profileImage' 키를 기대하므로 변경
    if (photos?.length) {
        photos.forEach((file) => {
            formData.append("profileImage", file);
        });
    }

    return request(`/api/auth/signup`, {
        method: "POST",
        body: formData,
    });
}