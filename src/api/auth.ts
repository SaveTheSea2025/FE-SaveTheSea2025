// src/api/auth.ts (최종 수정본)

/**
 * =========================================================
 * Auth API Client
 * =========================================================
 */

/**
 * User 정보 타입 정의 (AuthContext와 공유)
 */
export interface User {
    userId: number;
    email: string;
    userName: string;
    memberType: 'PERSONAL' | 'GROUP';
    region: string;
    profileUrl: string | null;
}

/**
 * API 응답 표준 형식
 */
export interface ApiResponse<T = any> {
    errorMessage: string;
    code: number;
    message: string;
    data: T | null;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 공통 Fetch Wrapper (제네릭 적용)
 * AccessToken 자동 삽입 로직을 포함합니다.
 *
 * @param url 요청 URL
 * @param options fetch 옵션
 * @returns {Promise<ApiResponse<T>>} API 응답 객체
 */
// src/api/auth.ts (request 함수 - Content-Type 오류 최종 해결)

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const isFormData = options.body instanceof FormData;
    const token = localStorage.getItem("accessToken");

    // 1. 기존 헤더를 표준 Record<string, string>으로 변환
    // options.headers가 Headers 인스턴스, Array, 또는 Record일 수 있으므로 안전하게 처리
    const customHeaders = (options.headers || {}) as Record<string, string>;

    // 2. 최종 헤더 객체 설정 (Authorization 추가)
    const finalHeaders: Record<string, string> = {
        ...customHeaders,
    };

    // 3. Authorization 헤더 설정
    if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
    }

    // 4. FormData 요청 시 Content-Type 헤더를 강제 제거 (헤더 충돌 방지 핵심)
    // 브라우저가 boundary를 포함한 'multipart/form-data' 헤더를 생성하도록 유도합니다.
    if (isFormData && 'Content-Type' in finalHeaders) {
        delete finalHeaders['Content-Type'];
    }

    // 5. JSON 요청이면서 Content-Type이 없는 경우 기본값 추가
    if (!isFormData && !('Content-Type' in finalHeaders)) {
        finalHeaders["Content-Type"] = "application/json";
    }

    // 6. 🔥 핵심 수정: fetch를 호출할 때 options 객체를 새로 복사 및 재구성합니다.
    // 원본 options 객체의 불변성을 유지하고 수정된 헤더를 적용합니다.
    const finalOptions: RequestInit = {
        ...options, // 기존 옵션 복사 (body 포함)
        headers: finalHeaders, // 수정된 최종 헤더 적용
    };

    const res = await fetch(`${BASE_URL}${url}`, finalOptions); // 새로운 finalOptions 객체 사용

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
 * 이메일 인증 코드를 발송합니다.
 * POST /api/auth/send-code
 */
export function sendEmailCode(email: string): Promise<ApiResponse> {
    return request(`/api/auth/send-code`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

/**
 * 이메일 인증 코드를 검증합니다.
 * POST /api/auth/verify-code
 */
export function verifyEmailCode(email: string, code: string): Promise<ApiResponse> {
    return request(`/api/auth/verify-code`, {
        method: "POST",
        body: JSON.stringify({ email, code }),
    });
}

/* =========================================================
 * 로그인 API
 * ========================================================= */

/**
 * 로그인
 * POST /api/auth/login
 * 응답 데이터에 User 정보 또는 accessToken이 포함
 */
export function login(email: string, password: string, memberType: string): Promise<ApiResponse<User | { accessToken?: string }>> {
    return request(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
            memberType
        }),
    }).then((response) => {
        // 응답 데이터에 accessToken이 포함되어 있을 경우 로컬 스토리지에 저장
        if (
            response.code === 0 &&
            response.data &&
            typeof response.data === 'object' &&
            !Array.isArray(response.data) &&
            'accessToken' in response.data
        ) {
            const responseDataWithToken = response.data as { accessToken: string };
            localStorage.setItem('accessToken', responseDataWithToken.accessToken);
        }
        return response;
    });
}

/**
 * 내 정보 조회
 * GET /api/auth/me
 */
export function getMyInfo(): Promise<ApiResponse<User>> {
    return request(`/api/auth/me`, {
        method: "GET",
    });
}


// src/api/auth.ts

/* =========================================================
 * 회원가입 API (FormData 기반 파일 업로드 포함)
 * ========================================================= */

// 💡 매개변수 타입을 File[] (File 배열)로 수정합니다.
export async function signup(data: any, photos?: File[]): Promise<ApiResponse> {
    const formData = new FormData();

    // JSON 데이터 추가 (이하 동일)
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));

    // ✅ File 배열을 순회하며 'photos' 필드에 추가합니다.
    if (photos && photos.length > 0) {
        photos.forEach((file) => {
            formData.append("profileImage", file, file.name);
        });
    }

    return request(`/api/auth/signup`, {
        method: "POST",
        body: formData,
    });
}