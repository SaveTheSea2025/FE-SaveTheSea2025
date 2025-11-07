/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import { loadKakao } from "../lib/loadKakao";

type Marker = { lat: number; lng: number; title?: string };
export default function KakaoMap({
    center = { lat: 37.5665, lng: 126.978 },
    level = 5,
    markers = [],
}: {
    center?: { lat: number; lng: number };
    level?: number;
    markers?: Marker[];
}) {
    const elRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const renderedMarkersRef = useRef<any[]>([]);

    useEffect(() => {
        let cancelled = false;

        loadKakao().then(() => {
            if (cancelled || !elRef.current) return;

            if (!mapRef.current) {
                mapRef.current = new window.kakao.maps.Map(elRef.current, {
                    center: new window.kakao.maps.LatLng(center.lat, center.lng),
                    level,
                });
            } else {
                mapRef.current.setLevel(level);
                mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
            }

            // 기존 마커 제거
            renderedMarkersRef.current.forEach((m) => m.setMap(null));
            renderedMarkersRef.current = [];

            if (markers.length) {
                const bounds = new window.kakao.maps.LatLngBounds();
                markers.forEach((m) => {
                    const pos = new window.kakao.maps.LatLng(m.lat, m.lng);
                    const marker = new window.kakao.maps.Marker({ map: mapRef.current, position: pos, title: m.title });
                    renderedMarkersRef.current.push(marker);
                    bounds.extend(pos);
                });
                mapRef.current.setBounds(bounds);
            }
        }).catch((e) => console.error(e));

        return () => { cancelled = true; };
    }, [center.lat, center.lng, level, JSON.stringify(markers)]);

    // ✅ 반드시 높이가 있어야 지도 보임
    return <div ref={elRef} className="w-full h-[280px] rounded-md border border-gray-300" />;
}
