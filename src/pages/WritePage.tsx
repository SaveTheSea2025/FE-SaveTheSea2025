/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Header from "../components/Header";
import WasteSection from "../components/WasteSection";
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

  const [selectedRegion] = useState({ sido: "", sigungu: "" });

  const [loading, setLoading] = useState(false);

  // 🚨 필수항목 누락용 상태
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // 활동 시간 관련
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [volunteerHours, setVolunteerHours] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [wasteList, setWasteList] = useState<
    { wasteType: string; wasteWeight: number; wasteVolume: number }[]
  >([]);
  const [activityName, setActivityName] = useState(""); // 봉사활동명
  const [specialNote, setSpecialNote] = useState(""); // 특이사항
  const [locationData, setLocationData] = useState<any>(null);

  // ✅ 활동 시간 자동 계산
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs > 0) {
        const diffHours = diffMs / (1000 * 60 * 60);
        setVolunteerHours(Math.floor(diffHours * 10) / 10);
      } else {
        setVolunteerHours(0);
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  // ====================== 활동 등록 ======================
  const handleSubmit = async () => {
    try {
      const missing: string[] = [];
      const memberCountInput = document.getElementById("volunteerCount") as HTMLInputElement | null;
      const memberCount = Number(memberCountInput?.value || 0);

      // 🚨 필수 필드 체크
      if (!groupName.trim()) missing.push("groupName");
      if (!activityName.trim()) missing.push("activityName");
      if (!startDate || !startTime || !endDate || !endTime) missing.push("dateTime");
      if (memberCount <= 0) missing.push("memberCount");
      if (!locationData?.startAddress || !locationData?.endAddress) missing.push("location");

      if (missing.length > 0) {
        setMissingFields(missing);

        // 첫 번째 누락된 항목으로 스크롤 이동
        const first = missing[0];
        const targetId =
          first === "groupName"
            ? "group-input"
            : first === "activityName"
              ? "activityName-input"
              : first === "dateTime"
                ? "dateTime-row"
                : first === "memberCount"
                  ? "memberCount-input"
                  : "location-section";

        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

        alert("⚠️ 필수 항목을 모두 입력해주세요.");
        return;
      }

      setMissingFields([]);
      setLoading(true);
      await new Promise((r) => setTimeout(r, 80));

      const validStart = `${startDate}T${startTime}`;
      const validEnd = `${endDate}T${endTime}`;






      const startLatitude = locationData?.startLat ?? 0;
      const startLongitude = locationData?.startLng ?? 0;
      const endLatitude = locationData?.endLat ?? 0;
      const endLongitude = locationData?.endLng ?? 0;


      const data = {
        groups: groupType === "단체",
        name: groupName || "테스트 단체",
        activeName: activityName || "봉사활동명 없음",
        memberCount,
        activityDescription: description || "활동 설명 없음",
        startDate: validStart,
        endDate: validEnd,
        totalActivityTime,
        regionSido: locationData?.regionSido || selectedRegion.sido,
        regionSigungu: locationData?.regionSigungu || selectedRegion.sigungu,
        startAddress: locationData?.startAddress || "",
        endAddress: locationData?.endAddress || "",
        startLatitude,
        startLongitude,
        endLatitude,
        endLongitude,
        specialNote: specialNote || "특이사항 없음",
        wasteList,
        thumbnailIndex,
      };

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      photoFiles.forEach((file) => formData.append("photos", file));

      const response = await axios.post(
        "https://be-savethesea2025.onrender.com/api/activity-records",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.code === 0) alert("✅ 활동 기록이 성공적으로 저장되었습니다.");
      else alert("⚠️ 저장 실패: " + (response.data.message || "알 수 없는 오류"));
    } catch (error: any) {
      console.error("❌ 서버 오류:", error);
      if (error.response) console.log("📨 서버 응답:", error.response.data);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const totalActivityTime = (() => {
    const hours = Math.floor(volunteerHours);
    const minutes = Math.round((volunteerHours - hours) * 60);
    return `${hours}시간 ${minutes}분`;
  })();


  // ============================================================

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* ✅ 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3"></div>
          <p className="text-sm tracking-wide">사진 업로드 중입니다...</p>
        </div>
      )}

      <div
        className="w-full h-[300px] bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/backgroundimage2.png')" }}
      ></div>

      <main className="mt-20 max-w-5xl mx-auto bg-white p-10 relative z-10">
        <h2 className="text-[30px] font-bold text-center mb-20 leading-normal font-['Noto_Sans_KR']">
          봉사활동 기록하기
        </h2>

        {/* ===================== 활동 정보 ===================== */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-4">활동 정보</h3>

          <div
            className="border border-gray-300 w-full"
            style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}
          >
            <div className="flex justify-end pr-4 py-2 text-sm text-gray-500">
              <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다
            </div>

            <table className="w-full border-collapse border-t border-gray-300 text-sm">
              <tbody>
                {/* 구분 */}
                <tr className="border-t border-gray-300 align-top">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    구분<span className="text-red-500">*</span>
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
                            id="group-input"
                            type="text"
                            placeholder={groupType === "단체" ? "단체명을 입력해주세요." : "이름을 입력해주세요."}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value.replace(/\s+/g, ""))}
                            className={`border border-gray-300 bg-gray-50 rounded px-3 py-1.5 w-64 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 ${missingFields.includes("groupName") ? "border-red-500" : ""
                              }`}
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
                      id="activityName-input"
                      type="text"
                      placeholder="봉사활동 명을 입력해주세요."
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      className={`w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 ${missingFields.includes("activityName") ? "border-red-500" : ""
                        }`}
                    />
                  </td>
                </tr>

                {/* 활동 일자 */}
                <tr id="dateTime-row" className="border-t border-gray-300">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    활동 일자 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[180px] ${missingFields.includes("dateTime") ? "border-red-500" : ""
                          }`}
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-2 py-[7px] w-[120px] ${missingFields.includes("dateTime") ? "border-red-500" : ""
                          }`}
                      />
                      <span className="text-gray-500 text-[20px] mx-1">~</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[180px] ${missingFields.includes("dateTime") ? "border-red-500" : ""
                          }`}
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-2 py-[7px] w-[120px] ${missingFields.includes("dateTime") ? "border-red-500" : ""
                          }`}
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
                        <span>
                          {Math.floor(volunteerHours)}시간 {Math.round((volunteerHours - Math.floor(volunteerHours)) * 60)}분
                        </span>

                      </div>

                      <div className="flex items-center justify-start w-1/3 bg-[#f5f6f8] border-r border-gray-300 px-6 py-3">
                        <label className="font-medium text-gray-800">
                          봉사활동 인원 <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-start w-1/3 bg-white px-6 py-3">
                        <div
                          id="memberCount-input"
                          className={`flex items-center border rounded-md overflow-hidden ${missingFields.includes("memberCount")
                            ? "border-red-500"
                            : "border-gray-300"
                            }`}
                        >
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
                    활동 동기 및 설명
                  </th>
                  <td className="px-4 py-3">
                    <textarea
                      rows={4}
                      maxLength={maxLength}
                      placeholder="내용은 500자까지 입력 가능합니다."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
                    ></textarea>
                    <div
                      className={`text-right text-xs mt-1 ${description.length >= maxLength
                        ? "text-red-500 font-semibold"
                        : "text-gray-500"
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
        <div className="mt-20">
          <PhotoUploadSection onChange={setPhotoFiles} onFavoriteChange={setThumbnailIndex} />
        </div>

        {/* ===================== 활동 위치 ===================== */}
        <div className="mt-20 mb-20">
          <section id="location-section">
            <LocationSection onChange={setLocationData} />
          </section>
        </div>
        {/* ===================== 폐기물 ===================== */}
        <WasteSection onChange={setWasteList} />

        {/* ===================== 특이사항 ===================== */}
        <section className="mb-25 mt-20">
          <h3 className="text-lg font-semibold mb-4">느낀점 & 특이사항</h3>
          <div className="border border-gray-300 border-l-0 border-r-0 bg-white p-4">
            <textarea
              placeholder="특이사항이 있으면 적어주세요. ex) 기타 폐기물 종류, 특이한 폐기물 발견"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              className="w-full bg-[#f7f8fa] border border-gray-300 rounded px-3 py-2 text-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </section>

        {/* 작성 완료 버튼 */}
        <div className="text-center mb-20">
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