/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import WasteSection from "../components/WasteSection";
import { loadKakaoCustom } from "../lib/loadKakaoCustom";
import graycheck from "/src/assets/graycheck.png";
import bluecheck from "/src/assets/bluecheck.png";
import PhotoUploadSection from "../components/PhotoUploadSection";
import LocationSection from "../components/LocationSection";
import axios from "axios";

const WritePage = () => {
  const [description, setDescription] = useState("");
  const maxLength = 500;
  const [groupType, setGroupType] = useState("단체");
  const [groupName, setGroupName] = useState("");

  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);
  const [endPos, setEndPos] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedRegion, setSelectedRegion] = useState({ sido: "", sigungu: "" });
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });

  //활동 시간 계산 관련 상태 추가
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [volunteerHours, setVolunteerHours] = useState(0);

  //useEffect로 자동 시간 계산
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs > 0) {
        const diffHours = diffMs / (1000 * 60 * 60);
        setVolunteerHours(Math.floor(diffHours * 10) / 10); // 소수 첫째 자리
      } else {
        setVolunteerHours(0);
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  // ====================== 활동 등록 ======================
  const handleSubmit = async () => {
    try {
      // ✅ HTMLInputElement 타입 캐스팅
      const memberCountInput = document.getElementById("volunteerCount") as HTMLInputElement | null;
      const memberCount = Number(memberCountInput?.value || 1);

      // ✅ 요청 body
      const body = {
        groups: groupType === "단체",
        name: groupName || "테스트 단체",
        activeName: "테스트 봉사활동",
        memberCount,
        activityDescription: description || "활동 설명 없음",
        startDate: `${startDate}T${startTime}`,
        endDate: `${endDate}T${endTime}`,
        totalActivityTime: `${volunteerHours}시간`,
        startAddress: startText || "출발지 미입력",
        endAddress: endText || "도착지 미입력",
        specialNote: "특이사항 없음",
        thumbnail: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        photoUrls: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          "https://res.cloudinary.com/demo/image/upload/sample2.jpg",
        ],
      };

      console.log("📦 전송 body", body);

      // ✅ API 요청 (vite.config.ts에 proxy 설정 필요)
      const response = await axios.post("/api/v1/activity", body);

      if (response.data.code === 0) {
        alert("✅ 활동 기록이 성공적으로 저장되었습니다!");
      } else {
        alert("⚠️ 저장 실패: " + (response.data.message || "알 수 없는 오류"));
      }
    } catch (error: any) {
      console.error("❌ 서버 오류:", error);
      alert("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // ====================== 카카오 주소 + 키워드 병합 검색 ======================
  const geocode = useCallback(async (addr: string) => {
    if (!addr?.trim()) return null;

    await loadKakaoCustom();

    if (!window.kakao?.maps?.services) {
      console.warn("⚠️ Kakao services 아직 로드 안됨, 300ms 대기 후 재시도");
      await new Promise((r) => setTimeout(r, 300));
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const places = new window.kakao.maps.services.Places();

    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      let resolved = false;

      geocoder.addressSearch(addr, (result: any[], status: string) => {
        if (!resolved && status === window.kakao.maps.services.Status.OK && result[0]) {
          const { x, y } = result[0];
          resolved = true;
          resolve({ lat: Number(y), lng: Number(x) });
        } else {
          const regionPrefix = `${selectedRegion.sido || ""} ${selectedRegion.sigungu || ""} ${addr}`;
          places.keywordSearch(regionPrefix, (data: any[], status2: string) => {
            if (!resolved && status2 === window.kakao.maps.services.Status.OK && data[0]) {
              const first = data[0];
              resolved = true;
              resolve({ lat: Number(first.y), lng: Number(first.x) });
            } else if (!resolved) {
              resolved = true;
              resolve(null);
            }
          });
        }
      });
    });
  }, [selectedRegion]);

  // ====================== 출발/도착지 지도 표시 ======================
  const handleSearchStart = useCallback(async () => {
    const pos = await geocode(startText);
    setStartPos(pos);
    if (pos) {
      const mapContainer = document.getElementById("start-map");
      const map = new window.kakao.maps.Map(mapContainer, {
        center: new window.kakao.maps.LatLng(pos.lat, pos.lng),
        level: 3,
      });
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
      });
    } else {
      alert("출발지 주소나 장소를 찾을 수 없습니다. 다시 입력해주세요.");
    }
  }, [geocode, startText]);

  const handleSearchEnd = useCallback(async () => {
    const pos = await geocode(endText);
    setEndPos(pos);
    if (pos) {
      const mapContainer = document.getElementById("end-map");
      const map = new window.kakao.maps.Map(mapContainer, {
        center: new window.kakao.maps.LatLng(pos.lat, pos.lng),
        level: 3,
      });
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
      });
    } else {
      alert("도착지 주소나 장소를 찾을 수 없습니다. 다시 입력해주세요.");
    }
  }, [geocode, endText]);

  // ============================================================

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <div
        className="w-full h-[300px] bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/backgroundimage2.png')" }}
      ></div>

      <main className="max-w-5xl mx-auto bg-white p-10 mt-0 relative z-10">
        <h2 className="text-[38px] font-medium font-['Noto_Sans_KR'] text-center mb-10 leading-normal">
          봉사활동 기록하기
        </h2>

        {/* ===================== 활동 정보 ===================== */}
        <section className="mb-10">
          <h3 className="text-[30px] font-medium font-['Noto_Sans_KR']">활동 정보</h3>

          <div
            className="border border-gray-300 w-full"
            style={{
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <div className="flex justify-end pr-4 py-2 text-sm text-gray-500">
              <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다
            </div>

            <table className="w-full border-collapse border-t border-gray-300 text-sm">
              <tbody>
                {/* 구분 */}
                <tr className="border-t border-gray-300 align-top">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    구분
                  </th>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 mt-[2px]">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="group"
                            checked={groupType === "단체"}
                            onChange={() => setGroupType("단체")}
                          />
                          단체
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="group"
                            checked={groupType === "개인"}
                            onChange={() => setGroupType("개인")}
                          />
                          개인
                        </label>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={groupType === "단체" ? "단체명을 입력해주세요." : "이름을 입력해주세요."}
                            value={groupName}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\s+/g, "");
                              setGroupName(cleaned);
                            }}
                            className="border border-gray-300 bg-gray-50 rounded px-3 py-1.5 w-64 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                          />
                          <img src={groupName.trim() ? bluecheck : graycheck} alt="check" className="w-5 h-5" />
                          <p className="text-xs text-gray-400">띄어쓰기 없이 입력해주세요.</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* 봉사활동 명 */}
                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    봉사활동 명 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="봉사활동 명을 입력해주세요."
                      className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                  </td>
                </tr>

                {/* 활동 일자 */}
                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    활동 일자 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[180px]"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[120px]"
                      />
                      <span className="text-gray-500 text-[20px] mx-1">~</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[180px]"
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[120px]"
                      />
                    </div>
                  </td>
                </tr>

                {/* 봉사활동 시간 / 인원 */}
                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f5f6f8] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    봉사활동 시간
                  </th>
                  <td className="p-0">
                    <div className="flex">
                      <div className="flex items-center justify-center w-1/3 border-r border-gray-300 bg-white text-sm text-gray-800">
                        <span>{volunteerHours} 시간</span>
                      </div>

                      <div className="flex items-center justify-start w-1/3 bg-[#f5f6f8] border-r border-gray-300 px-6 py-3">
                        <label className="font-medium text-gray-800">
                          봉사활동 인원 <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-start w-1/3 bg-white px-6 py-3">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            onClick={() => {
                              const input = document.getElementById("volunteerCount") as HTMLInputElement;
                              const val = Math.max(0, Number(input.value) - 1);
                              input.value = String(val);
                            }}
                          >
                            -
                          </button>
                          <input
                            id="volunteerCount"
                            type="number"
                            min={0}
                            defaultValue={0}
                            className="w-16 h-8 text-center text-gray-800 outline-none bg-white"
                          />
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            onClick={() => {
                              const input = document.getElementById("volunteerCount") as HTMLInputElement;
                              const val = Number(input.value) + 1;
                              input.value = String(val);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span className="ml-2">명</span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* 활동 설명 */}
                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium align-top">
                    활동 설명
                  </th>
                  <td className="px-4 py-3">
                    <textarea
                      rows={4}
                      maxLength={maxLength}
                      placeholder="내용은 500자까지 입력 가능합니다."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    ></textarea>

                    <div
                      className={`text-right text-xs mt-1 transition-colors ${
                        description.length >= maxLength ? "text-red-500 font-semibold" : "text-gray-500"
                      }`}
                    >
                      {description.length}/{maxLength}자
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===================== 활동 사진 첨부 ===================== */}
        <PhotoUploadSection />

        {/* ===================== 활동 위치 ===================== */}
        <LocationSection />

        {/* ===================== 폐기물 ===================== */}
        <WasteSection />

        {/* ===================== 특이사항 ===================== */}
        <section className="mb-16">
          <h3 className="text-[22px] font-semibold mb-3">특이사항</h3>
          <div className="border border-gray-300 border-l-0 border-r-0 bg-white p-4">
            <textarea
              placeholder="특이사항이 있으면 적어주세요. ex)기타 폐기물 종류, 특이한 폐기물 발견"
              className="w-full bg-[#f7f8fa] border border-gray-300 rounded px-3 py-2 text-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
            ></textarea>
          </div>
        </section>

        {/* 작성 완료 버튼 */}
        <div className="text-center mb-10">
          <button
            className="bg-[#0369A1] hover:bg-[#025985] text-white font-semibold px-12 py-3 rounded-md"
            onClick={handleSubmit}
          >
            작성 완료
          </button>
        </div>
      </main>
    </div>
  );
};

export default WritePage;
