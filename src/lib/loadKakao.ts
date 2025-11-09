// src/lib/loadKakao.ts
let kakaoLoadPromise: Promise<void> | null = null;

export function loadKakao(): Promise<void> {
  if (typeof window !== "undefined" && window.kakao?.maps) return Promise.resolve();
  if (kakaoLoadPromise) return kakaoLoadPromise;

  const appkey = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;
  console.log("[Kakao] appkey(head) =", appkey ? appkey.slice(0,6) + "…" : "undefined");

  kakaoLoadPromise = new Promise<void>((resolve, reject) => {
    try {
      const script = document.createElement("script");
      const qp = new URLSearchParams({
        appkey: appkey ?? "",
        autoload: "false",
        libraries: "services,clusterer",
        ts: String(Date.now()), // cache bust
      });
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${qp.toString()}`;
      script.async = true;
      script.onload = () => {
        if (!window.kakao?.maps) return reject(new Error("Kakao maps 객체 없음"));
        window.kakao.maps.load(() => {
          console.log("[Kakao] SDK loaded");
          resolve();
        });
      };
      script.onerror = (e) => {
        console.error("[Kakao] SDK 스크립트 로드 오류", e, "src=", script.src);
        reject(new Error("Kakao SDK script load error"));
      };
      document.head.appendChild(script);
    } catch (e) {
      reject(e as Error);
    }
  });

    // loadKakao.ts (아래 패치에 포함)
console.log("[Kakao] appkey(head) =", appkey ? appkey.slice(0,6) + "…" : "undefined");
  return kakaoLoadPromise;
}


