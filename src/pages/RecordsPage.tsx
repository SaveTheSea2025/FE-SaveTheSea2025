/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import RecordCard from "../components/RecordCard";
import { SlidersHorizontal } from "lucide-react";

// ✅ Kakao 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}


const RecordsPage: React.FC = () => {
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ✅ Kakao Map 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initMap);
        return;
      }

      // 중복 스크립트 제거
      const existingScript = document.getElementById("kakao-map-script");
      if (existingScript) existingScript.remove();

      // 새 스크립트 추가
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    };

    const initMap = () => {
      const container = document.getElementById("map");
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 13,
      };

      const map = new window.kakao.maps.Map(container, options);

      // 테스트용 마커
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(37.5665, 126.978),
      });
    };

    loadKakaoMap();
  }, [kakaoKey]);

  // ✅ 더미 데이터
  const dummyData = [
    {
      id: 1,
      title: "바다살리기네트워크",
      date: "2025.06.03 / 4시간",
      location: "강릉 송정해수욕장",
      people: 21,
      weight: "112.51kg",
      mainImage: "/images/cleanup1.jpg",
      logoImage: "/images/team1-logo.png",
    },
    {
      id: 2,
      title: "푸른바다클럽",
      date: "2025.05.20 / 3시간",
      location: "부산 송도해변",
      people: 15,
      weight: "86.4kg",
      mainImage: "/images/cleanup2.jpg",
      logoImage: "/images/team2-logo.png",
    },
    {
      id: 3,
      title: "Ocean Saver",
      date: "2025.05.12 / 5시간",
      location: "제주 협재해수욕장",
      people: 32,
      weight: "148.7kg",
      mainImage: "/images/cleanup3.jpg",
      logoImage: "/images/team3-logo.png",
    },
    {
      id: 4,
      title: "클린웨이브",
      date: "2025.04.27 / 3시간",
      location: "속초 해변가",
      people: 18,
      weight: "97.3kg",
      mainImage: "/images/cleanup4.jpg",
      logoImage: "/images/team4-logo.png",
    },
    {
      id: 5,
      title: "세이브씨(SaveSea)",
      date: "2025.04.15 / 2시간",
      location: "여수 돌산공원",
      people: 10,
      weight: "54.2kg",
      mainImage: "/images/cleanup5.jpg",
      logoImage: "/images/team5-logo.png",
    },
  ];

  // ✅ 지역 필터링 (배열 기반, 전체 제거 버전)
  const filteredData =
    activeRegions.length === 0
      ? dummyData
      : dummyData.filter((d) =>
        activeRegions.some((region) => d.location.includes(region))
      );

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      {/* ✅ 상단 고정 헤더 */}
      <Header forceScrolled />

      <div className="flex flex-1 pt-[64px]">
        {/* ✅ 지도 */}
        <div id="map" className="flex-1" style={{ height: "calc(100vh - 64px)" }} />

        {/* ✅ 오른쪽 카드 영역 */}
        <div className="w-[400px] bg-white flex flex-col border-l border-gray-200">
          {/* 상단 필터 바 */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-[#FDFDFB] mt-3">
            {/* 필터 버튼 */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1 text-sky-800 border border-sky-800 px-3 py-[6px] rounded-full text-sm font-medium hover:bg-sky-50 transition"
            >
              <SlidersHorizontal size={16} />
              필터
            </button>

            {/* 구분선 */}
            <div className="w-px h-5 bg-gray-300" />

            {/* 지역 버튼 */}
            <div className="flex gap-2">
              {["동해", "서해", "남해", "제주"].map((region) => {
                const isActive = activeRegions.includes(region);

                return (
                  <button
                    key={region}
                    onClick={() => {
                      setActiveRegions((prev) =>
                        isActive
                          ? prev.filter((r) => r !== region) // 이미 있으면 제거
                          : [...prev, region] // 없으면 추가
                      );
                    }}
                    className={`px-3 py-[6px] rounded-full text-sm font-medium border transition ${isActive
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white text-sky-800 border-gray-300 hover:bg-sky-50"
                      }`}
                  >
                    {region}
                  </button>
                );
              })}
            </div>


          </div>

          {/* 카드 리스트 */}
          <div className="overflow-y-auto p-4 space-y-4">
            {filteredData.map((d) => (
              <RecordCard
                key={d.id}
                title={d.title}
                date={d.date}
                location={d.location}
                people={d.people}
                weight={d.weight}
                mainImage={d.mainImage}
                logoImage={d.logoImage}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ✅ 필터 모달 */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg relative">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold text-center text-sky-700 mb-4">
              필터
            </h2>

            {/* 기간 */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">기간</p>
              <div className="flex items-center gap-2">
                <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
                  <option>분기</option>
                  <option>월간</option>
                  <option>연간</option>
                </select>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1 text-sm text-gray-600"
                />
                <span>~</span>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1 text-sm text-gray-600"
                />
              </div>
            </div>

            {/* 활동명 */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">활동명</p>
              <div className="flex items-center gap-2">
                <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
                  <option>단체</option>
                  <option>개인</option>
                </select>
                <input
                  type="text"
                  placeholder="단체명을 입력해주세요."
                  className="flex-1 border rounded-md px-2 py-1 text-sm text-gray-600"
                />
              </div>
            </div>

            {/* 위치 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">위치</p>
              <textarea
                className="w-full border rounded-md px-2 py-1 text-sm text-gray-600 min-h-[80px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
