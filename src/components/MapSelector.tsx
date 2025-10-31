import { useEffect, useRef, useState } from "react";
import { loadKakaoCustom } from "../lib/loadKakaoCustom"; // ✅ 여기로 교체
import customMarker from "../assets/customMarker.png";

interface MapSelectorProps {
  label: string;
  regionCenter?: { lat: number; lng: number } | null;
  onChange?: (pos: { lat: number; lng: number; address: string }) => void;
}

const MapSelector = ({ label, regionCenter, onChange }: MapSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [address, setAddress] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    if (!regionCenter) {
      setIsMapVisible(false);
      return;
    }

    setIsMapVisible(true);

    const initMap = async () => {
      try {
        await loadKakaoCustom(); // ✅ loadKakao → loadKakaoCustom으로 교체
        const kakao = (window as any).kakao;
        if (!kakao?.maps || !mapRef.current) return;

        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
          level: 5,
        });

        mapInstance.current = map;

        const geocoder = new kakao.maps.services.Geocoder();

        // 중앙 마커
        const marker = document.createElement("img");
        marker.src = customMarker;
        marker.style.width = "40px";
        marker.style.height = "40px";
        marker.style.position = "absolute";
        marker.style.top = "50%";
        marker.style.left = "50%";
        marker.style.transform = "translate(-50%, -100%)";
        marker.style.pointerEvents = "none";
        marker.style.zIndex = "10";
        mapRef.current?.appendChild(marker);

        const updateAddress = (lat: number, lng: number) => {
          geocoder.coord2Address(lng, lat, (result: any, status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const addr = result[0].address.address_name;
              setAddress(addr);
              onChange?.({ lat, lng, address: addr });
            }
          });
        };

        const center = map.getCenter();
        updateAddress(center.getLat(), center.getLng());

        kakao.maps.event.addListener(map, "center_changed", () => {
          const center = map.getCenter();
          updateAddress(center.getLat(), center.getLng());
        });
      } catch (err) {
        console.error("❌ Kakao Map Load Error:", err);
      }
    };

    initMap();
  }, [regionCenter, label, onChange]);

  // 주소 검색 기능
  const handleSearch = async () => {
    try {
      await loadKakaoCustom(); // ✅ 동일하게 교체
      const kakao = (window as any).kakao;
      if (!mapInstance.current || !kakao.maps.services) return;

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result: any, status: string) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          const { y: lat, x: lng } = result[0];
          const moveLatLon = new kakao.maps.LatLng(lat, lng);
          mapInstance.current.setCenter(moveLatLon);
          onChange?.({ lat, lng, address: result[0].address_name });
        } else {
          alert("주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.");
        }
      });
    } catch (err) {
      console.error("❌ Search Error:", err);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center w-full border-collapse border-t border-b border-gray-300 text-sm mb-6">
        <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap align-middle ">{label}</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={`${label}을(를) 선택해주세요.`}
          className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5  text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="ml-2 mr-15 px-7 py-1 bg-[#0369A1] text-white text-sm rounded hover:bg-[#025985]"
        >
          검색
        </button>
      </div>

      {isMapVisible && (
        <div
          ref={mapRef}
          className="w-full h-[300px] border border-gray-300 rounded-lg relative overflow-hidden"
        ></div>
      )}
    </div>
  );
};

export default MapSelector;
