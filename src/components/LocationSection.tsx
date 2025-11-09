import { useState, useEffect } from "react";
import MapSelector from "./MapSelector";
import DualMapSelector from "./DualMapSelector";

declare global {
  interface Window {
    endMapInstance?: any;
    endMarkerRef?: any;
    endMapReady?: any;
  }
}


interface RegionCoords {
  [key: string]: { [key: string]: { lat: number; lng: number } };
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
  }) => void;
}

// ✅ 전국 17개 시·도 및 주요 시군구 중심 좌표
const regionCenters: RegionCoords = {
  서울특별시: {
    종로구: { lat: 37.573050, lng: 126.979189 },
    중구: { lat: 37.563600, lng: 126.997600 },
    용산구: { lat: 37.532600, lng: 126.990500 },
    성동구: { lat: 37.563300, lng: 127.036400 },
    광진구: { lat: 37.538500, lng: 127.082200 },
    동대문구: { lat: 37.574400, lng: 127.039500 },
    중랑구: { lat: 37.606500, lng: 127.092700 },
    성북구: { lat: 37.589400, lng: 127.016700 },
    강북구: { lat: 37.639800, lng: 127.025500 },
    도봉구: { lat: 37.668800, lng: 127.047400 },
    노원구: { lat: 37.654200, lng: 127.056800 },
    은평구: { lat: 37.602700, lng: 126.929100 },
    서대문구: { lat: 37.576600, lng: 126.938900 },
    마포구: { lat: 37.566500, lng: 126.901800 },
    양천구: { lat: 37.516900, lng: 126.866400 },
    강서구: { lat: 37.550900, lng: 126.849500 },
    구로구: { lat: 37.495500, lng: 126.887700 },
    금천구: { lat: 37.456800, lng: 126.895600 },
    영등포구: { lat: 37.526400, lng: 126.896300 },
    동작구: { lat: 37.512400, lng: 126.939200 },
    관악구: { lat: 37.478400, lng: 126.951600 },
    서초구: { lat: 37.483600, lng: 127.032700 },
    강남구: { lat: 37.517200, lng: 127.047300 },
    송파구: { lat: 37.514600, lng: 127.105800 },
    강동구: { lat: 37.530200, lng: 127.123800 },
  },
  부산광역시: {
    중구: { lat: 35.106800, lng: 129.032300 },
    서구: { lat: 35.097900, lng: 129.024500 },
    동구: { lat: 35.129600, lng: 129.045000 },
    영도구: { lat: 35.091200, lng: 129.068000 },
    부산진구: { lat: 35.162300, lng: 129.053000 },
    동래구: { lat: 35.204800, lng: 129.083300 },
    남구: { lat: 35.136600, lng: 129.084700 },
    북구: { lat: 35.197200, lng: 128.990400 },
    해운대구: { lat: 35.163200, lng: 129.163500 },
    사하구: { lat: 35.104600, lng: 128.974700 },
    금정구: { lat: 35.243400, lng: 129.092700 },
    강서구: { lat: 35.212300, lng: 128.980500 },
    연제구: { lat: 35.176300, lng: 129.081500 },
    수영구: { lat: 35.142800, lng: 129.113000 },
    사상구: { lat: 35.152900, lng: 128.991600 },
  },
  대구광역시: {
    중구: { lat: 35.871400, lng: 128.601400 },
    동구: { lat: 35.886700, lng: 128.635800 },
    서구: { lat: 35.871100, lng: 128.559100 },
    남구: { lat: 35.846700, lng: 128.597400 },
    북구: { lat: 35.885100, lng: 128.582800 },
    수성구: { lat: 35.858100, lng: 128.630900 },
    달서구: { lat: 35.829400, lng: 128.532600 },
    달성군: { lat: 35.774300, lng: 128.431000 },
  },
  인천광역시: {
    중구: { lat: 37.474400, lng: 126.621400 },
    동구: { lat: 37.483700, lng: 126.643000 },
    미추홀구: { lat: 37.463400, lng: 126.650000 },
    연수구: { lat: 37.410400, lng: 126.678800 },
    남동구: { lat: 37.447100, lng: 126.731000 },
    부평구: { lat: 37.506400, lng: 126.721400 },
    계양구: { lat: 37.538400, lng: 126.737100 },
    서구: { lat: 37.545400, lng: 126.676400 },
  },
  광주광역시: {
    동구: { lat: 35.146100, lng: 126.923900 },
    서구: { lat: 35.152300, lng: 126.891000 },
    남구: { lat: 35.133900, lng: 126.902000 },
    북구: { lat: 35.174000, lng: 126.911300 },
    광산구: { lat: 35.139000, lng: 126.793000 },
  },
  대전광역시: {
    동구: { lat: 36.328900, lng: 127.454500 },
    중구: { lat: 36.325400, lng: 127.421700 },
    서구: { lat: 36.355000, lng: 127.384800 },
    유성구: { lat: 36.362400, lng: 127.356000 },
    대덕구: { lat: 36.373500, lng: 127.417800 },
  },
  울산광역시: {
    중구: { lat: 35.568500, lng: 129.332700 },
    남구: { lat: 35.543300, lng: 129.330600 },
    동구: { lat: 35.506300, lng: 129.431000 },
    북구: { lat: 35.582000, lng: 129.361100 },
    울주군: { lat: 35.522400, lng: 129.242000 },
  },
  세종특별자치시: {
    세종시: { lat: 36.480000, lng: 127.289000 },
  },
  경기도: {
    수원시: { lat: 37.263600, lng: 127.028600 },
    성남시: { lat: 37.420000, lng: 127.126500 },
    의정부시: { lat: 37.738100, lng: 127.033700 },
    안양시: { lat: 37.394300, lng: 126.956800 },
    부천시: { lat: 37.503500, lng: 126.766000 },
    광명시: { lat: 37.478400, lng: 126.864300 },
    평택시: { lat: 36.992200, lng: 127.112000 },
    동두천시: { lat: 37.903800, lng: 127.060400 },
    안산시: { lat: 37.321900, lng: 126.830900 },
    고양시: { lat: 37.658400, lng: 126.832000 },
    남양주시: { lat: 37.636000, lng: 127.216400 },
  },
  강원특별자치도: {
    춘천시: { lat: 37.881400, lng: 127.729800 },
    원주시: { lat: 37.342300, lng: 127.920200 },
    강릉시: { lat: 37.751900, lng: 128.876100 },
    동해시: { lat: 37.524400, lng: 129.114000 },
    속초시: { lat: 38.207000, lng: 128.591000 },
  },
  충청북도: {
    청주시: { lat: 36.642400, lng: 127.489000 },
    충주시: { lat: 36.991000, lng: 127.926000 },
    제천시: { lat: 37.129500, lng: 128.190000 },
  },
  충청남도: {
    천안시: { lat: 36.815000, lng: 127.113900 },
    공주시: { lat: 36.446700, lng: 127.119000 },
    아산시: { lat: 36.789900, lng: 127.001000 },
  },
  전라북도: {
    전주시: { lat: 35.824200, lng: 127.147000 },
    익산시: { lat: 35.948300, lng: 126.957800 },
    군산시: { lat: 35.967700, lng: 126.736400 },
  },
  전라남도: {
    목포시: { lat: 34.811800, lng: 126.392200 },
    여수시: { lat: 34.760400, lng: 127.662200 },
    순천시: { lat: 34.950700, lng: 127.487500 },
  },
  경상북도: {
    포항시: { lat: 36.019000, lng: 129.341000 },
    경주시: { lat: 35.856100, lng: 129.224700 },
    구미시: { lat: 36.119500, lng: 128.344500 },
  },
  경상남도: {
    창원시: { lat: 35.227000, lng: 128.681000 },
    진주시: { lat: 35.179500, lng: 128.107600 },
    김해시: { lat: 35.228500, lng: 128.889400 },
  },
  제주특별자치도: {
    제주시: { lat: 33.499600, lng: 126.531200 },
    서귀포시: { lat: 33.253000, lng: 126.560000 },
  },
};

const LocationSection = ({ onChange }: LocationSectionProps) => {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");

  const [startAddr, setStartAddr] = useState("");
  const [endAddr, setEndAddr] = useState("");
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);
  const [endPos, setEndPos] = useState<{ lat: number; lng: number } | null>(null);

  const [locked, setLocked] = useState(false);
  const [hasEditedEndMap, setHasEditedEndMap] = useState(false);

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
      <h3 className="text-[22px] font-semibold mb-4">활동 위치</h3>

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
    console.log("✅ 백엔드로 보낼 데이터:", data);
    // 🔥 이걸 추가해야 WritePage에 값이 전달됨!
    onChange?.({
      startAddress: data.startAddress,
      startLat: data.startLat,
      startLng: data.startLng,
      endAddress: data.endAddress,
      endLat: data.endLat,
      endLng: data.endLng,
      regionSido: sido,
      regionSigungu: sigungu,});
    // 여기에 axios.post("/api/location", data) 같은 코드 넣으면 됨
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
