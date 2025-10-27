import React, { useEffect, useState } from "react";

const KakaoMapSection: React.FC = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    // @ts-ignore
    const kakao = window.kakao;
    const container = document.getElementById("kakaoMap");
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.9780), // 기본: 서울
      level: 5,
    };
    const mapInstance = new kakao.maps.Map(container, options);
    setMap(mapInstance);
  }, []);

  const searchAddress = (address: string, label: string) => {
    if (!address || !map) return;
    // @ts-ignore
    const kakao = window.kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 마커 생성
        const marker = new kakao.maps.Marker({
          map,
          position: coords,
        });

        // 인포윈도우
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${label}</div>`,
        });
        infowindow.open(map, marker);

        // 기존 마커 삭제하고 새로 추가
        setMarkers((prev) => {
          prev.forEach((m) => m.setMap(null));
          return [marker];
        });

        // 지도 중심 이동
        map.setCenter(coords);
      }
    });
  };

  return (
    <div className="mt-4">
      {/* 출발지점 */}
      <div className="border border-gray-300 border-l-0 border-r-0 text-sm mb-6">
        <div className="flex border-b border-gray-300">
          <div className="w-1/5 bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
            출발지점
          </div>
          <div className="w-4/5 px-4 py-3 bg-[#f7f8fa] flex gap-2">
            <input
              type="text"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="출발지를 입력해주세요."
              className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              onClick={() => searchAddress(start, "출발지점")}
              className="bg-sky-600 text-white px-4 py-1.5 rounded hover:bg-sky-700"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 지도 영역 */}
      <div
        id="kakaoMap"
        className="w-full h-[280px] bg-gray-200 mb-8 rounded-md"
      >
        지도 불러오는 중...
      </div>

      {/* 종료지점 */}
      <div className="border border-gray-300 border-l-0 border-r-0 text-sm mb-2">
        <div className="flex border-b border-gray-300">
          <div className="w-1/5 bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
            종료지점
          </div>
          <div className="w-4/5 px-4 py-3 bg-[#f7f8fa] flex gap-2">
            <input
              type="text"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              placeholder="종료지점을 입력해주세요."
              className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              onClick={() => searchAddress(end, "종료지점")}
              className="bg-sky-600 text-white px-4 py-1.5 rounded hover:bg-sky-700"
            >
              검색
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KakaoMapSection;
