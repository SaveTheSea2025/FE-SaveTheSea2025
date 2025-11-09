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

      // ✅ 출발/도착 기본 아이콘 & 드래그 중 아이콘
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
      const offsetLat = 0.0005; // 위도 기준 아래쪽으로 약간 이동
      const offsetLng = 0.0007; // 경도 기준 오른쪽으로 약간 이동

      // ✅ 도착 마커
      const endMarker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(
          regionCenter.lat - offsetLat,
          regionCenter.lng + offsetLng
        ),
        draggable: true,
        image: endImage,
      });
      endMarkerRef.current = endMarker;

      // ✅ 주소 업데이트 함수
      const updateAddress = (lat: number, lng: number, type: "start" | "end") => {
        const kakao = (window as any).kakao;
        const geocoder = new kakao.maps.services.Geocoder();
      
        geocoder.coord2Address(lng, lat, (result: any, status: string) => {
          if (status === kakao.maps.services.Status.OK && result[0]) {
            const addr = result[0].address.address_name;
      
            if (type === "start") {
              setStartAddress(addr);
              const updated = {
                startAddress: addr,
                startLat: lat,
                startLng: lng,
                endAddress: endAddress, // endAddress 최신값 유지
                endLat: endMarkerRef.current?.getPosition()?.getLat() ?? 0,
                endLng: endMarkerRef.current?.getPosition()?.getLng() ?? 0,
              };
              console.log("✅ start 업데이트:", updated);
              onChange?.(updated);
            } else {
              setEndAddress(addr);
              const updated = {
                startAddress: startAddress, // startAddress 최신값 유지
                startLat: startMarkerRef.current?.getPosition()?.getLat() ?? 0,
                startLng: startMarkerRef.current?.getPosition()?.getLng() ?? 0,
                endAddress: addr,
                endLat: lat,
                endLng: lng,
              };
              console.log("✅ end 업데이트:", updated);
              onChange?.(updated);
            }
          } else {
            console.warn("⚠️ 주소 변환 실패:", status);
          }
        });
      };
      

      // ✅ 출발 마커 이벤트
      kakao.maps.event.addListener(startMarker, "dragstart", () => {
        startMarker.setImage(startDragImage);
      });

      kakao.maps.event.addListener(startMarker, "dragend", () => {
        const pos = startMarker.getPosition();
        endMarker.setPosition(pos);
        map.panTo(pos);
        startMarker.setImage(startImage); // 원래 이미지로 복귀
        updateAddress(pos.getLat(), pos.getLng(), "start");
        updateAddress(pos.getLat(), pos.getLng(), "end");
      });

      // ✅ 도착 마커 이벤트
      kakao.maps.event.addListener(endMarker, "dragstart", () => {
        endMarker.setImage(endDragImage);
      });

      kakao.maps.event.addListener(endMarker, "dragend", () => {
        const pos = endMarker.getPosition();
        map.panTo(pos);
        endMarker.setImage(endImage);
        updateAddress(pos.getLat(), pos.getLng(), "end");
      });

      // ✅ 초기 위치
      const pos = startMarker.getPosition();
      updateAddress(pos.getLat(), pos.getLng(), "start");
      updateAddress(pos.getLat(), pos.getLng(), "end");
    };

    initMap();
  }, [regionCenter]);

  // ✅ 장소 검색
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
        const pos = new kakao.maps.LatLng(parseFloat(y), parseFloat(x));

        if (type === "start") {
          startMarkerRef.current.setPosition(pos);
          endMarkerRef.current.setPosition(pos);
          setStartAddress(`${place_name} (${address_name})`);
          setEndAddress(`${place_name} (${address_name})`);
          map.panTo(pos);
        } else {
          endMarkerRef.current.setPosition(pos);
          setEndAddress(`${place_name} (${address_name})`);
          map.panTo(pos);
        }

        onChange?.({
          startAddress,
          startLat: startMarkerRef.current.getPosition().getLat(),
          startLng: startMarkerRef.current.getPosition().getLng(),
          endAddress,
          endLat: endMarkerRef.current.getPosition().getLat(),
          endLng: endMarkerRef.current.getPosition().getLng(),
        });
      } else {
        alert("검색 결과가 없습니다!");
      }
    });
  };

  return (
    <div className="mb-8">
      {/* 입력창 2개 */}
      <div className="flex flex-col gap-3 mb-3">
        {/* 출발지 */}
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

        {/* 종료지 */}
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

      {/* 지도 */}
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
