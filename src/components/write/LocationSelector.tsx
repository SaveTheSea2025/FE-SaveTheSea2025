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

    // WritePage용 확장 필드
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;

    regionSido: string;
    regionSigungu: string;
  }) => void;
}



const LocationSection = ({ onChange }: LocationSectionProps) => {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");

  const [startAddr] = useState("");
  const [endAddr, setEndAddr] = useState("");
  const [startPos] = useState<{ lat: number; lng: number } | null>(null);
  const [endPos, setEndPos] = useState<{ lat: number; lng: number } | null>(null);

  const [locked, setLocked] = useState(false);
  const [hasEditedEndMap] = useState(false);

  const regionCenter =
    sido && sigungu && regionCenters[sido]?.[sigungu]
      ? regionCenters[sido][sigungu]
      : null;

  // ✅ 출발/종료 정보 부모로 전달
  useEffect(() => {
    if (startAddr && endAddr && startPos && endPos) {
      onChange?.({
        startAddress: startAddr,
        startLat: startPos.lat,
        startLng: startPos.lng,
        endAddress: endAddr,
        endLat: endPos.lat,
        endLng: endPos.lng,

        // WritePage가 실제로 필요로 하는 필드
        startLatitude: startPos.lat,
        startLongitude: startPos.lng,
        endLatitude: endPos.lat,
        endLongitude: endPos.lng,

        regionSido: sido,
        regionSigungu: sigungu,
      });

    }
  }, [startAddr, endAddr, startPos, endPos, sido, sigungu, onChange]);

  // ✅ 출발지 변경 시 종료지도 위치 자동 이동 (단, 종료지도 직접 수정 전까지만)
  // ✅ 출발지 변경 시 종료지도 위치 자동 이동 (단, 종료지도 직접 수정 전까지만)
  // ✅ 출발지 변경 시 종료지도 위치 자동 이동
  useEffect(() => {
    if (startPos && !hasEditedEndMap) {
      const kakao = (window as any).kakao;

      // ✅ offset 계산
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
          console.log("✅ 도착지도 offset 이동 완료!");

          // ✅ 주소도 자동 업데이트 (없을 경우 대비)
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
      <h3 className="text-lg font-semibold mb-4">활동 위치</h3>

      {/* STEP 1 */}
      <p className="text-[#0071CE] font-semibold mb-2">
        STEP 1 <span className="text-black font-normal">지역 선택</span>
      </p>

      <table className="w-full border-collapse border-t border-b border-gray-300 text-sm mb-6">
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

      {/* STEP 2 */}
      <p className="text-[#0071CE] font-semibold mb-2">
        STEP 2 <span className="text-black font-normal">출발·종료지점 선택</span>
      </p>

      <div className="space-y-6 relative">
        {/* 출발지 */}
        <div className="relative">
          <DualMapSelector
            regionCenter={regionCenter}
            onChange={(data) => {
              console.log("🟩 백엔드로 보낼 데이터:", data);
              const kakao = (window as any).kakao;
              const geocoder = new kakao.maps.services.Geocoder();

              // 도착 주소 자동 채움
              if (!data.endAddress && data.endLat && data.endLng) {
                geocoder.coord2Address(data.endLng, data.endLat, (result: any, status: string) => {
                  if (status === kakao.maps.services.Status.OK && result[0]) {
                    const addr = result[0].address.address_name;

                    onChange?.({
                      ...data,
                      endAddress: addr,
                      regionSido: sido,
                      regionSigungu: sigungu,

                      // ⭐ WritePage에 필요한 필드 추가
                      startLatitude: data.startLat,
                      startLongitude: data.startLng,
                      endLatitude: data.endLat,
                      endLongitude: data.endLng,
                    });
                  }
                });
              }
              else {
                onChange?.({
                  ...data,
                  regionSido: sido,
                  regionSigungu: sigungu,

                  // ⭐ WritePage에 필요한 필드 추가
                  startLatitude: data.startLat,
                  startLongitude: data.startLng,
                  endLatitude: data.endLat,
                  endLongitude: data.endLng,
                });
              }
            }}
          />





          {/* 지도 잠금 오버레이 (버튼 제외) */}
          {locked && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] cursor-not-allowed z-10 rounded-md pointer-events-auto"></div>
          )}
        </div>

        {/* 종료지 */}


        {/* ✅ 안내문구 + 완료/수정 버튼 (맨 아래로 이동) */}
        <div className="flex items-center justify-end mt-4 gap-3">
          <p className="text-sm text-gray-500 mr-auto ml-1">
            지도 선택을 다 하셨으면{" "}
            <span className="font-semibold text-[#0369A1]">완료</span> 버튼을 눌러주세요.
          </p>
          {!locked ? (
            <button
              className="bg-[#0369A1] hover:bg-[#025985] text-white text-sm px-4 py-2 rounded-md shadow-sm"
              onClick={() => setLocked(true)}
            >
              완료
            </button>
          ) : (
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-2 rounded-md shadow-sm"
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