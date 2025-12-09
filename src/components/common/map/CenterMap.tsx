/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { loadKakao } from "../../../lib/loadKakao";

import pinIcon from "@/assets/pin.png";

interface Props {
  center: { lat: number; lng: number };
  onCenterChange?: (pos: { lat: number; lng: number }) => void;
}

const CenterMap: React.FC<Props> = ({ center, onCenterChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    loadKakao().then(() => {
      const map = new window.kakao.maps.Map(mapRef.current!, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 3,
      });

      // ✅ 중심 핀 표시
      const pin = document.createElement("div");
      pin.style.position = "absolute";
      pin.style.top = "50%";
      pin.style.left = "50%";
      pin.style.width = "24px";
      pin.style.height = "24px";
      pin.style.background = `url(${pinIcon}) no-repeat center`;
      pin.style.backgroundSize = "contain";
      pin.style.transform = "translate(-50%, -100%)";
      pin.style.zIndex = "10";
      mapRef.current!.appendChild(pin);

      // ✅ 지도 이동 감지 (화면 이동 시 중심 좌표 업데이트)
      window.kakao.maps.event.addListener(map, "center_changed", () => {
        const latlng = map.getCenter();
        onCenterChange?.({ lat: latlng.getLat(), lng: latlng.getLng() });
      });

      mapInstance.current = map;
    });
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(
        new window.kakao.maps.LatLng(center.lat, center.lng)
      );
    }
  }, [center]);

  return <div ref={mapRef} className="w-full h-[400px] relative" />;
};

export default CenterMap;
