import React, { useEffect, useRef, useState } from "react";
import { loadKakao } from "../lib/loadKakao";

interface KakaoMapSectionProps {
  center: { lat: number; lng: number };
  onAddressChange: (address: string) => void;
}

const KakaoMapSection: React.FC<KakaoMapSectionProps> = ({ center, onAddressChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    (async () => {
      await loadKakao();
      const kakao = (window as any).kakao;
      if (!mapRef.current) return;
      const options = { center: new kakao.maps.LatLng(center.lat, center.lng), level: 4 };
      const mapInstance = new kakao.maps.Map(mapRef.current, options);
      setMap(mapInstance);

      // 지도 중심 변경 시 주소 업데이트
      kakao.maps.event.addListener(mapInstance, "idle", () => {
        const latlng = mapInstance.getCenter();
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK && result[0]) {
            const addr = result[0].road_address?.address_name || result[0].address?.address_name;
            if (addr) onAddressChange(addr);
          }
        });
      });
    })();
  }, []);

  // 주소가 바뀌면 지도 이동
  useEffect(() => {
    if (map && center) {
      const kakao = (window as any).kakao;
      map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    }
  }, [center, map]);

  return (
    <div className="relative w-full h-[300px] bg-gray-200 rounded-md overflow-hidden">
      <div ref={mapRef} className="absolute inset-0" />
      {/* 고정 핀 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
        📍
      </div>
    </div>
  );
};

export default KakaoMapSection;
