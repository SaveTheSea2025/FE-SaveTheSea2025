/**
 * =========================================================
 * Auth API Client
 * - 이메일 인증
 * - 로그인 / 로그아웃
 * - 회원가입 (FormData)
 * - 토큰 자동 저장
 * =========================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 공통 Fetch Wrapper
 * - BASE_URL 자동 적용
 * - accessToken 헤더 자동 저장
 * - refreshToken 쿠키 자동 포함
 *
 * @param url 요청 URL (BASE_URL 기준 상대 경로)
 * @param options fetch 옵션
 */
async function request(url: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    credentials: "include", // refreshToken 쿠키 포함
  });

  // accessToken 헤더에 담겨오면 저장
  const newAccessToken = res.headers.get("accessToken");
  if (newAccessToken) {
    localStorage.setItem("accessToken", newAccessToken);
  }

  return res.json();
}

/* =========================================================
 *  이메일 인증 API
 * ========================================================= */

/**
 * 이메일 인증 코드 발송
 * POST /api/auth/send-code
 *
 * @param email 사용자 이메일
 * @returns { code: number, message: string }
 */
export function sendEmailCode(email: string) {
  return request(`/api/auth/send-code`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * 이메일 인증 코드 검증
 * POST /api/auth/verify-code
 *
 * @param email 사용자 이메일
 * @param code 인증 코드
 */
export function verifyEmailCode(email: string, code: string) {
  return request(`/api/auth/verify-code`, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

/* =========================================================
 *  로그인 & 사용자 정보
 * ========================================================= */

/**
 * 로그인
 * POST /api/auth/login
 *
 * @param email 이메일
 * @param password 비밀번호
 * @param memberType PERSONAL | GROUP
 */
export function login(email: string, password: string, memberType: string) {
  return request(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password, memberType }),
  });
}

/**
 * 내 정보 조회
 * GET /api/auth/me
 *
 * Authorization: Bearer AccessToken
 */
export function getMyInfo() {
  const token = localStorage.getItem("accessToken");

  return request(`/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* =========================================================
 *  회원가입 API (FormData)
 * ========================================================= */

/**
 * 회원가입
 * POST /api/auth/signup
 *
 * @param data JSON 데이터 (email, password, userName, memberType, region)
 * @param photos 선택적 이미지 파일 배열
 */
export async function signup(data: any, photos?: File[]) {
  const formData = new FormData();

  // JSON 파트
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  // 파일 파트
  if (photos?.length) {
    photos.forEach((file) => {
      formData.append("photos", file);
    });
  }

  return request(`/api/auth/signup`, {
    method: "POST",
    body: formData,
  });
}
