/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import DualMapSelector from "./DualMapSelector";
import { regionCenters } from "../../data/regionCenters";

declare global {
  interface Window {
    endMapInstance?: any;
    endMarkerRef?: any;
    endMapReady?: any;
  }
}

interface LocationSectionProps {
  onChange?: (data: {
    startAddress: string;
    startLat: number;
    startLng: number;
    endAddress: string;
    endLat: number;
    endLng: number;
    regionSido: string;
    regionSigungu: string;
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;
  }) => void;
}

const LocationSection = ({ onChange }: LocationSectionProps) => {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");

  const [startAddr, setStartAddr] = useState("");
  const [endAddr, setEndAddr] = useState("");
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);
  const [endPos, setEndPos] = useState<{ lat: number; lng: number } | null>(null);

  const [locked, setLocked] = useState(false);
  const [hasEditedEndMap] = useState(false);

  // 🔥 사용자가 직접 드롭다운을 클릭했는지 추적
  const [isUserSelecting, setIsUserSelecting] = useState(false);

  const regionCenter =
    sido && sigungu && regionCenters[sido]?.[sigungu]
      ? regionCenters[sido][sigungu]
      : null;

  // 🔥 주소에서 시/도, 시/군/구 추출 함수
  const extractRegionFromAddress = (address: string): { sido: string; sigungu: string } => {
    let extractedSido = "";
    let extractedSigungu = "";
  
    const cleanAddress = address.replace("해상", "").trim();
  
    // 🔥 특별시/광역시 간단 매칭 먼저 체크
    if (cleanAddress.includes("서울")) extractedSido = "서울특별시";
    else if (cleanAddress.includes("부산")) extractedSido = "부산광역시";
    else if (cleanAddress.includes("대구")) extractedSido = "대구광역시";
    else if (cleanAddress.includes("인천")) extractedSido = "인천광역시";
    else if (cleanAddress.includes("광주")) extractedSido = "광주광역시";
    else if (cleanAddress.includes("대전")) extractedSido = "대전광역시";
    else if (cleanAddress.includes("울산")) extractedSido = "울산광역시";
    else if (cleanAddress.includes("세종")) extractedSido = "세종특별자치시";
    else {
      // 나머지 도(道) 체크
      const sidoList = Object.keys(regionCenters);
      for (const s of sidoList) {
        if (cleanAddress.includes(s)) {
          extractedSido = s;
          break;
        }
        if (s === "경기도" && cleanAddress.includes("경기")) {
          extractedSido = s;
          break;
        }
        if (s === "강원특별자치도" && (cleanAddress.includes("강원") || cleanAddress.includes("강원도"))) {
          extractedSido = s;
          break;
        }
        if (s === "충청북도" && (cleanAddress.includes("충북") || cleanAddress.includes("충청북"))) {
          extractedSido = s;
          break;
        }
        if (s === "충청남도" && (cleanAddress.includes("충남") || cleanAddress.includes("충청남"))) {
          extractedSido = s;
          break;
        }
        if (s === "전북특별자치도" && (cleanAddress.includes("전북") || cleanAddress.includes("전라북"))) {
          extractedSido = s;
          break;
        }
        if (s === "전라남도" && (cleanAddress.includes("전남") || cleanAddress.includes("전라남"))) {
          extractedSido = s;
          break;
        }
        if (s === "경상북도" && (cleanAddress.includes("경북") || cleanAddress.includes("경상북"))) {
          extractedSido = s;
          break;
        }
        if (s === "경상남도" && (cleanAddress.includes("경남") || cleanAddress.includes("경상남"))) {
          extractedSido = s;
          break;
        }
        if (s === "제주특별자치도" && cleanAddress.includes("제주")) {
          extractedSido = s;
          break;
        }
      }
    }
  
    // 시/군/구 추출
    if (extractedSido && regionCenters[extractedSido]) {
      const sigunguList = Object.keys(regionCenters[extractedSido]);
      for (const sg of sigunguList) {
        if (cleanAddress.includes(sg)) {
          extractedSigungu = sg;
          break;
        }
      }
    }
  
    console.log("🔍 주소 파싱:", cleanAddress, "→ sido:", extractedSido, "sigungu:", extractedSigungu);
    
    return { sido: extractedSido, sigungu: extractedSigungu };
  };

  // 🔥 이 코드를 107줄 다음에 추가!
// 🔥 startAddr이 변경될 때마다 실행
useEffect(() => {
  if (startAddr) {
    const extracted = extractRegionFromAddress(startAddr);
    console.log("🔄 startAddr 변경:", startAddr);
    console.log("🔍 추출 결과:", extracted);
    
    if (extracted.sido && extracted.sigungu) {
      console.log("✅ 드롭다운 업데이트:", extracted.sido, extracted.sigungu);
      setSido(extracted.sido);
      setSigungu(extracted.sigungu);
    } else {
      console.log("⚠️ 추출 실패:", extracted);
    }
  }
}, [startAddr]);

  useEffect(() => {
    if (startAddr && endAddr && startPos && endPos) {
      onChange?.({
        startAddress: startAddr,
        startLat: startPos.lat,
        startLng: startPos.lng,
        endAddress: endAddr,
        endLat: endPos.lat,
        endLng: endPos.lng,
        regionSido: sido,
        regionSigungu: sigungu,
        startLatitude: startPos.lat,
        startLongitude: startPos.lng,
        endLatitude: endPos.lat,
        endLongitude: endPos.lng,
      });
    }
  }, [startAddr, endAddr, startPos, endPos, sido, sigungu, onChange]);

  useEffect(() => {
    if (startPos && !hasEditedEndMap) {
      const kakao = (window as any).kakao;

      const offsetLat = 0.0005;
      const offsetLng = 0.0007;

      const newEndLat = startPos.lat - offsetLat;
      const newEndLng = startPos.lng + offsetLng;

      setEndPos({ lat: newEndLat, lng: newEndLng });

      const moveEndMap = () => {
        if (window.endMapInstance && window.endMarkerRef) {
          const moveLatLng = new kakao.maps.LatLng(newEndLat, newEndLng);
          window.endMarkerRef.setPosition(moveLatLng);
          window.endMapInstance.setCenter(moveLatLng);

          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(newEndLng, newEndLat, (result: any, status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const addr = result[0].address.address_name;
              setEndAddr(addr);
            }
          });
        }
      };

      if (window.endMapReady) {
        moveEndMap();
      } else {
        const checkTilesLoaded = setInterval(() => {
          if (window.endMapReady) {
            moveEndMap();
            clearInterval(checkTilesLoaded);
          }
        }, 300);
      }
    }
  }, [startPos, hasEditedEndMap]);

  return (
    <section className="mb-10 relative">
      <h3 className="text-base md:text-lg font-semibold mb-4">활동 위치</h3>

      <p className="text-[#0071CE] font-semibold mb-3 text-sm md:text-base">
        STEP 1 <span className="text-black font-normal">지역 선택</span>
      </p>

      {/* 데스크톱 버전 */}
      <table className="hidden md:table w-full border-collapse border-t border-b border-gray-300 text-sm mb-6">
        <tbody>
          <tr>
            <th className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-12 py-3 text-left font-medium whitespace-nowrap align-middle">
              시/도 <span className="text-red-500">*</span>
            </th>
            <td className="px-4 py-3 w-1/2">
              <select
                value={sido}
                onChange={(e) => {
                  // 🔥 사용자가 직접 선택
                  setIsUserSelecting(true);
                  setSido(e.target.value);
                  setSigungu("");
                  setTimeout(() => {
                    setIsUserSelecting(false);
                  }, 500);
                }}
                disabled={locked}
                className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
              >
                <option value="">선택</option>
                {Object.keys(regionCenters).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </td>

            <th className="w-32 bg-[#f5f6f8] border-r border-l border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap align-middle">
              시·군·구 <span className="text-red-500">*</span>
            </th>
            <td className="px-4 py-3 w-1/2">
              <select
                value={sigungu}
                onChange={(e) => {
                  // 🔥 사용자가 직접 선택
                  setIsUserSelecting(true);
                  setSigungu(e.target.value);
                  setTimeout(() => {
                    setIsUserSelecting(false);
                  }, 500);
                }}
                disabled={!sido || locked}
                className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
              >
                <option value="">선택</option>
                {sido &&
                  Object.keys(regionCenters[sido]).map((r) => (
                    <option key={r}>{r}</option>
                  ))}
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 모바일 버전 */}
      <div className="md:hidden mb-6">
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-300">
          <div className="grid grid-cols-2">
            <div className="p-4 border-r border-gray-300">
              <label className="block text-xs text-gray-600 mb-2">
                시/도 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={sido}
                  onChange={(e) => {
                    setIsUserSelecting(true);
                    setSido(e.target.value);
                    setSigungu("");
                    setTimeout(() => {
                      setIsUserSelecting(false);
                    }, 500);
                  }}
                  disabled={locked}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 pr-8 appearance-none"
                >
                  <option value="">선택</option>
                  {Object.keys(regionCenters).map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4">
              <label className="block text-xs text-gray-600 mb-2">
                시·군·구 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={sigungu}
                  onChange={(e) => {
                    setIsUserSelecting(true);
                    setSigungu(e.target.value);
                    setTimeout(() => {
                      setIsUserSelecting(false);
                    }, 500);
                  }}
                  disabled={!sido || locked}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 pr-8 appearance-none"
                >
                  <option value="">선택</option>
                  {sido &&
                    Object.keys(regionCenters[sido]).map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[#0071CE] font-semibold mb-3 text-sm md:text-base">
        STEP 2 <span className="text-black font-normal">출발·종료지점 선택</span>
      </p>

      <div className="space-y-6 relative">
        <div className="relative">
          <DualMapSelector
            regionCenter={regionCenter}
            isUserSelecting={isUserSelecting}
            onChange={(data) => {
              console.log("📍 주소 변경:", data.startAddress, data.endAddress);

              setStartAddr(data.startAddress);
              setStartPos({ lat: data.startLat, lng: data.startLng });
              setEndAddr(data.endAddress);
              setEndPos({ lat: data.endLat, lng: data.endLng });

              // 🔥 출발 주소에서 지역 추출 → 드롭다운 자동 업데이트
              if (data.startAddress) {
                const extracted = extractRegionFromAddress(data.startAddress);

                
                
                if (extracted.sido && extracted.sigungu) {
                  // 자동 업데이트 (지도 이동 없음)
                  setSido(extracted.sido);
                  setSigungu(extracted.sigungu);
                }
              }

              const kakao = (window as any).kakao;
              const geocoder = new kakao.maps.services.Geocoder();

              if (!data.endAddress && data.endLat && data.endLng) {
                geocoder.coord2Address(data.endLng, data.endLat, (result: any, status: string) => {
                  if (status === kakao.maps.services.Status.OK && result[0]) {
                    const addr = result[0].address.address_name;
                    setEndAddr(addr);
                    
                    const currentExtracted = data.startAddress ? extractRegionFromAddress(data.startAddress) : { sido: '', sigungu: '' };
                    const finalSido = currentExtracted.sido || sido;
                    const finalSigungu = currentExtracted.sigungu || sigungu;
                    
                    onChange?.({
                      startAddress: data.startAddress,
                      startLat: data.startLat,
                      startLng: data.startLng,
                      endAddress: addr,
                      endLat: data.endLat,
                      endLng: data.endLng,
                      regionSido: finalSido,
                      regionSigungu: finalSigungu,
                      startLatitude: data.startLat,
                      startLongitude: data.startLng,
                      endLatitude: data.endLat,
                      endLongitude: data.endLng,
                    });
                  }
                });
              } else {
                const currentExtracted = data.startAddress ? extractRegionFromAddress(data.startAddress) : { sido: '', sigungu: '' };
                const finalSido = currentExtracted.sido || sido;
                const finalSigungu = currentExtracted.sigungu || sigungu;
                
                onChange?.({
                  startAddress: data.startAddress,
                  startLat: data.startLat,
                  startLng: data.startLng,
                  endAddress: data.endAddress,
                  endLat: data.endLat,
                  endLng: data.endLng,
                  regionSido: finalSido,
                  regionSigungu: finalSigungu,
                  startLatitude: data.startLat,
                  startLongitude: data.startLng,
                  endLatitude: data.endLat,
                  endLongitude: data.endLng,
                });
              }
            }}
          />

          {locked && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] cursor-not-allowed z-10 rounded-md pointer-events-auto"></div>
          )}
        </div>

        <div className="flex items-center justify-end mt-4 gap-3">
          <p className="text-xs md:text-sm text-gray-500 mr-auto ml-1">
            지도 선택을 다 하셨으면{" "}
            <span className="font-semibold text-[#0369A1]">완료</span> 버튼을 눌러주세요.
          </p>
          {!locked ? (
            <button
              className="bg-[#0369A1] hover:bg-[#025985] text-white text-xs md:text-sm px-4 py-2 rounded-md shadow-sm"
              onClick={() => setLocked(true)}
            >
              완료
            </button>
          ) : (
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white text-xs md:text-sm px-4 py-2 rounded-md shadow-sm"
              onClick={() => setLocked(false)}
            >
              수정
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default LocationSection;