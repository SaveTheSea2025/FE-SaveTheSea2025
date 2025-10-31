// src/lib/loadKakaoCustom.ts
let kakaoCustomPromise: Promise<void> | null = null;

/**
 * Kakao Map SDK 로드 (커스텀 안정 버전)
 * - autoload=false 상태에서도 SDK 초기화 보장
 * - 중복 로드 방지 및 기존 스크립트 재활용
 */
export async function loadKakaoCustom(): Promise<void> {
  if (typeof window === "undefined") return;

  // 이미 로드되어 있다면 바로 resolve
  if (window.kakao?.maps) {
    return new Promise<void>((resolve) => {
      if (window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          console.log("[KakaoCustom] 이미 SDK 활성화됨 ✅");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // 이미 로딩 중이라면 기존 Promise 반환
  if (kakaoCustomPromise) return kakaoCustomPromise;

  kakaoCustomPromise = new Promise<void>((resolve, reject) => {
    try {
      const appkey = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;
      console.log("[KakaoCustom] appkey =", appkey ? appkey.slice(0, 6) + "…" : "undefined");

      // 기존 script가 있으면 중복 방지
      const existingScript = document.querySelector<HTMLScriptElement>(
        "script[src*='dapi.kakao.com/v2/maps/sdk.js']"
      );

      if (existingScript) {
        console.log("[KakaoCustom] 기존 SDK 스크립트 감지됨, 대기 중...");
        const checkReady = setInterval(() => {
          if (window.kakao?.maps?.load) {
            clearInterval(checkReady);
            window.kakao.maps.load(() => {
              console.log("[KakaoCustom] 기존 SDK 활성화 완료 ✅");
              resolve();
            });
          }
        }, 200);
        return;
      }

      // 새로운 SDK script 추가
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services,clusterer`;
      script.async = true;

      script.onload = () => {
        console.log("[KakaoCustom] SDK 스크립트 로드됨 → 초기화 중...");
        if (!window.kakao?.maps) {
          reject(new Error("❌ Kakao maps 객체 없음"));
          return;
        }

        // autoload=false → 직접 load() 호출
        window.kakao.maps.load(() => {
          console.log("[KakaoCustom] SDK 완전 초기화 완료 ✅");
          resolve();
        });
      };

      script.onerror = (e) => {
        console.error("[KakaoCustom] SDK 로드 실패 ❌", e);
        reject(new Error("Kakao SDK script load error"));
      };

      document.head.appendChild(script);
    } catch (err) {
      reject(err as Error);
    }
  });

  return kakaoCustomPromise;
}
