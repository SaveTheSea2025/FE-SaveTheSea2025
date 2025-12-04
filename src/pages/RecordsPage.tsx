/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import RecordCard from "../components/RecordCard";
import RecordDetailPanel from "../components/RecordDetailPanel";
import FilterModal from "../components/FilterModal";
import { SlidersHorizontal } from "lucide-react";

declare global {
  interface Window {
    kakao: any;
  }
}

type CleanupItem = {
  id: number;
  name: string;
  groups: boolean;
  startDate: string;
  endDate: string;
  totalActivityTime: string;
  regionSido: string;
  regionSigungu: string;
  startAddress: string;
  endAddress: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  memberCount: number;
  totalWeight: number;
  thumbnail: string;
};

const RecordsPage: React.FC = () => {
  const mapRef = useRef<any>(null);
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://be-savethesea2025.onrender.com";

  const [data, setData] = useState<CleanupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CleanupItem | null>(null);
  const [visibleData, setVisibleData] = useState<CleanupItem[]>([]);
  const [filters, setFilters] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  /* ==================================
   * 🧭 백엔드 데이터 호출
   * ================================== */
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/activity-records?page=0&size=50`);
        if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);
        const json = await res.json();
        const list = json.data?.content || [];
        setData(list);
        setVisibleData(list);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [BASE_URL]);

  /* ==================================
   * 🗺️ Kakao 지도 초기화 및 표시
   * ================================== */
  useEffect(() => {
    if (loading || data.length === 0) return;

    const loadKakaoSDK = () =>
      new Promise<void>((resolve) => {
        if (window.kakao && window.kakao.maps) return resolve();
        const existing = document.getElementById("kakao-map-sdk");
        if (existing) return existing.addEventListener("load", () => resolve());
        const script = document.createElement("script");
        script.id = "kakao-map-sdk";
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services,clusterer`;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    const initMap = () => {
      const { kakao } = window;
      const container = document.getElementById("map");
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = new kakao.maps.Map(container, {
          center: new kakao.maps.LatLng(36.5, 127.8),
          level: 13,
        });
      }
      const map = mapRef.current;

      // ✅ 해역별 중심 좌표 설정
      const regionCenters: Record<string, { lat: number; lng: number }> = {
        동해: { lat: 37.228374233713296, lng: 129.15228325008 },
        서해: { lat: 36.61012468699194, lng: 126.47965910025837 },
        남해: { lat: 35.06632512126167, lng: 127.94904530228371 },
        제주: { lat: 33.361359074387686, lng: 126.53282883048968 },
      };

      if (activeRegion && regionCenters[activeRegion]) {
        const { lat, lng } = regionCenters[activeRegion];
        map.panTo(new kakao.maps.LatLng(lat, lng));
        map.setLevel(9);
      }

      /* ==================================
       * 🔥 히트맵
       * ================================== */

      // ✅ 히트맵용 커스텀 오버레이 클래스 정의
      function HeatCircle(this: any, bounds: any, color: string, opacity: number) {
        this.bounds = bounds;
        this.baseOpacity = opacity;

        const node = (this.node = document.createElement("div"));
        node.style.position = "absolute";
        node.style.background = color;          // 🔹 히트 색상 (기본: 빨간색)
        node.style.borderRadius = "50%";
        node.style.pointerEvents = "none";
        node.style.filter = "blur(10px)";       // 🔹 퍼짐 정도 (blur 값이 높을수록 부드럽게 확산됨)
        node.style.mixBlendMode = "multiply";   // 🔹 색 겹침 방식 (multiply = 투명하게 겹침)
      }

      HeatCircle.prototype = new kakao.maps.AbstractOverlay();
      HeatCircle.prototype.onAdd = function () {
        const panel = this.getPanels().overlayLayer;
        panel.insertBefore(this.node, panel.firstChild);
      };

      HeatCircle.prototype.draw = function () {
        const projection = this.getProjection();
        const ne = projection.pointFromCoords(this.bounds.getNorthEast());
        const sw = projection.pointFromCoords(this.bounds.getSouthWest());
        const width = ne.x - sw.x;
        const height = sw.y - ne.y;
        const map = this.getMap();
        const zoom = map.getLevel();

        // ✅ 확대/축소 시 크기와 투명도, 퍼짐 정도를 조정
        let scaleFactor = 1.0;   // 🔹 히트맵 크기 비율
        let opacityAdjust = 1.0; // 🔹 확대 시 투명도 조정
        let blurPx = 10;         // 🔹 기본 블러 (히트 확산 범위)

        // 🔧 줌 레벨에 따른 히트맵 반응 설정
        if (zoom >= 13) {
          scaleFactor = 1.6;
          opacityAdjust = 0.5;
          blurPx = 30;
        } else if (zoom >= 11) {
          scaleFactor = 1.25;
          opacityAdjust = 0.35;
          blurPx = 30;
        } else if (zoom >= 9) {
          scaleFactor = 0.9;
          opacityAdjust = 0.2;
          blurPx = 30;
        } else if (zoom >= 7) {
          scaleFactor = 0.65;
          opacityAdjust = 0.1;
          blurPx = 30;
        } else if (zoom >= 5) {
          scaleFactor = 0.45;
          opacityAdjust = 0.04;
          blurPx = 10;
        } else {
          scaleFactor = 0.45;
          opacityAdjust = 0.04;
          blurPx = 10;
        }

        // ✅ DOM 스타일 적용
        this.node.style.left = `${sw.x}px`;
        this.node.style.top = `${ne.y}px`;
        this.node.style.width = `${width * scaleFactor}px`;
        this.node.style.height = `${height * scaleFactor}px`;
        this.node.style.opacity = (this.baseOpacity * opacityAdjust).toString();
        this.node.style.filter = `blur(${blurPx}px)`; // 🔹 blurPx 커질수록 부드럽게 확산
      };

      HeatCircle.prototype.onRemove = function () {
        this.node.parentNode?.removeChild(this.node);
      };

      /* ==================================
       * ✅ 히트맵 실제 생성 부분
       * ================================== */

      // 🔸 각 지점의 totalWeight 값에 따라 색상·투명도·크기 조절
      const maxW = Math.max(...data.map((d) => d.totalWeight || 0)) || 1;

      data.forEach((p) => {
        const ratio = (p.totalWeight || 0) / maxW;

        // 🔹 히트맵 투명도 (값이 커질수록 강하게 표시)
        const opacity = 0.42 + ratio * 0.45; // 예: 최소 0.42, 최대 0.87

        // 🔹 히트맵 크기 (값이 클수록 넓게 표시)
        const size = 0.08 * (1 + ratio); // 예: 0.08 ~ 0.16 정도

        // 🔹 히트맵 색상
        const color = "rgb(255, 60, 40)"; // 기본 빨간색 계열

        const sw = new kakao.maps.LatLng(p.startLatitude - size, p.startLongitude - size);
        const ne = new kakao.maps.LatLng(p.startLatitude + size, p.startLongitude + size);

        const bounds = new kakao.maps.LatLngBounds(sw, ne);

        const overlay = new (HeatCircle as any)(bounds, color, opacity);
        overlay.setMap(map);
      });

      /* ==================================
       * 📍 마커 클러스터러 기반 표시 (활동별 썸네일 적용)
       * ================================== */

      // ✅ 마커를 표시할 배열 생성
      const markers: any[] = [];

      data.forEach((d) => {
        const markerPosition = new kakao.maps.LatLng(d.startLatitude, d.startLongitude);

        // 대표 썸네일이 있는 경우 CustomOverlay 사용
        if (d.thumbnail) {
          const content = `
      <div style="position: relative; width: 60px; height: 70px;">
        <!-- 기본 마커 -->
        <img 
          src="/marker.png" 
          style="width: 60px; height: 70px; display: block;"
          alt="marker"
        />

        <!-- 대표 이미지 (원형) -->
        <div style="
          position: absolute;
          top: 2px;
          left: 8px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <img 
            src="${d.thumbnail}" 
            style="width: 100%; height: 100%; object-fit: cover;"
            alt="thumbnail"
          />
        </div>
      </div>
    `;

          const overlay = new kakao.maps.CustomOverlay({
            position: markerPosition,
            content: content,
            yAnchor: 1.0,
          });

          overlay.setMap(map);

          // ✅ 클릭 시 상세정보 열기
          kakao.maps.event.addListener(overlay, "click", () => {
            map.panTo(markerPosition);
            if (map.getLevel() > 9) map.setLevel(9, { animate: true });
            setTimeout(() => setSelectedRecord(d), 400);
          });

          markers.push(overlay);
        } else {
          // ✅ 썸네일이 없는 경우 기본 marker.png만 사용
          const imageSrc = "/marker.png";
          const imageSize = new kakao.maps.Size(52, 52);
          const imageOption = { offset: new kakao.maps.Point(26, 52) };
          const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

          const marker = new kakao.maps.Marker({
            position: markerPosition,
            image: markerImage,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            map.panTo(markerPosition);
            if (map.getLevel() > 9) map.setLevel(9, { animate: true });
            setTimeout(() => setSelectedRecord(d), 400);
          });

          markers.push(marker);
        }
      });

      // ✅ 클러스터러 생성
      const clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 7,
        disableClickZoom: false,
        calculator: [5, 10, 20],
        styles: [
          {
            width: "48px",
            height: "48px",
            background: "rgba(23, 125, 203, 0.9)",
            borderRadius: "50%",
            color: "#fff",
            textAlign: "center",
            lineHeight: "48px",
            fontWeight: "bold",
            fontSize: "15px",
            border: "2px solid #fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          },
        ],
      });

      // ✅ 마커 등록
      clusterer.addMarkers(markers);

      // ✅ 클러스터 클릭 시 지도 확대
      kakao.maps.event.addListener(clusterer, "clusterclick", (cluster: any) => {
        const level = map.getLevel() - 2;
        map.setLevel(level, { anchor: cluster.getCenter() });
      });

      // ✅ 지도 이동 후 보이는 데이터만 표시
      kakao.maps.event.addListener(map, "idle", () => {
        const bounds = map.getBounds();

        // 🔹 보이는 영역에 해당하는 데이터 필터링
        const visible = data.filter(
          (d) =>
            d.startLatitude >= bounds.getSouthWest().getLat()
            && d.startLatitude <= bounds.getNorthEast().getLat()
            && d.startLongitude >= bounds.getSouthWest().getLng()
            && d.startLongitude <= bounds.getNorthEast().getLng()

        );

        // 🔹 필터링된 데이터만 오른쪽 카드 리스트에 표시
        setVisibleData(visible);
        setPage(1); // 페이지 초기화
      });

    };

    // ✅ SDK 로드 후 지도 초기화 실행
    loadKakaoSDK().then(() => {
      window.kakao.maps.load(initMap);
    });
  }, [kakaoKey, data, loading, activeRegion]);

  /* ==================================
   * 🌊 해역 필터 + 필터모달 조건 반영
   * ================================== */
  const regionMap: Record<string, string> = {
    강릉: "동해", 속초: "동해", 포항: "동해",
    여수: "남해", 통영: "남해", 부산: "남해",
    인천: "서해", 태안: "서해", 군산: "서해", 보령: "서해",
    제주: "제주",
  };

  let filteredData =
    activeRegion === ""
      ? visibleData
      : visibleData.filter((d) => {
        const coast =
          Object.entries(regionMap).find(([key]) =>
            d.regionSigungu.includes(key) || d.regionSido.includes(key)
          )?.[1] ?? "";
        return coast === activeRegion;
      });

  if (filters) {
    filteredData = filteredData.filter((d) => {
      if (filters.groupType && d.groups !== (filters.groupType === "단체")) return false;
      if (filters.groupName && !d.name.includes(filters.groupName)) return false;
      if (filters.province && !d.regionSido.includes(filters.province)) return false;
      if (filters.city && !d.regionSigungu.includes(filters.city)) return false;

      if (filters.periodType === "직접입력" && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        const activityDate = new Date(d.startDate);
        if (activityDate < start || activityDate > end) return false;
      }

      if (filters.periodType === "분기") {
        const month = new Date(d.startDate).getMonth() + 1;
        const quarterRanges: Record<string, [number, number]> = {
          "1분기": [1, 3],
          "2분기": [4, 6],
          "3분기": [7, 9],
          "4분기": [10, 12],
        };
        const [min, max] = quarterRanges[filters.selectedQuarter] || [1, 12];
        if (month < min || month > max) return false;
      }

      return true;
    });
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  /* ==================================
   * 🧩 렌더링
   * ================================== */
  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 relative">
      <Header forceScrolled />
      <div className="flex flex-1 pt-[64px]">
        <div id="map" className="flex-1" style={{ height: "calc(100vh - 60px)" }} />
        <div className="w-[400px] bg-white flex flex-col border-l border-gray-200 relative z-40 h-[calc(100vh-60px)]">
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-[#FDFDFB] mt-3">
            <button
              onClick={() => {
                setIsFilterOpen(true);
                setSelectedRecord(null);
              }}
              className="flex items-center gap-1 text-sky-800 border border-sky-800 px-3 py-[6px] rounded-full text-sm font-medium hover:bg-sky-50 transition"
            >
              <SlidersHorizontal size={16} />
              필터
            </button>

            <div className="w-px h-5 bg-gray-300" />
            <div className="flex gap-2">
              {["동해", "서해", "남해", "제주"].map((region) => (
                <button
                  key={region}
                  onClick={() =>
                    setActiveRegion((prev) => (prev === region ? "" : region))
                  }
                  className={`px-3 py-[6px] rounded-full text-sm font-medium border transition ${activeRegion === region
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-sky-800 border-gray-300 hover:bg-sky-50"
                    }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-100 bg-[#FAFAF9] text-sm text-gray-600 flex items-center justify-between">
            <span>
              총 <b className="text-sky-700">{filteredData.length}</b>건의 활동이 검색되었습니다.
            </span>
            {filters && (
              <span className="text-xs text-gray-500">(필터 적용 중)</span>
            )}
          </div>

          {isFilterOpen && (
            <FilterModal
              onClose={() => setIsFilterOpen(false)}
              onApply={(selectedFilters) => {
                setFilters(selectedFilters);
                setIsFilterOpen(false);
                setSelectedRecord(null);
              }}
            />
          )}

          {/* ✅ 카드 리스트 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {paginatedData.map((d) => (
              <RecordCard
                key={d.id}
                onClick={() => setSelectedRecord(d)}
                title={d.name}
                date={`${d.startDate.split("T")[0]} / ${d.totalActivityTime}`}
                location={`${d.regionSido} ${d.regionSigungu}`}
                people={d.memberCount}
                weight={d.totalWeight.toString()}
                mainImage={d.thumbnail}
                logoImage={d.thumbnail}
              />
            ))}

            {filters && (
              <button
                onClick={() => setFilters(null)}
                className="absolute left-1/2 -translate-x-1/2 bottom-3
                 px-4 py-1.5 rounded-full text-sm font-medium
                 bg-white/70 text-gray-700 border border-gray-300
                 backdrop-blur-sm shadow-sm hover:bg-white/90 transition-all z-10"
              >
                필터 초기화
              </button>
            )}
          </div>

          <div className="flex justify-center items-center gap-3 py-3 border-t border-gray-200 bg-white relative z-20">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => setSelectedRecord(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <RecordDetailPanel
              recordId={selectedRecord.id}
              totalWeight={selectedRecord.totalWeight}
              onClose={() => setSelectedRecord(null)}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3"></div>
          <p className="text-sm tracking-wide">데이터를 불러오는 중입니다...</p>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
