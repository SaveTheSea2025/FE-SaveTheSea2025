/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadKakaoCustom } from "../lib/loadKakaoCustom";

interface MapSelectorProps {
  label: string;
  regionCenter?: { lat: number; lng: number } | null;
  onChange?: (pos: {
    lat: number;
    lng: number;
    address: string;
    regionSido?: string;
    regionSigungu?: string;
  }) => void;
}

const MapSelector = ({ label, regionCenter, onChange }: MapSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const geocoderRef = useRef<any>(null);

  // ✅ 지도 최초 생성 (regionCenter가 바뀔 때만 실행)
  useEffect(() => {
    if (!regionCenter) {
      setIsMapVisible(false);
      return;
    }
    setIsMapVisible(true);

    const initMap = async () => {
      try {
        await loadKakaoCustom();
        const kakao = (window as any).kakao;
        if (!kakao?.maps || !mapRef.current) return;

        // 기존 지도 제거 방지 (중복 생성 방지)
        if (mapInstance.current) return;

        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
          level: 3,
        });
        mapInstance.current = map;

        const geocoder = new kakao.maps.services.Geocoder();
        geocoderRef.current = geocoder;

        // ✅ 마커 아이콘
        const iconSrc =
          label === "출발지점"
            ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png"
            : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png";

        const markerImage = new kakao.maps.MarkerImage(
          iconSrc,
          new kakao.maps.Size(64, 69)
        );

        // ✅ 마커 생성
        const marker = new kakao.maps.Marker({
          map,
          position: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
          draggable: true,
          image: markerImage,
        });
        markerRef.current = marker;

        // ✅ 주소 갱신 함수
        const updateAddress = (lat: number, lng: number) => {
          if (!geocoderRef.current) return;
          geocoderRef.current.coord2Address(lng, lat, (result: any, status: any) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const addr = result[0].address.address_name;
              setAddress(addr);
              geocoderRef.current.coord2RegionCode(lng, lat, (regionResult: any, regionStatus: any) => {
                if (regionStatus === kakao.maps.services.Status.OK && regionResult[0]) {
                  const sido = regionResult[0].region_1depth_name;
                  const sigungu = regionResult[0].region_2depth_name;
                  onChange?.({ lat, lng, address: addr, regionSido: sido, regionSigungu: sigungu });
                } else {
                  onChange?.({ lat, lng, address: addr });
                }
              });
            }
          });
        };
        if (label === "종료지점") {
  (window as any).endMapInstance = map;
  (window as any).endMarkerRef = marker;
  (window as any).endMapReady = false;

  kakao.maps.event.addListener(map, "tilesloaded", () => {
    if (!(window as any).endMapReady) {
      (window as any).endMapReady = true;
      console.log("✅ 종료지도 로드 완료");
    }
  });
}



        // ✅ 초기 주소 설정
        const pos = marker.getPosition();
        updateAddress(pos.getLat(), pos.getLng());

        // ✅ 드래그 이벤트 (주소 업데이트)
        kakao.maps.event.addListener(marker, "dragend", () => {
          const pos = marker.getPosition();
          map.panTo(pos);
          updateAddress(pos.getLat(), pos.getLng());
        });
      } catch (err) {
        console.error("❌ Kakao Map Init Error:", err);
      }
    };

    initMap();
  }, [regionCenter, label]); // onChange 제거 ⚠️

  // ✅ 장소 검색
  // ✅ 장소 검색
const handlePlaceSearch = async () => {
  if (!address.trim()) return alert("장소명을 입력해주세요!");
  try {
    await loadKakaoCustom();
    const kakao = (window as any).kakao;
    if (!kakao?.maps?.services || !mapInstance.current) return;

    const ps = new kakao.maps.services.Places();
    const map = mapInstance.current;
    const marker = markerRef.current;

    ps.keywordSearch(address, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data[0]) {
        const place = data[0];
        let lat = parseFloat(place.y);
        let lng = parseFloat(place.x);

        // ✅ 도착지점일 때만 살짝 오른쪽 아래로 이동시킴
        if (label === "종료지점") {
          lat -= 0.0005;
          lng += 0.0007;
        }

        const moveLatLon = new kakao.maps.LatLng(lat, lng);
        marker.setPosition(moveLatLon);
        map.panTo(moveLatLon);

        setAddress(`${place.place_name} (${place.address_name})`);
        onChange?.({
          lat,
          lng,
          address: `${place.place_name} (${place.address_name})`,
        });
      } else {
        alert("검색 결과가 없습니다!");
      }
    });
  } catch (err) {
    console.error("❌ 장소 검색 오류:", err);
  }
};


  // ✅ 주소 검색 (다음 우편번호)
  const handleAddressSearch = async () => {
    try {
      if (!(window as any).daum?.Postcode) {
        alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      new (window as any).daum.Postcode({
        oncomplete: async function (data: any) {
          const fullAddress = data.address;
          setAddress(fullAddress);

          await loadKakaoCustom();
          const kakao = (window as any).kakao;
          const geocoder = geocoderRef.current || new kakao.maps.services.Geocoder();

          geocoder.addressSearch(fullAddress, (result: any, status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const { y: lat, x: lng } = result[0];
              const moveLatLon = new kakao.maps.LatLng(lat, lng);
              const map = mapInstance.current;
              const marker = markerRef.current;

              marker.setPosition(moveLatLon);
              map.panTo(moveLatLon);
              onChange?.({ lat, lng, address: fullAddress });
            }
          });
        },
      }).open();
    } catch (err) {
      console.error("❌ 주소 검색 오류:", err);
    }
  };

  return (
    <div className="mb-8">
      {/* 입력창 + 버튼 */}
      <div className="flex items-center w-full border-collapse border-t border-b border-gray-300 text-sm mb-3">
        <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap align-middle">
          {label}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="예: 강릉 경포해변 / 서울 강남구 테헤란로 10"
          className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch()}
        />
        <button
          onClick={handlePlaceSearch}
          className="ml-2 px-5 py-1 bg-[#0284C7] text-white text-sm rounded hover:bg-[#0369A1]"
        >
          검색
        </button>
        <button
          onClick={handleAddressSearch}
          className="ml-2 mr-4 px-5 py-1 bg-[#0369A1] text-white text-sm rounded hover:bg-[#025985]"
        >
          주소 검색
        </button>
      </div>

      {/* 지도 */}
      {isMapVisible && (
        <div
          ref={mapRef}
          className="relative w-full h-[500px] border border-gray-300 rounded-lg overflow-hidden"
        />
      )}
    </div>
  );
};

export default MapSelector;
