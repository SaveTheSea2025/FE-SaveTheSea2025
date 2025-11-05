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
  const [keyword, setKeyword] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const markers = useRef<any[]>([]);

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

        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(regionCenter.lat, regionCenter.lng),
          level: 4, // 초기 확대 정도
        });

        mapInstance.current = map;
        const geocoder = new kakao.maps.services.Geocoder();

        // ✅ 중앙 고정 핀
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

        // ✅ 중심 좌표 주소 업데이트 함수
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

        // ✅ 지도 중심 이동 시마다 주소 업데이트
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

  // ✅ 주소 검색
  const handleSearchAddress = async () => {
    try {
      await loadKakaoCustom();
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

  // ✅ 키워드 검색 (마커 + 이름 + 클릭 이동 기능 추가)
  // ✅ 키워드 검색 (정확히 일치하는 장소만 표시)
const handleKeywordSearch = async () => {
  if (!keyword.trim()) return alert("검색어를 입력해주세요!");
  try {
    await loadKakaoCustom();
    const kakao = (window as any).kakao;
    if (!mapInstance.current) return;

    const ps = new kakao.maps.services.Places();
    const map = mapInstance.current;
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    // 기존 마커 제거
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    ps.keywordSearch(keyword, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK) {
        // ✅ 정확히 키워드가 포함된 장소만 필터링
        const filtered = data.filter((place) =>
          place.place_name.replace(/\s/g, "").includes(keyword.replace(/\s/g, ""))
        );

        if (filtered.length === 0) {
          alert(`"${keyword}"(과)와 일치하는 장소가 없습니다.`);
          return;
        }

        const bounds = new kakao.maps.LatLngBounds();

        filtered.forEach((place) => {
          const position = new kakao.maps.LatLng(place.y, place.x);
          const marker = new kakao.maps.Marker({
            map,
            position,
            // ✅ 파란 마커 아이콘 지정 (다른 색으로도 가능)
            image: new kakao.maps.MarkerImage(
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              new kakao.maps.Size(24, 35)
            ),
          });
          markers.current.push(marker);
          bounds.extend(position);

          // ✅ 마우스 오버 시 이름 표시
          kakao.maps.event.addListener(marker, "mouseover", () => {
            infowindow.setContent(
              `<div style="padding:5px;font-size:12px;">${place.place_name}</div>`
            );
            infowindow.open(map, marker);
          });

          kakao.maps.event.addListener(marker, "mouseout", () => {
            infowindow.close();
          });

          // ✅ 클릭 시 지도 중심 이동
          kakao.maps.event.addListener(marker, "click", () => {
            map.setCenter(position);
            infowindow.setContent(
              `<div style="padding:5px;font-size:12px;font-weight:600;">${place.place_name}</div>`
            );
            infowindow.open(map, marker);
          });
        });

        map.setBounds(bounds);
      } else {
        alert("검색 결과가 없습니다!");
      }
    });
  } catch (err) {
    console.error("❌ Keyword Search Error:", err);
  }
};


  return (
    <div className="mb-8">
      {/* 주소 검색 입력창 */}
      <div className="flex items-center w-full border-collapse border-t border-b border-gray-300 text-sm mb-3">
        <label className="w-32 bg-[#f5f6f8] border-r border-gray-300 px-10 py-3 text-left font-medium whitespace-nowrap align-middle">
          {label}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={`${label}을(를) 선택해주세요.`}
          className="flex-1 border border-gray-300 bg-[#f5f6f8] rounded px-5 py-2 mx-5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
        />
        <button
          onClick={handleSearchAddress}
          className="ml-2 mr-4 px-7 py-1 bg-[#0369A1] text-white text-sm rounded hover:bg-[#025985]"
        >
          주소 검색
        </button>
      </div>

      {/* 키워드 검색 입력창 */}
      <div className="flex gap-2 items-center mb-3 ml-[130px]">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="예: 편의점, 카페, 해변 등 장소 키워드 입력"
          className="border border-gray-300 rounded px-4 py-2 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
        />
        <button
          onClick={handleKeywordSearch}
          className="bg-sky-600 text-white px-5 py-2 text-sm rounded hover:bg-sky-700"
        >
          장소 검색
        </button>
      </div>

      {/* 지도 표시 */}
      {isMapVisible && (
        <div
          ref={mapRef}
          className="relative w-full h-[300px] border border-gray-300 rounded-lg overflow-hidden"
        ></div>
      )}
    </div>
  );
};

export default MapSelector;
