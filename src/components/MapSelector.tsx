import { useEffect, useRef, useState } from "react";
import { loadKakaoCustom } from "../lib/loadKakaoCustom";
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

  // ✅ 지도 초기화
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

        // 이미 지도 생성된 경우 중복 방지
        if (mapInstance.current) return;

        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
          level: 3,
        });

        mapInstance.current = map;
        const geocoder = new kakao.maps.services.Geocoder();

        // ✅ 중앙 고정 마커
        const centerPin = document.createElement("img");
        centerPin.src = customMarker;
        centerPin.style.width = "42px";
        centerPin.style.height = "42px";
        centerPin.style.position = "absolute";
        centerPin.style.top = "50%";
        centerPin.style.left = "50%";
        centerPin.style.transform = "translate(-50%, -100%)";
        centerPin.style.pointerEvents = "none";
        centerPin.style.zIndex = "10";
        mapRef.current?.appendChild(centerPin);

        // ✅ 중심 좌표 기준 주소 업데이트
        const updateAddress = (lat: number, lng: number) => {
          geocoder.coord2Address(lng, lat, (result: any, status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const addr = result[0].address.address_name;
              setAddress((prev) => (prev === addr ? prev : addr));
              onChange?.({ lat, lng, address: addr });
            }
          });
        };

        const center = map.getCenter();
        updateAddress(center.getLat(), center.getLng());

        // ✅ 지도 중심 이동 시 주소 업데이트 (디바운스)
        let debounceTimer: any;
        kakao.maps.event.addListener(map, "center_changed", () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const center = map.getCenter();
            updateAddress(center.getLat(), center.getLng());
          }, 300);
        });
      } catch (err) {
        console.error("❌ Kakao Map Load Error:", err);
      }
    };

    initMap();
  }, [regionCenter]);

  // ✅ 주소 검색 (daum.Postcode)
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
          const geocoder = new kakao.maps.services.Geocoder();

          geocoder.addressSearch(fullAddress, (result: any, status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const { y: lat, x: lng } = result[0];
              const moveLatLon = new kakao.maps.LatLng(lat, lng);
              mapInstance.current?.setCenter(moveLatLon);
              onChange?.({ lat, lng, address: fullAddress });
            }
          });
        },
      }).open();
    } catch (err) {
      console.error("❌ 주소 검색 오류:", err);
    }
  };

  // ✅ 장소 검색 (kakao.maps.services.Places)
  const handlePlaceSearch = async () => {
    if (!address.trim()) return alert("장소명을 입력해주세요!");
    try {
      await loadKakaoCustom();
      const kakao = (window as any).kakao;
      const ps = new kakao.maps.services.Places();
      const map = mapInstance.current;

      if (!map) return;

      // 기존 마커 제거
      if (map.markers) {
        map.markers.forEach((m: any) => m.setMap(null));
      }
      map.markers = [];

      const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

      ps.keywordSearch(address, (data: any[], status: string) => {
        if (status === kakao.maps.services.Status.OK) {
          const bounds = new kakao.maps.LatLngBounds();

          data.forEach((place: any) => {
            const position = new kakao.maps.LatLng(place.y, place.x);
            const marker = new kakao.maps.Marker({
              map,
              position,
              image: new kakao.maps.MarkerImage(
                "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                new kakao.maps.Size(24, 35)
              ),
            });
            map.markers.push(marker);
            bounds.extend(position);

            // 마우스 오버 시 장소 이름 표시
            kakao.maps.event.addListener(marker, "mouseover", () => {
              infowindow.setContent(
                `<div style="padding:5px;font-size:12px;">${place.place_name}</div>`
              );
              infowindow.open(map, marker);
            });

            kakao.maps.event.addListener(marker, "mouseout", () => {
              infowindow.close();
            });

            // 클릭 시 지도 중심 이동 + 선택된 주소 전달
            kakao.maps.event.addListener(marker, "click", () => {
              map.setCenter(position);
              infowindow.setContent(
                `<div style="padding:5px;font-size:12px;font-weight:600;">${place.place_name}</div>`
              );
              infowindow.open(map, marker);
              setAddress(`${place.place_name} (${place.address_name})`);
              onChange?.({
                lat: parseFloat(place.y),
                lng: parseFloat(place.x),
                address: `${place.place_name} (${place.address_name})`,
              });
            });
          });

          // ✅ 모든 마커가 보이도록 한 후, 너무 멀면 확대 조정
          map.setBounds(bounds);
          setTimeout(() => {
            const currentLevel = map.getLevel();
            if (currentLevel > 5) map.setLevel(5); // level 숫자 작을수록 확대
          }, 300);
        } else {
          alert("검색 결과가 없습니다!");
        }
      });
    } catch (err) {
      console.error("❌ 장소 검색 오류:", err);
    }
  };

  return (
    <div className="mb-8">
      {/* 주소/장소 검색 입력창 */}
      <div className="flex items-center w-full border-collapse border-t border-b border-gray-300 text-sm mb-3">
        <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap align-middle">
          {label}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="예: 경포해변, 카페, 서울 강남구 테헤란로 10 등"
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

      {/* 지도 표시 */}
      {isMapVisible && (
        <div
          ref={mapRef}
          className="relative w-full h-[500px] aspect-square border border-gray-300 rounded-lg overflow-hidden"
        ></div>
      )}
    </div>
  );
};

export default MapSelector;
