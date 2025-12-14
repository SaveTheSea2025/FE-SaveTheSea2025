/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadKakaoCustom } from "../../lib/loadKakaoCustom";

interface DualMapSelectorProps {
  regionCenter?: { lat: number; lng: number } | null;
  isUserSelecting?: boolean;
  onChange?: (data: {
    startAddress: string;
    startLat: number;
    startLng: number;
    endAddress: string;
    endLat: number;
    endLng: number;
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
  const isUserDraggingRef = useRef(false);

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

  const convertSidoToShort = (sido: string): string => {
    const sidoMap: Record<string, string> = {
      "강원특별자치도": "강원",
      "충청북도": "충북",
      "충청남도": "충남",
      "전북특별자치도": "전북",
      "전라남도": "전남",
      "경상북도": "경북",
      "경상남도": "경남",
      "제주특별자치도": "제주",
      "서울특별시": "서울특별시",
      "부산광역시": "부산광역시",
      "대구광역시": "대구광역시",
      "인천광역시": "인천광역시",
      "광주광역시": "광주광역시",
      "대전광역시": "대전광역시",
      "울산광역시": "울산광역시",
      "세종특별자치시": "세종특별자치시",
      "경기도": "경기도",
    };

    return sidoMap[sido] || sido;
  };

  const updateMarkerData = (type: "start" | "end", address: string, lat: number, lng: number) => {
    const currentStartLat = startMarkerRef.current?.getPosition()?.getLat() ?? 0;
    const currentStartLng = startMarkerRef.current?.getPosition()?.getLng() ?? 0;
    const currentEndLat = endMarkerRef.current?.getPosition()?.getLat() ?? 0;
    const currentEndLng = endMarkerRef.current?.getPosition()?.getLng() ?? 0;

    const logData = {
      type: type === "start" ? "출발" : "도착",
      address: address,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    };

    if (type === "start") {
      setStartAddress(address);

      onChange?.({
        startAddress: address,
        startLat: lat,
        startLng: lng,
        startLatitude: lat,
        startLongitude: lng,
        endAddress,
        endLat: currentEndLat,
        endLng: currentEndLng,
        endLatitude: currentEndLat,
        endLongitude: currentEndLng,
      });
    } else {
      setEndAddress(address);

      onChange?.({
        startAddress,
        startLat: currentStartLat,
        startLng: currentStartLng,
        startLatitude: currentStartLat,
        startLongitude: currentStartLng,
        endAddress: address,
        endLat: lat,
        endLng: lng,
        endLatitude: lat,
        endLongitude: lng,
      });
    }

    // ⭐ 콘솔 로그 출력: 마커 위치/주소 업데이트 시
    console.log(`[MAP UPDATE] ${logData.type} 지점 업데이트:`, {
      주소: logData.address,
      위도_lat: logData.lat,
      경도_lng: logData.lng,
    });
  };

  const updateAddress = (lat: number, lng: number, type: "start" | "end") => {
    const kakao = (window as any).kakao;
    if (!geocoderRef.current) return;

    geocoderRef.current.coord2Address(lng, lat, (result: any, status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        const address = result[0].address.address_name;
        updateMarkerData(type, address, lat, lng);
      } else {
        geocoderRef.current.coord2RegionCode(lng, lat, (region: any, regionStatus: string) => {
          let finalAddress = "해상/지역 외";

          if (regionStatus === kakao.maps.services.Status.OK && region[0]) {
            const regionData = region[0];
            const sido = regionData.region_1depth_name || "";
            const sigungu = regionData.region_2depth_name || "";

            if (sido && sigungu) {
              const shortSido = convertSidoToShort(sido);
              finalAddress = `${shortSido} ${sigungu} 해상`;
            } else if (sido) {
              const shortSido = convertSidoToShort(sido);
              finalAddress = `${shortSido} 해상`;
            }
          }

          updateMarkerData(type, finalAddress, lat, lng);
        });
      }
    });
  };

  // 🔥 지도 초기화 (regionCenter가 처음 설정될 때만)
  useEffect(() => {
    if (!regionCenter) {
      // 🌟 지도가 이미 있으면 숨기지 않음!
      if (!mapInstance.current) {
        setIsMapVisible(false);
      }
      return;
    }

    if (mapInstance.current) {
      // 이미 지도가 있으면 스킵
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

      kakao.maps.event.addListener(startMarker, "dragstart", () => {
        startMarker.setImage(startDragImage);
        isUserDraggingRef.current = true;
      });

      kakao.maps.event.addListener(startMarker, "dragend", () => {
        const sPos = startMarker.getPosition();
        startMarker.setImage(startImage);
        map.panTo(sPos);

        // ⭐ 마커 이동 후 주소/데이터 업데이트
        updateAddress(sPos.getLat(), sPos.getLng(), "start");

        const ePos = endMarker.getPosition();
        const distance = getDistanceMeters(
          sPos.getLat(),
          sPos.getLng(),
          ePos.getLat(),
          ePos.getLng()
        );

        if (distance > FOLLOW_THRESHOLD_M) {
          const newEndLat = sPos.getLat() - OFFSET_LAT;
          const newEndLng = sPos.getLng() + OFFSET_LNG;
          const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);

          endMarker.setPosition(newEndPos);
          // ⭐ 종료 마커 자동 이동 후 주소/데이터 업데이트
          updateAddress(newEndLat, newEndLng, "end");
        }

        isUserDraggingRef.current = false;
      });

      kakao.maps.event.addListener(endMarker, "dragstart", () => {
        endMarker.setImage(endDragImage);
        isUserDraggingRef.current = true;
      });

      kakao.maps.event.addListener(endMarker, "dragend", () => {
        const pos = endMarker.getPosition();
        endMarker.setImage(endImage);
        map.panTo(pos);

        // ⭐ 마커 이동 후 주소/데이터 업데이트
        updateAddress(pos.getLat(), pos.getLng(), "end");

        isUserDraggingRef.current = false;
      });

      // ⭐ 초기 주소/데이터 업데이트
      const sPos = startMarker.getPosition();
      updateAddress(sPos.getLat(), sPos.getLng(), "start");

      const ePos = endMarker.getPosition();
      updateAddress(ePos.getLat(), ePos.getLng(), "end");
    };

    initMap();
  }, [regionCenter]); // regionCenter가 있을 때 한 번만 초기화

  // 🔥 드롭다운 선택 시 지도 이동
  useEffect(() => {
    if (isUserDraggingRef.current) {
      return;
    }

    if (!isUserSelecting) {
      return;
    }

    if (!regionCenter || !startMarkerRef.current || !endMarkerRef.current || !mapInstance.current) {
      return;
    }

    const kakao = (window as any).kakao;
    if (!kakao?.maps || !geocoderRef.current) return;

    console.log("✅ 드롭다운 선택: 지도 이동 및 마커 위치 재설정 시작");

    const newStartPos = new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng);
    startMarkerRef.current.setPosition(newStartPos);
    mapInstance.current.setCenter(newStartPos);

    const newEndLat = regionCenter.lat - OFFSET_LAT;
    const newEndLng = regionCenter.lng + OFFSET_LNG;
    const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);
    endMarkerRef.current.setPosition(newEndPos);

    // ⭐ 드롭다운 이동 후 주소 업데이트 (onChange 호출됨)
    geocoderRef.current.coord2Address(regionCenter.lng, regionCenter.lat, (result: any, status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        updateMarkerData("start", result[0].address.address_name, regionCenter.lat, regionCenter.lng);
      } else {
        geocoderRef.current.coord2RegionCode(regionCenter.lng, regionCenter.lat, (region: any, regionStatus: string) => {
          let finalAddress = "해상/지역 외";
          if (regionStatus === kakao.maps.services.Status.OK && region[0]) {
            const sido = region[0].region_1depth_name || "";
            const sigungu = region[0].region_2depth_name || "";
            const shortSido = convertSidoToShort(sido);
            finalAddress = sigungu ? `${shortSido} ${sigungu} 해상` : `${shortSido} 해상`;
          }
          updateMarkerData("start", finalAddress, regionCenter.lat, regionCenter.lng);
        });
      }
    });

    // ⭐ 드롭다운 이동 후 종료 지점 주소 업데이트 (onChange 호출됨)
    geocoderRef.current.coord2Address(newEndLng, newEndLat, (result: any, status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        updateMarkerData("end", result[0].address.address_name, newEndLat, newEndLng);
      } else {
        geocoderRef.current.coord2RegionCode(newEndLng, newEndLat, (region: any, regionStatus: string) => {
          let finalAddress = "해상/지역 외";
          if (regionStatus === kakao.maps.services.Status.OK && region[0]) {
            const sido = region[0].region_1depth_name || "";
            const sigungu = region[0].region_2depth_name || "";
            const shortSido = convertSidoToShort(sido);
            finalAddress = sigungu ? `${shortSido} ${sigungu} 해상` : `${shortSido} 해상`;
          }
          updateMarkerData("end", finalAddress, newEndLat, newEndLng);
        });
      }
    });
  }, [regionCenter?.lat, regionCenter?.lng, isUserSelecting]);

  const handlePlaceSearch = async (type: "start" | "end") => {
    const searchQuery = type === "start" ? startAddress : endAddress;
    if (!searchQuery.trim()) return alert("검색어를 입력해주세요!");

    await loadKakaoCustom();
    const kakao = (window as any).kakao;
    if (!kakao?.maps || !mapInstance.current) return;

    const ps = new kakao.maps.services.Places();
    const map = mapInstance.current;

    isUserDraggingRef.current = true;

    ps.keywordSearch(searchQuery, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data[0]) {
        const { y, x } = data[0];
        const baseLat = parseFloat(y);
        const baseLng = parseFloat(x);

        // ⭐ 검색 결과 로그
        console.log(`🔍 장소 검색 결과: ${searchQuery}`, { lat: baseLat.toFixed(6), lng: baseLng.toFixed(6) });

        if (type === "start") {
          const pos = new kakao.maps.LatLng(baseLat, baseLng);
          startMarkerRef.current.setPosition(pos);
          map.panTo(pos);

          updateAddress(baseLat, baseLng, "start"); // 주소 업데이트 시 onChange 및 콘솔 로그 발생

          const newEndLat = baseLat - OFFSET_LAT;
          const newEndLng = baseLng + OFFSET_LNG;

          const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);
          endMarkerRef.current.setPosition(newEndPos);
          updateAddress(newEndLat, newEndLng, "end"); // 주소 업데이트 시 onChange 및 콘솔 로그 발생
        } else {
          const pos = new kakao.maps.LatLng(baseLat, baseLng);
          endMarkerRef.current.setPosition(pos);
          map.panTo(pos);
          updateAddress(baseLat, baseLng, "end"); // 주소 업데이트 시 onChange 및 콘솔 로그 발생
        }

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
                className="px-4 py-2.5 bg-[#0369A1] text-white text-sm rounded hover:bg-[#025985] whitespace-nowrap flex-shrink-0"
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