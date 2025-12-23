/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../components/common/Header";
import RecordCard from "../components/record/RecordCard";
import RecordDetailPanel from "../components/record/RecordDetailPanel";
import FilterModal from "../components/record/FilterModal";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import instance from "../api/axios";

import markerImg from "@/assets/record/marker.webp";

// Kakao Maps API 타입을 위한 전역 선언
declare global {
  interface Window {
    kakao: any;
  }
}

// API 응답 데이터 타입 정의
type CleanupItem = {
  id: number;
  thumbnail: string;
  memberType: "PERSONAL" | "GROUP";
  username: string;
  profileUrl: string;
  activityName: string;
  startDate: string;
  endDate: string;
  totalActivityTime: string;
  regionSido: string;
  regionSigungu: string;
  startAddress: string;
  endAddress: string;
  startLatitude: number;
  startLongitude: number;
  memberCount: number;
  totalWeight: number;
};

const RecordsPage: React.FC = () => {
  // 지도와 클러스터러 인스턴스를 저장할 ref
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);

  // 환경 변수 로드
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  // 데이터 상태 관리
  // 지도에 표시할 모든 데이터를 저장하는 상태 
  const [allMapData, setAllMapData] = useState<CleanupItem[]>([]);
  // 현재 지도 화면에 보이는 데이터 (리스트에 표시될 데이터)
  const [visibleData, setVisibleData] = useState<CleanupItem[]>([]);
  // currentPageData 변수 제거됨

  // UI 상태 관리
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>(""); // 선택된 지역 필터
  const [isFilterOpen, setIsFilterOpen] = useState(false); // 필터 모달 열림 여부
  const [filters, setFilters] = useState<any>(null); // 적용된 필터 객체
  const [selectedRecord, setSelectedRecord] = useState<CleanupItem | null>(null); // 상세 보기 선택된 기록

  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 페이지 버튼 숨기기
  const showPagination = false;

  /* ==================================
   * 1. 백엔드 데이터 호출 (페이지네이션)
   * ================================== */
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);

        // 1. 현재 페이지의 리스트 데이터 로드
        const listRes = await instance.get("/api/activity-records", {
          params: {
            page: page,
            size: 200,  // 임시 수정 - 한 페이지에 기존 10개 로드
          },
        });

        const json = listRes.data;
        const list = json.data?.content || [];
        const pageInfo = json.data?.page;

        // 현재 페이지 리스트 업데이트
        setVisibleData(list); // 리스트에 표시될 초기 데이터는 현재 페이지 데이터

        if (pageInfo) {
          setTotalPages(pageInfo.totalPages);
        }

        // 2. 지도에 표시할 모든 데이터 로드 (첫 페이지 로드 시에만 또는 필터 변경 시)
        if (page === 0) {
          // 편의상 첫 페이지 로드시만, 최대 200개 데이터 로드 가정
          const allRes = await instance.get("/api/activity-records", {
            params: {
              page: 0,
              size: 200,
            },
          });
          setAllMapData(allRes.data.data?.content || []);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [page]); // page 변경 시 현재 페이지 리스트 데이터만 다시 가져옴

  /* ==================================
   * 핵심 로직: 지도 이동 및 오프셋 계산 함수
   * ================================== */
  const handleFocusRecord = useCallback((record: CleanupItem) => {
    if (!mapRef.current || !window.kakao) {
      // 지도가 로드되지 않은 상태라면 데이터만 세팅
      setSelectedRecord(record);
      return;
    }

    const map = mapRef.current;
    const kakao = window.kakao;
    const targetLatLng = new kakao.maps.LatLng(record.startLatitude, record.startLongitude);

    // 1. 기존 선택된 패널을 먼저 닫아서 리렌더링 부하를 줄임
    setSelectedRecord(null);

    // 2. 줌 레벨 먼저 설정 (애니메이션)
    map.setLevel(5, { animate: true });

    // 3. 오프셋 계산 (오른쪽 사이드바 400px 고려)
    // 약간의 지연을 주어 setLevel 애니메이션과 충돌 방지 및 정확한 투영 좌표 계산 유도
    setTimeout(() => {
      const projection = map.getProjection();
      if (!projection) {
        // 투영 객체가 아직 없으면 그냥 panTo
        map.panTo(targetLatLng);
      } else {
        // 현재 해당 좌표의 화면상 픽셀 좌표 구하기
        const point = projection.pointFromCoords(targetLatLng);

        // 중요: 사이드바가 오른쪽에 400px 있으므로,
        // 시각적 중심은 전체 너비의 중심보다 왼쪽에 있어야 함.
        // 따라서 지도 중심(Center)을 오른쪽으로 200px(400/2) 이동시켜야
        // 마커가 왼쪽(시각적 중심)으로 이동됨.
        point.x = point.x + 200; // 오른쪽으로 200px 오프셋

        // 다시 LatLng로 변환
        const newCenter = projection.coordsFromPoint(point);

        // 해당 위치로 부드럽게 이동
        map.panTo(newCenter);
      }
    }, 100);

    // 4. 지도 이동 얼추 끝난 후 상세 패널 오픈 (450ms 후)
    setTimeout(() => {
      setSelectedRecord(record);
    }, 450);
  }, []);

  /* ==================================
   * 2. Kakao 지도 초기화 및 마커/히트맵 설정
   * ================================== */
  useEffect(() => {
    // allMapData.length로 변경
    if (loading || allMapData.length === 0) return;

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

      // ------------------------------------------------
      // 히트맵 (HeatCircle)
      // ------------------------------------------------
      function HeatCircle(this: any, bounds: any, color: string, opacity: number) {
        this.bounds = bounds;
        this.baseOpacity = opacity;
        const node = (this.node = document.createElement("div"));
        node.style.position = "absolute";
        node.style.background = color;
        node.style.borderRadius = "50%";
        node.style.pointerEvents = "none";
        node.style.filter = "blur(10px)";
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
        const level = map.getLevel();

        let scaleFactor = 1.0;
        let opacityAdjust = 1.0;
        let blurPx = 10;

        if (level <= 5) {
          // 크기
          scaleFactor = 0.025;
          // 투명도
          opacityAdjust = 0.4;
          blurPx = 15;
        }
        // 1. 500m 이하
        else if (level <= 6) {
          // 크기
          scaleFactor = 0.05;
          // 투명도
          opacityAdjust = 0.5;
          blurPx = 15;
        }
        // 2. 1km 구간
        else if (level <= 7) {
          // 크기
          scaleFactor = 0.09;
          // 투명도(높을수록 색감을 쨍하게 올림)
          opacityAdjust = 0.6;
          blurPx = 12;
        }
        // 3. 2km 구간
        else if (level <= 8) {
          // 크기
          scaleFactor = 0.2;
          // 투명도
          opacityAdjust = 0.6;
          blurPx = 15;
        }
        // 4. 4km 구간
        else if (level <= 9) {
          scaleFactor = 0.4;
          opacityAdjust = 0.7;
          blurPx = 20;
        }
        // 5. 8km 구간
        else if (level <= 10) {
          scaleFactor = 0.6;
          opacityAdjust = 0.7;
          blurPx = 20;
        }
        // 6. 16km 구간
        else if (level <= 11) {
          scaleFactor = 0.8;
          opacityAdjust = 1.0;
          blurPx = 20;
        }
        // 7. 32km 구간
        else if (level <= 12) {
          scaleFactor = 1.1;
          opacityAdjust = 1.1;
          blurPx = 20;
        }
        else {
          scaleFactor = 1.2;
          opacityAdjust = 1.4;
          blurPx = 20;
        }
        this.node.style.left = `${sw.x}px`;
        this.node.style.top = `${ne.y}px`;
        this.node.style.width = `${width * scaleFactor}px`;
        this.node.style.height = `${height * scaleFactor}px`;

        const diffX = (width - (width * scaleFactor)) / 2;
        const diffY = (height - (height * scaleFactor)) / 2;
        this.node.style.transform = `translate(${diffX}px, ${diffY}px)`;

        this.node.style.opacity = (this.baseOpacity * opacityAdjust).toString();

        this.node.style.filter = `blur(${blurPx}px)`;

      };

      // allMapData를 사용하여 히트맵 생성
      const maxW = Math.max(...allMapData.map((d) => d.totalWeight || 0)) || 1;
      allMapData.forEach((p) => {
        const ratio = (p.totalWeight || 0) / maxW;
        const opacity = 0.42 + ratio * 0.45;
        const size = 0.08 * (1 + ratio);
        const color = "rgb(255, 60, 40)";
        const sw = new kakao.maps.LatLng(p.startLatitude - size, p.startLongitude - size);
        const ne = new kakao.maps.LatLng(p.startLatitude + size, p.startLongitude + size);
        const bounds = new kakao.maps.LatLngBounds(sw, ne);
        const overlay = new (HeatCircle as any)(bounds, color, opacity);
        overlay.setMap(map);
      });

      // ------------------------------------------------
      // 마커 클러스터러 및 마커 생성
      // ------------------------------------------------
      if (!clustererRef.current) {
        clustererRef.current = new kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 7,
          disableClickZoom: false,
          calculator: [5, 10, 20],
          styles: [{
            width: "48px", height: "48px",
            background: "rgba(23, 125, 203, 0.9)",
            borderRadius: "50%",
            color: "#fff",
            textAlign: "center", lineHeight: "48px",
            fontWeight: "bold", fontSize: "15px",
            border: "2px solid #fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
          }],
        });
      }
      const clusterer = clustererRef.current;
      clusterer.clear();

      const markers: any[] = [];
      // allMapData를 사용하여 마커 생성
      allMapData.forEach((d) => {
        const markerPosition = new kakao.maps.LatLng(d.startLatitude, d.startLongitude);
        let markerOrOverlay: any;

        if (d.thumbnail) {
          // 썸네일 커스텀 오버레이
          const div = document.createElement('div');
          div.style.position = 'relative';
          div.style.width = '60px';
          div.style.height = '70px';
          div.style.cursor = 'pointer';
          div.innerHTML = `
<img src="${markerImg}" style="width: 60px; height: 70px; display: block;" alt="marker" />
<div style="position: absolute; top: 2px; left: 8px; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 5px rgba(0,0,0,0.3); border: 2px solid white;">
<img src="${d.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" alt="thumbnail" />
</div>
`;

          // 마커 클릭 시 handleFocusRecord 호출 (공통 로직 사용)
          div.addEventListener('click', () => {
            handleFocusRecord(d);
          });

          markerOrOverlay = new kakao.maps.CustomOverlay({
            position: markerPosition,
            content: div,
            yAnchor: 1.0,
            clickable: true
          });
          markerOrOverlay.setMap(null);

        } else {
          // 기본 마커
          const imageSize = new kakao.maps.Size(52, 52);
          const imageOption = { offset: new kakao.maps.Point(26, 52) };
          const markerImage = new kakao.maps.MarkerImage(markerImg, imageSize, imageOption);
          markerOrOverlay = new kakao.maps.Marker({
            position: markerPosition, image: markerImage, clickable: true
          });

          // 마커 클릭 시 handleFocusRecord 호출 (공통 로직 사용)
          kakao.maps.event.addListener(markerOrOverlay, "click", () => {
            handleFocusRecord(d);
          });
        }
        markers.push(markerOrOverlay);
      });

      clusterer.addMarkers(markers);

      // 클러스터 클릭 시 확대
      kakao.maps.event.addListener(clusterer, "clusterclick", (cluster: any) => {
        const level = map.getLevel() - 2;
        map.setLevel(level, { anchor: cluster.getCenter() });
      });

      // 지도 이동 종료 시(idle) 보이는 데이터 업데이트
      kakao.maps.event.removeListener(map, "idle", updateVisibleData);
      kakao.maps.event.addListener(map, "idle", updateVisibleData);

      function updateVisibleData() {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // allMapData를 사용하여 지도 경계 내 데이터 필터링
        const visible = allMapData.filter(
          (d) =>
            d.startLatitude >= sw.getLat() &&
            d.startLatitude <= ne.getLat() &&
            d.startLongitude >= sw.getLng() &&
            d.startLongitude <= ne.getLng()
        );
        setVisibleData(visible);
      }
    };

    loadKakaoSDK().then(() => {
      window.kakao.maps.load(initMap);
    });
    // 의존성 배열을 allMapData로 변경
  }, [kakaoKey, allMapData, loading, handleFocusRecord]);

  /* ==================================
   * 3. 지역 필터 & 지도 이동 로직
   * ================================== */
  useEffect(() => {
    if (!mapRef.current) return;
    const { kakao } = window;
    const map = mapRef.current;

    const regionCenters: Record<string, { lat: number; lng: number, level: number }> = {
      동해: { lat: 36.9, lng: 129.5, level: 11 },
      서해: { lat: 36.9, lng: 126.0, level: 11 },
      남해: { lat: 34.5, lng: 128.2, level: 11 },
      제주: { lat: 33.38, lng: 126.55, level: 10 },
    };

    if (activeRegion && regionCenters[activeRegion]) {
      const { lat, lng, level } = regionCenters[activeRegion];
      map.panTo(new kakao.maps.LatLng(lat, lng));
      setTimeout(() => {
        map.setLevel(level, { animate: true });
      }, 300);
    }
  }, [activeRegion]);

  const handleRegionClick = (region: string) => {
    if (activeRegion === region) {
      setActiveRegion("");
    } else {
      setActiveRegion(region);
    }
  };

  /* ==================================
   * 4. 지도 컨트롤 핸들러
   * ================================== */
  // 카드 클릭 시 -> handleFocusRecord 호출 (마커 클릭과 동일 동작)
  const handleCardClick = (record: CleanupItem) => {
    handleFocusRecord(record);
  };

  // 전체보기 버튼
  const handleResetMap = () => {
    setActiveRegion("");
    setSelectedRecord(null);
    setFilters(null);

    if (mapRef.current && window.kakao) {
      const map = mapRef.current;
      const defaultCenter = new window.kakao.maps.LatLng(36.5, 127.8);
      map.panTo(defaultCenter);
      setTimeout(() => {
        map.setLevel(13, { animate: true });
      }, 300);
    }
  };

  /* ==================================
   * 5. 데이터 필터링 로직
   * ================================== */
  // 리스트는 지도 경계 내의 데이터(visibleData)에 대해서만 필터링됩니다.
  let filteredData = visibleData;

  if (filters) {
    filteredData = filteredData.filter((d) => {
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        const recordDate = new Date(d.startDate);
        if (recordDate < start || recordDate > end) return false;
      }
      if (filters.userType && filters.userType !== "ALL") {
        if (d.memberType !== filters.userType) return false;
      }
      if (filters.username) {
        if (!d.username.includes(filters.username)) return false;
      }
      if (filters.activityType && filters.activityType !== "ALL") {
        if (d.memberType !== filters.activityType) return false;
      }
      if (filters.activityName) {
        if (!d.activityName.includes(filters.activityName)) return false;
      }
      return true;
    });
  }

  const formatMinutes = (value: string) => {
    if (value.includes("시간") || value.includes("분")) return value;
    const minutes = parseInt(value, 10);
    if (isNaN(minutes)) return value;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 relative">
      <Header forceScrolled />
      <div className="flex flex-1 pt-[64px] relative">

        {/* 지도 영역 */}
        <div id="map" className="flex-1" style={{ height: "calc(100vh - 60px)" }} />

        {/* 왼쪽 하단 '전체보기' 버튼 */}
        <button
          onClick={handleResetMap}
          className="absolute bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:shadow-xl transition-all active:scale-95"
        >
          <RotateCcw size={16} className="text-gray-500" />
          전체보기
        </button>

        {/* 오른쪽 사이드바 */}
        <div className="w-[400px] bg-white flex flex-col border-l border-gray-200 relative z-40 h-[calc(100vh-60px)]">

          {/* 1. 상단 필터 및 지역 버튼 */}
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
                  onClick={() => handleRegionClick(region)}
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

          {/* 2. 검색 결과 카운트 */}
          <div className="px-4 py-2 border-b border-gray-100 bg-[#FAFAF9] text-sm text-gray-600 flex items-center justify-between">
            <span>
              총 <b className="text-sky-700">{filteredData.length}</b>건의 활동이 검색되었습니다.
            </span>
            {filters && (
              <span className="text-xs text-gray-500">(필터 적용 중)</span>
            )}
          </div>

          {/* 3. 필터 모달 */}
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

          {/* 4. 카드 리스트 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16 relative">
            {filteredData.map((d) => (
              <RecordCard
                key={d.id}
                onClick={() => handleCardClick(d)}
                username={d.username}
                profileUrl={d.profileUrl}
                activityName={d.activityName}
                date={`${d.startDate.split("T")[0]} / ${formatMinutes(d.totalActivityTime)}`}
                location={`${d.regionSido} ${d.regionSigungu}`}
                people={d.memberCount}
                weight={d.totalWeight.toString()}
                thumbnail={d.thumbnail}
              />
            ))}
          </div>

          {/* 5. 필터 초기화 버튼 */}
          {filters && (
            <div className="absolute bottom-[60px] left-0 w-full flex justify-center z-10 pointer-events-none">
              <button
                onClick={() => setFilters(null)}
                className="pointer-events-auto px-4 py-1.5 rounded-full text-sm font-medium bg-white/90 text-gray-700 border border-gray-300 backdrop-blur-sm shadow-md hover:bg-white transition-all"
              >
                필터 초기화
              </button>
            </div>
          )}


          {/* 6. 페이지네이션 */}
          {showPagination && (
            <div className="flex justify-center items-center gap-3 py-3 border-t border-gray-200 bg-white relative z-20">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7. 상세 정보 패널 */}
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

      {/* 8. 로딩 스피너 */}
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