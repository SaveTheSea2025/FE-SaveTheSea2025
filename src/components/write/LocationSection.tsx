/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
    // ✅ WritePage에서 사용하는 필드 추가
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;
  }) => void;
}

const LocationSection = ({ onChange }: LocationSectionProps) => {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");

  const [startAddr, setStartAddr] = useState("");  // ✅ setter 추가
  const [endAddr, setEndAddr] = useState("");
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);  // ✅ setter 추가
  const [endPos, setEndPos] = useState<{ lat: number; lng: number } | null>(null);

  const [locked, setLocked] = useState(false);
  const [hasEditedEndMap] = useState(false);

  const regionCenter =
    sido && sigungu && regionCenters[sido]?.[sigungu]
      ? regionCenters[sido][sigungu]
      : null;

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
        // ✅ WritePage 필드 추가
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

      {/* STEP 1 */}
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
                  setSido(e.target.value);
                  setSigungu("");
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
                onChange={(e) => setSigungu(e.target.value)}
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
                    setSido(e.target.value);
                    setSigungu("");
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
                  onChange={(e) => setSigungu(e.target.value)}
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

      {/* STEP 2 */}
      <p className="text-[#0071CE] font-semibold mb-3 text-sm md:text-base">
        STEP 2 <span className="text-black font-normal">출발·종료지점 선택</span>
      </p>

      <div className="space-y-6 relative">
        <div className="relative">
          <DualMapSelector
            regionCenter={regionCenter}
            onChange={(data) => {
              // ✅ LocationSection 상태 업데이트
              setStartAddr(data.startAddress);
              setStartPos({ lat: data.startLat, lng: data.startLng });
              setEndAddr(data.endAddress);
              setEndPos({ lat: data.endLat, lng: data.endLng });

              const kakao = (window as any).kakao;
              const geocoder = new kakao.maps.services.Geocoder();

              if (!data.endAddress && data.endLat && data.endLng) {
                geocoder.coord2Address(data.endLng, data.endLat, (result: any, status: string) => {
                  if (status === kakao.maps.services.Status.OK && result[0]) {
                    const addr = result[0].address.address_name;
                    setEndAddr(addr);  // ✅ 상태 업데이트
                    onChange?.({
                      startAddress: data.startAddress,
                      startLat: data.startLat,
                      startLng: data.startLng,
                      endAddress: addr,
                      endLat: data.endLat,
                      endLng: data.endLng,
                      regionSido: sido,
                      regionSigungu: sigungu,
                      startLatitude: data.startLat,
                      startLongitude: data.startLng,
                      endLatitude: data.endLat,
                      endLongitude: data.endLng,
                    });
                  }
                });
              } else {
                onChange?.({
                  startAddress: data.startAddress,
                  startLat: data.startLat,
                  startLng: data.startLng,
                  endAddress: data.endAddress,
                  endLat: data.endLat,
                  endLng: data.endLng,
                  regionSido: sido,
                  regionSigungu: sigungu,
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