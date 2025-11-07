/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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
  latitude: number;
  longitude: number;
  memberCount: number;
  totalWeight: number;
  thumbnail: string;
};

const RecordsPage: React.FC = () => {
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
  const [filters, setFilters] = useState<any>(null); // ✅ 필터 상태 추가
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

      // 🗾 남한 전체 뷰
      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(36.5, 127.8),
        level: 13,
      });

      /* ==================================
       * 🔥 히트맵 (빨간색 강조)
       * ================================== */
      function HeatCircle(this: any, bounds: any, color: string, opacity: number) {
        this.bounds = bounds;
        this.baseOpacity = opacity;
        const node = (this.node = document.createElement("div"));
        node.style.position = "absolute";
        node.style.background = color;
        node.style.borderRadius = "50%";
        node.style.pointerEvents = "none";
        node.style.filter = "blur(60px)";
        node.style.mixBlendMode = "multiply";
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

        // 확대/축소에 따른 크기, 투명도, 블러 조정
        let scaleFactor = 1.0;
        let opacityAdjust = 1.0;
        let blurPx = 60;

        if (zoom >= 13) {
          scaleFactor = 1.6;
          opacityAdjust = 1.0;
          blurPx = 70;
        } else if (zoom >= 11) {
          scaleFactor = 1.25;
          opacityAdjust = 0.9;
          blurPx = 60;
        } else if (zoom >= 9) {
          scaleFactor = 0.9;
          opacityAdjust = 0.75;
          blurPx = 50;
        } else if (zoom >= 7) {
          scaleFactor = 0.65;
          opacityAdjust = 0.55;
          blurPx = 45;
        } else if (zoom >= 5) {
          scaleFactor = 0.45;
          opacityAdjust = 0.35;
          blurPx = 38;
        } else {
          scaleFactor = 0.28;
          opacityAdjust = 0.18;
          blurPx = 30;
        }

        this.node.style.left = `${sw.x}px`;
        this.node.style.top = `${ne.y}px`;
        this.node.style.width = `${width * scaleFactor}px`;
        this.node.style.height = `${height * scaleFactor}px`;
        this.node.style.opacity = (this.baseOpacity * opacityAdjust).toString();
        this.node.style.filter = `blur(${blurPx}px)`;
      };

      HeatCircle.prototype.onRemove = function () {
        this.node.parentNode?.removeChild(this.node);
      };

      // 🔴 히트맵 생성
      const maxW = Math.max(...data.map((d) => d.totalWeight || 0)) || 1;
      data.forEach((p) => {
        const ratio = (p.totalWeight || 0) / maxW;
        const opacity = 0.42 + ratio * 0.45;
        const size = 0.08 * (1 + ratio);
        const sw = new kakao.maps.LatLng(p.latitude - size, p.longitude - size);
        const ne = new kakao.maps.LatLng(p.latitude + size, p.longitude + size);
        const bounds = new kakao.maps.LatLngBounds(sw, ne);
        const color = "rgb(255, 60, 40)";
        const overlay = new (HeatCircle as any)(bounds, color, opacity);
        overlay.setMap(map);
      });

      /* ==================================
       * 📍 클러스터 + 썸네일/숫자 마커 (동적 PREC)
       * ================================== */
      const zoom = map.getLevel();
      let PREC = 2;
      if (zoom <= 5) PREC = 1;
      else if (zoom <= 8) PREC = 2;
      else PREC = 3;

      const buckets: Record<string, CleanupItem[]> = {};
      data.forEach((d) => {
        const key = `${d.latitude.toFixed(PREC)}_${d.longitude.toFixed(PREC)}`;
        (buckets[key] ??= []).push(d);
      });

      Object.values(buckets).forEach((group) => {
        const first = group[0];
        const pos = new kakao.maps.LatLng(first.latitude, first.longitude);
        const el = document.createElement("div");

        if (group.length === 1) {
          el.innerHTML = `
      <div style="
        width: 52px; height: 52px; border-radius: 50%;
        overflow: hidden; border: 3px solid #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        transform: translate(-50%, -50%);
        background:#eee; cursor:pointer;
      ">
        <img src="${first.thumbnail}" alt="thumb"
             style="width:100%; height:100%; object-fit:cover;" />
      </div>`;
          el.addEventListener("click", () => {
            map.panTo(pos);
            if (map.getLevel() > 9) map.setLevel(9, { animate: true });
            setTimeout(() => setSelectedRecord(first), 400);
          });
        } else {
          el.innerHTML = `
      <div style="
        min-width:46px; height:46px; padding:0 6px;
        border-radius:9999px; display:flex; align-items:center; justify-content:center;
        background: linear-gradient(135deg, #EF4444, #B91C1C);
        color:#fff; font-weight:800; font-size:16px;
        transform: translate(-50%, -50%);
        border:3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor:pointer;
      ">${group.length}</div>`;
          el.addEventListener("click", () => {
            map.panTo(pos);
            if (map.getLevel() > 9) map.setLevel(9, { animate: true });
            setVisibleData(group);
            setPage(1);
          });
        }

        new kakao.maps.CustomOverlay({
          position: pos,
          content: el,
          yAnchor: 1,
          zIndex: 10,
        }).setMap(map);
      });

      kakao.maps.event.addListener(map, "click", () => {
        setSelectedRecord(null);
      });

      kakao.maps.event.addListener(map, "idle", () => {
        const bounds = map.getBounds();
        const visible = data.filter(
          (d) =>
            d.latitude >= bounds.getSouthWest().getLat() &&
            d.latitude <= bounds.getNorthEast().getLat() &&
            d.longitude >= bounds.getSouthWest().getLng() &&
            d.longitude <= bounds.getNorthEast().getLng()
        );
        setVisibleData(visible);
        setPage(1);
      });
    };

    loadKakaoSDK().then(() => {
      window.kakao.maps.load(initMap);
    });
  }, [kakaoKey, data, loading]);

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
        const coast = regionMap[d.regionSigungu] || regionMap[d.regionSido];
        return coast === activeRegion;
      });

  // ✅ 필터 조건 반영
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

            {/* ✅ 필터 적용 중일 때 하단 중앙 투명 버튼 표시 */}
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

          {/* ✅ 페이지네이션 바 */}
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
        <RecordDetailPanel
          recordId={selectedRecord.id}
          onClose={() => setSelectedRecord(null)}
        />
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
