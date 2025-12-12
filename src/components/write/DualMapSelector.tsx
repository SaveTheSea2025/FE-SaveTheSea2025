/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadKakaoCustom } from "../../lib/loadKakaoCustom";

interface DualMapSelectorProps {
  regionCenter?: { lat: number; lng: number } | null;
  isUserSelecting?: boolean; // 🔥 사용자가 직접 드롭다운 선택했는지
  onChange?: (data: {
    startAddress: string;
    startLat: number;
    startLng: number;
    endAddress: string;
    endLat: number;
    endLng: number;
    // WritePage에서 필요한 필드 추가
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;
  }) => void;
}

const DualMapSelector = ({ regionCenter, isUserSelecting = false, onChange }: DualMapSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const isUserDraggingRef = useRef(false); // 🔥 state → ref로 변경
  const isInitialMount = useRef(true); // 🔥 최초 마운트 체크

  const OFFSET_LAT = 0.0005;
  const OFFSET_LNG = 0.0007;
  const FOLLOW_THRESHOLD_M = 5000;

  const toRad = (v: number) => (v * Math.PI) / 180;

  const getDistanceMeters = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const R = 6371000;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = toRad(aLat);
    const s2 = toRad(bLat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(s1) * Math.cos(s2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  // ✅ updateAddress 함수 수정 - startLatitude/endLatitude 추가
  const updateAddress = (lat: number, lng: number, type: "start" | "end") => {
    const kakao = (window as any).kakao;
    if (!geocoderRef.current) return;

    geocoderRef.current.coord2Address(lng, lat, (result: any, status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        const addr = result[0].address.address_name;
        console.log(`🗺️ [${type}] 주소 업데이트:`, addr); // 🔍 디버깅 로그

        if (type === "start") {
          setStartAddress(addr);
          const endLat = endMarkerRef.current?.getPosition()?.getLat() ?? 0;
          const endLng = endMarkerRef.current?.getPosition()?.getLng() ?? 0;

          console.log('🔥 출발 마커 onChange 호출:', { startAddress: addr }); // 🔍 디버깅 로그

          onChange?.({
            startAddress: addr,
            startLat: lat,
            startLng: lng,
            startLatitude: lat,      // ✅ 추가
            startLongitude: lng,     // ✅ 추가
            endAddress,
            endLat,
            endLng,
            endLatitude: endLat,     // ✅ 추가
            endLongitude: endLng,    // ✅ 추가
          });
        } else {
          setEndAddress(addr);
          const startLat = startMarkerRef.current?.getPosition()?.getLat() ?? 0;
          const startLng = startMarkerRef.current?.getPosition()?.getLng() ?? 0;

          onChange?.({
            startAddress,
            startLat,
            startLng,
            startLatitude: startLat,  // ✅ 추가
            startLongitude: startLng, // ✅ 추가
            endAddress: addr,
            endLat: lat,
            endLng: lng,
            endLatitude: lat,         // ✅ 추가
            endLongitude: lng,        // ✅ 추가
          });
        }
      }
    });
  };

  useEffect(() => {
    if (!regionCenter) {
      setIsMapVisible(false);
      return;
    }
    setIsMapVisible(true);

    const initMap = async () => {
      await loadKakaoCustom();
      const kakao = (window as any).kakao;

      if (!kakao?.maps || !mapRef.current) return;

      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
        level: 4,
      });

      mapInstance.current = map;
      geocoderRef.current = new kakao.maps.services.Geocoder();

      const startImage = new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png",
        new kakao.maps.Size(50, 45),
        { offset: new kakao.maps.Point(15, 43) }
      );
      const startDragImage = new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_drag.png",
        new kakao.maps.Size(50, 64),
        { offset: new kakao.maps.Point(15, 54) }
      );

      const endImage = new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png",
        new kakao.maps.Size(50, 45),
        { offset: new kakao.maps.Point(15, 43) }
      );
      const endDragImage = new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_drag.png",
        new kakao.maps.Size(50, 64),
        { offset: new kakao.maps.Point(15, 54) }
      );

      const startMarker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
        draggable: true,
        image: startImage,
      });
      startMarkerRef.current = startMarker;

      const endMarker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(
          regionCenter.lat - OFFSET_LAT,
          regionCenter.lng + OFFSET_LNG
        ),
        draggable: true,
        image: endImage,
      });
      endMarkerRef.current = endMarker;

      // 🔥 드래그 시작 시 플래그 설정
      kakao.maps.event.addListener(startMarker, "dragstart", () => {
        console.log('🔴 출발 마커 드래그 시작');
        startMarker.setImage(startDragImage);
        isUserDraggingRef.current = true; // 🔥 ref 사용
      });

      kakao.maps.event.addListener(startMarker, "dragend", () => {
        console.log('🔴 출발 마커 드래그 종료');
        const sPos = startMarker.getPosition();
        startMarker.setImage(startImage);
        map.panTo(sPos);

        updateAddress(sPos.getLat(), sPos.getLng(), "start");

        const ePos = endMarker.getPosition();
        const distance = getDistanceMeters(
          sPos.getLat(),
          sPos.getLng(),
          ePos.getLat(),
          ePos.getLng()
        );

        // 🔥 5km 이상이면 도착 마커를 출발지 옆으로 이동
        if (distance > FOLLOW_THRESHOLD_M) {
          const newEndLat = sPos.getLat() - OFFSET_LAT;
          const newEndLng = sPos.getLng() + OFFSET_LNG;
          const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);

          endMarker.setPosition(newEndPos);
          updateAddress(newEndLat, newEndLng, "end");
        }

        // 🔥 드래그 완료 후 플래그 해제
        console.log('✅ isUserDragging → false');
        isUserDraggingRef.current = false;
      });

      kakao.maps.event.addListener(endMarker, "dragstart", () => {
        console.log('🔵 종료 마커 드래그 시작');
        endMarker.setImage(endDragImage);
        isUserDraggingRef.current = true; // 🔥 ref 사용
      });

      kakao.maps.event.addListener(endMarker, "dragend", () => {
        console.log('🔵 종료 마커 드래그 종료');
        const pos = endMarker.getPosition();
        endMarker.setImage(endImage);
        map.panTo(pos);

        updateAddress(pos.getLat(), pos.getLng(), "end");

        // 🔥 드래그 완료 후 플래그 해제
        console.log('✅ isUserDragging → false');
        isUserDraggingRef.current = false;
      });

      const sPos = startMarker.getPosition();
      updateAddress(sPos.getLat(), sPos.getLng(), "start");

      const ePos = endMarker.getPosition();
      updateAddress(ePos.getLat(), ePos.getLng(), "end");
    };

    initMap();
  }, [regionCenter]);

  // 🔥 regionCenter가 바뀔 때마다 마커 위치와 주소 업데이트
  useEffect(() => {
    // 🔥 최초 마운트거나 사용자가 드래그 중이면 무시
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 🔥 사용자가 마커를 직접 드래그하는 경우 regionCenter 업데이트 무시
    if (isUserDraggingRef.current) {
      console.log('⏭️ 사용자 드래그 중이므로 regionCenter 업데이트 무시');
      return;
    }

    // 🔥 사용자가 직접 드롭다운을 선택한 경우에만 지도 이동
    if (!isUserSelecting) {
      console.log('⏭️ 자동 업데이트이므로 지도 이동 무시');
      return;
    }

    // 지도가 이미 초기화되어 있고, regionCenter가 있을 때만 실행
    if (!regionCenter || !startMarkerRef.current || !endMarkerRef.current || !mapInstance.current) {
      return;
    }

    const kakao = (window as any).kakao;
    if (!kakao?.maps) return;

    console.log('🗺️ 사용자 드롭다운 선택으로 지도 업데이트:', regionCenter);

    // 출발 마커를 새 위치로 이동
    const newStartPos = new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng);
    startMarkerRef.current.setPosition(newStartPos);
    mapInstance.current.setCenter(newStartPos);

    // 도착 마커를 출발지 옆으로 이동
    const newEndLat = regionCenter.lat - OFFSET_LAT;
    const newEndLng = regionCenter.lng + OFFSET_LNG;
    const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);
    endMarkerRef.current.setPosition(newEndPos);

    // 🔥 주소 업데이트
    updateAddress(regionCenter.lat, regionCenter.lng, "start");
    updateAddress(newEndLat, newEndLng, "end");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionCenter?.lat, regionCenter?.lng, isUserSelecting]);

  // ✅ 장소 검색 함수 수정
  const handlePlaceSearch = async (type: "start" | "end") => {
    const searchQuery = type === "start" ? startAddress : endAddress;
    if (!searchQuery.trim()) return alert("검색어를 입력해주세요!");

    await loadKakaoCustom();
    const kakao = (window as any).kakao;
    if (!kakao?.maps || !mapInstance.current) return;

    const ps = new kakao.maps.services.Places();
    const map = mapInstance.current;

    // 🔥 검색도 사용자 액션으로 간주
    isUserDraggingRef.current = true;

    ps.keywordSearch(searchQuery, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data[0]) {
        const { y, x } = data[0];
        const baseLat = parseFloat(y);
        const baseLng = parseFloat(x);

        if (type === "start") {
          const pos = new kakao.maps.LatLng(baseLat, baseLng);
          startMarkerRef.current.setPosition(pos);
          map.panTo(pos);

          updateAddress(baseLat, baseLng, "start");

          const newEndLat = baseLat - OFFSET_LAT;
          const newEndLng = baseLng + OFFSET_LNG;

          const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);
          endMarkerRef.current.setPosition(newEndPos);
          updateAddress(newEndLat, newEndLng, "end");
        } else {
          const pos = new kakao.maps.LatLng(baseLat, baseLng);
          endMarkerRef.current.setPosition(pos);
          map.panTo(pos);
          updateAddress(baseLat, baseLng, "end");
        }

        // 🔥 검색 완료 후 플래그 해제
        console.log('🔍 검색 완료, isUserDragging → false');
        isUserDraggingRef.current = false;
      } else {
        alert("검색 결과가 없습니다!");
        isUserDraggingRef.current = false;
      }
    });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-3 mb-3">
        {/* 데스크톱: 테이블 형식 */}
        <div className="hidden md:flex items-center w-full border-t border-b border-gray-300 text-sm">
          <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap">
            출발지점
          </label>
          <input
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch("start")}
            placeholder="예: 강릉 경포해변 / 서울 강남구 테헤란로 10"
            className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5"
          />
          <button
            onClick={() => handlePlaceSearch("start")}
            className="ml-2 px-5 py-1 bg-[#0369A1] text-white text-sm rounded"
          >
            검색
          </button>
        </div>

        <div className="hidden md:flex items-center w-full border-t border-b border-gray-300 text-sm">
          <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap">
            종료지점
          </label>
          <input
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch("end")}
            placeholder="예: 서울역, 강릉 경포대 등"
            className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5"
          />
          <button
            onClick={() => handlePlaceSearch("end")}
            className="ml-2 px-5 py-1 bg-[#0369A1] text-white text-sm rounded"
          >
            검색
          </button>
        </div>

        {/* 모바일: 카드 형식 */}
        <div className="md:hidden">
          <div className="border-t border-b border-gray-300 py-4">
            <label className="block text-sm font-semibold mb-2">출발지점</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                placeholder="지역을 먼저 선택해주세요."
                className="flex-1 border border-gray-300 bg-white rounded px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch("start")}
              />
              <button
                onClick={() => handlePlaceSearch("start")}
                className="px-4 py-2.5 bg-[#0369A1] text-white text-sm rounded hover:bg-[#0369A1] whitespace-nowrap flex-shrink-0"
              >
                검색
              </button>
            </div>
          </div>

          <div className="border-b border-gray-300 py-4">
            <label className="block text-sm font-semibold mb-2">종료지점</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
                placeholder="지역을 먼저 선택해주세요."
                className="flex-1 border border-gray-300 bg-white rounded px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch("end")}
              />
              <button
                onClick={() => handlePlaceSearch("end")}
                className="px-4 py-2.5 bg-[#0369A1] text-white text-sm rounded hover:bg-[#025985] whitespace-nowrap flex-shrink-0"
              >
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 지도 */}
      {isMapVisible && (
        <div
          ref={mapRef}
          className="relative w-full h-[300px] md:h-[500px] border border-gray-300 rounded-lg overflow-hidden"
        ></div>
      )}
    </div>
  );
};

export default DualMapSelector;