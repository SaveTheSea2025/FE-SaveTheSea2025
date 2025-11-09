/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadKakaoCustom } from "../lib/loadKakaoCustom";

interface DualMapSelectorProps {
  regionCenter?: { lat: number; lng: number } | null;
  onChange?: (data: {
    startAddress: string;
    startLat: number;
    startLng: number;
    endAddress: string;
    endLat: number;
    endLng: number;
  }) => void;
}

const DualMapSelector = ({ regionCenter, onChange }: DualMapSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);

  const OFFSET_LAT = 0.0005;
  const OFFSET_LNG = 0.0007;
  const FOLLOW_THRESHOLD_M = 5000; // 5km

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
      const geocoder = new kakao.maps.services.Geocoder();

      // ✅ 마커 아이콘
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

      // ✅ 출발 마커
      const startMarker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
        draggable: true,
        image: startImage,
      });
      startMarkerRef.current = startMarker;

      // ✅ 도착 마커
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

      // ✅ 주소 변환 함수
      const updateAddress = (lat: number, lng: number, type: "start" | "end") => {
        geocoder.coord2Address(lng, lat, (result: any, status: string) => {
          if (status === kakao.maps.services.Status.OK && result[0]) {
            const addr = result[0].address.address_name;
            if (type === "start") {
              setStartAddress(addr);
              onChange?.({
                startAddress: addr,
                startLat: lat,
                startLng: lng,
                endAddress,
                endLat: endMarkerRef.current?.getPosition()?.getLat() ?? 0,
                endLng: endMarkerRef.current?.getPosition()?.getLng() ?? 0,
              });
            } else {
              setEndAddress(addr);
              onChange?.({
                startAddress,
                startLat: startMarkerRef.current?.getPosition()?.getLat() ?? 0,
                startLng: startMarkerRef.current?.getPosition()?.getLng() ?? 0,
                endAddress: addr,
                endLat: lat,
                endLng: lng,
              });
            }
          }
        });
      };

      // ✅ 출발 마커 드래그
      kakao.maps.event.addListener(startMarker, "dragstart", () => {
        startMarker.setImage(startDragImage);
      });
      kakao.maps.event.addListener(startMarker, "dragend", () => {
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

        if (distance > FOLLOW_THRESHOLD_M) {
          const newEndLat = sPos.getLat() - OFFSET_LAT;
          const newEndLng = sPos.getLng() + OFFSET_LNG;
          const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);
          endMarker.setPosition(newEndPos);
          updateAddress(newEndLat, newEndLng, "end");
        }
      });

      // ✅ 도착 마커 드래그
      kakao.maps.event.addListener(endMarker, "dragstart", () => {
        endMarker.setImage(endDragImage);
      });
      kakao.maps.event.addListener(endMarker, "dragend", () => {
        const pos = endMarker.getPosition();
        endMarker.setImage(endImage);
        map.panTo(pos);
        updateAddress(pos.getLat(), pos.getLng(), "end");
      });

      // ✅ 초기 주소 설정
      const pos = startMarker.getPosition();
      updateAddress(pos.getLat(), pos.getLng(), "start");
      const endPos = endMarker.getPosition();
      updateAddress(endPos.getLat(), endPos.getLng(), "end");
    };

    initMap();
  }, [regionCenter]);

  // ✅ 검색 기능
  const handlePlaceSearch = async (type: "start" | "end") => {
    const address = type === "start" ? startAddress : endAddress;
    if (!address.trim()) return alert("검색어를 입력해주세요!");
    await loadKakaoCustom();
    const kakao = (window as any).kakao;
    if (!kakao?.maps?.services || !mapInstance.current) return;

    const ps = new kakao.maps.services.Places();
    const map = mapInstance.current;

    ps.keywordSearch(address, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data[0]) {
        const { y, x, place_name, address_name } = data[0];
        const baseLat = parseFloat(y);
        const baseLng = parseFloat(x);
        const addrText = `${place_name} (${address_name})`;

        if (type === "start") {
          const startPos = new kakao.maps.LatLng(baseLat, baseLng);
          startMarkerRef.current.setPosition(startPos);
          map.panTo(startPos);
          setStartAddress(addrText);
          updateAddress(baseLat, baseLng, "start");

          // ✅ 출발 검색 시 도착 마커는 항상 근처로 자동 이동
          const newEndLat = baseLat - OFFSET_LAT;
          const newEndLng = baseLng + OFFSET_LNG;
          const newEndPos = new kakao.maps.LatLng(newEndLat, newEndLng);
          endMarkerRef.current.setPosition(newEndPos);
          setTimeout(() => updateAddress(newEndLat, newEndLng, "end"), 200);
        } else {
          const endPos = new kakao.maps.LatLng(baseLat, baseLng);
          endMarkerRef.current.setPosition(endPos);
          map.panTo(endPos);
          setEndAddress(addrText);
          updateAddress(baseLat, baseLng, "end");
        }
      } else {
        alert("검색 결과가 없습니다!");
      }
    });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex items-center w-full border-t border-b border-gray-300 text-sm">
          <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap">
            출발지점
          </label>
          <input
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="예: 강릉 경포해변 / 서울 강남구 테헤란로 10"
            className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch("start")}
          />
          <button
            onClick={() => handlePlaceSearch("start")}
            className="ml-2 px-5 py-1 bg-[#0284C7] text-white text-sm rounded hover:bg-[#0369A1]"
          >
            검색
          </button>
        </div>

        <div className="flex items-center w-full border-t border-b border-gray-300 text-sm">
          <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap">
            종료지점
          </label>
          <input
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            placeholder="예: 서울역, 강릉 경포대 등"
            className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch("end")}
          />
          <button
            onClick={() => handlePlaceSearch("end")}
            className="ml-2 px-5 py-1 bg-[#0369A1] text-white text-sm rounded hover:bg-[#025985]"
          >
            검색
          </button>
        </div>
      </div>

      {isMapVisible && (
        <div
          ref={mapRef}
          className="relative w-full h-[500px] border border-gray-300 rounded-lg overflow-hidden"
        ></div>
      )}
    </div>
  );
};

export default DualMapSelector;
