/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import Header from "../components/common/Header";
import { useAuth } from "../context/AuthContext";
import WasteSection from "../components/write/WasteSection";
import bluecheck from "../assets/write/bluecheck.png";
import PhotoUploadSection from "../components/write/PhotoUploadSection";
import backgroundimage2 from "@/assets/write/backgroundimage2.png";
import LocationSection from "../components/write/LocationSection";
import axios from "axios";


const WritePage = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ 추가

  const groupType = user?.memberType === "GROUP" ? "단체" : "개인";
  const groupName = user?.memberType === "GROUP"
    ? (user as any)?.organizationName || user?.userName || ""
    : user?.userName || "";

  const [description, setDescription] = useState("");
  const maxLength = 500;

  const [selectedRegion] = useState({ sido: "", sigungu: "" });
  const [loading, setLoading] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

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
  const [activityName, setActivityName] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [locationData, setLocationData] = useState<any>(null);

  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs > 0) {
        // 분 단위로 정확하게 계산
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        setVolunteerHours(diffMinutes);
      } else {
        setVolunteerHours(0);
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  const handleSubmit = async () => {
    try {
      const missing: string[] = [];
      const memberCountInput = document.getElementById("volunteerCount") as HTMLInputElement | null;
      const memberCount = Number(memberCountInput?.value || 0);

      if (!activityName.trim()) missing.push("activityName");
      if (!startDate || !startTime || !endDate || !endTime) missing.push("dateTime");
      if (memberCount <= 0) missing.push("memberCount");
      if (!locationData?.startAddress || !locationData?.endAddress) missing.push("location");

      if (missing.length > 0) {
        setMissingFields(missing);
        const first = missing[0];
        const targetId =
          first === "activityName" ? "activityName-input"
          : first === "dateTime" ? "dateTime-row"
          : first === "memberCount" ? "memberCount-input"
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

      const data = {
        groups: groupType === "단체",
        name: groupName || "테스트 단체",
        activeName: activityName || "봉사활동명 없음",
        memberCount,
        activityDescription: description || "활동 설명 없음",
        startDate: validStart,
        endDate: validEnd,
        totalActivityTime: volunteerHours,
        regionSido: locationData?.regionSido || selectedRegion.sido,
        regionSigungu: locationData?.regionSigungu || selectedRegion.sigungu,
        startAddress: locationData?.startAddress || "",
        endAddress: locationData?.endAddress || "",
        startLatitude: locationData?.startLat,
        startLongitude: locationData?.startLng,
        endLatitude: locationData?.endLat,
        endLongitude: locationData?.endLng,
        specialNote: specialNote || "특이사항 없음",
        wasteList,
        thumbnailIndex,
      };

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      photoFiles.forEach((file) => formData.append("photos", file));

      const response = await axios.post(
        `${BASE_URL}/api/activity-records`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.code === 0) {
        alert("활동 기록이 성공적으로 저장되었습니다.");
        // ✅ 성공 시 함께한 기록 페이지로 이동
        navigate("/records");
      } else {
        alert("⚠️ 저장 실패: " + (response.data.message || "알 수 없는 오류"));
      }
    } catch (error: any) {
      console.error("❌ 서버 오류:", error);
      if (error.response) console.log("📨 서버 응답:", error.response.data);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatVolunteerTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}시간 ${m}분`;
  };

  return (
    <div className="bg-white min-h-screen">
      <Header forceScrolled />

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3"></div>
          <p className="text-sm tracking-wide">사진 업로드 중입니다...</p>
        </div>
      )}

      <div
        className="w-full h-[200px] md:h-[300px] bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundimage2})` }}
      ></div>

      <main className="mt-8 md:mt-20 max-w-5xl mx-auto bg-white px-4 md:px-10 pb-10 relative z-10">
        <h2 className="text-[22px] md:text-[30px] font-bold text-center mb-8 md:mb-20 leading-normal">
          봉사활동 기록하기
        </h2>

        <section className="mb-10">
          <h3 className="text-base md:text-lg font-semibold mb-4">활동 정보</h3>

          {/* 데스크톱 버전 */}
          <div className="hidden md:block border border-gray-300 border-t-0 border-l-0 border-r-0">
            <div className="flex justify-end pr-4 py-2 text-sm text-gray-500">
              <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다
            </div>

            <table className="w-full border-collapse border-t border-gray-300 text-sm">
              <tbody>
                <tr className="border-t border-gray-300 align-top">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    구분<span className="text-red-500">*</span>
                  </th>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 mt-[2px]">
                        <label className="flex items-center gap-1.5 cursor-default">
                          <div className="relative w-4 h-4">
                            <input type="radio" name="group" checked={groupType === "단체"} readOnly className="sr-only" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              groupType === "단체" ? "border-[#0369A1]" : "border-gray-300"
                            }`}>
                              {groupType === "단체" && <div className="w-2 h-2 rounded-full bg-[#0369A1]"></div>}
                            </div>
                          </div>
                          <span className={groupType === "단체" ? "font-semibold text-[#0369A1]" : "text-gray-400"}>단체</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-default">
                          <div className="relative w-4 h-4">
                            <input type="radio" name="group" checked={groupType === "개인"} readOnly className="sr-only" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              groupType === "개인" ? "border-[#0369A1]" : "border-gray-300"
                            }`}>
                              {groupType === "개인" && <div className="w-2 h-2 rounded-full bg-[#0369A1]"></div>}
                            </div>
                          </div>
                          <span className={groupType === "개인" ? "font-semibold text-[#0369A1]" : "text-gray-400"}>개인</span>
                        </label>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <input
                            id="group-input"
                            type="text"
                            value={groupName}
                            disabled
                            className="border border-gray-300 bg-gray-100 rounded px-3 py-1.5 w-64 text-gray-500 cursor-not-allowed"
                          />
                          <img src={bluecheck} alt="check" className="w-5 h-5" />
                          <p className="text-xs text-gray-400">로그인 정보에서 자동 입력됨</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

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
                      className={`w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                        missingFields.includes("activityName") ? "border-red-500" : ""
                      }`}
                    />
                  </td>
                </tr>

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
                        className={`border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[180px] ${
                          missingFields.includes("dateTime") ? "border-red-500" : ""
                        }`}
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-2 py-[7px] w-[120px] ${
                          missingFields.includes("dateTime") ? "border-red-500" : ""
                        }`}
                      />
                      <span className="text-gray-500 text-[20px] mx-1">~</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-3 py-[7px] w-[180px] ${
                          missingFields.includes("dateTime") ? "border-red-500" : ""
                        }`}
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={`border border-gray-200 bg-gray-50 rounded-md px-2 py-[7px] w-[120px] ${
                          missingFields.includes("dateTime") ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f5f6f8] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    봉사활동 시간
                  </th>
                  <td className="p-0">
                    <div className="flex">
                      <div className="flex items-center justify-center w-1/3 border-r border-gray-300 bg-white text-sm text-gray-800">
                        <span>{formatVolunteerTime(volunteerHours)}</span>
                      </div>
                      <div className="flex items-center justify-start w-1/3 bg-[#f5f6f8] border-r border-gray-300 px-6 py-3">
                        <label className="font-medium text-gray-800">
                          봉사활동 인원 <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-start w-1/3 bg-white px-6 py-3">
                        <div
                          id="memberCount-input"
                          className={`flex items-center border rounded-md overflow-hidden ${
                            missingFields.includes("memberCount") ? "border-red-500" : "border-gray-300"
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
                    <div className={`text-right text-xs mt-1 ${
                      description.length >= maxLength ? "text-red-500 font-semibold" : "text-gray-500"
                    }`}>
                      {description.length}/{maxLength}자
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 모바일 버전 */}
          <div className="md:hidden space-y-4">
            <p className="text-xs text-gray-500 text-right mb-2">
              <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다
            </p>

            <div className="border-t border-b border-gray-200 py-4">
              <label className="block text-sm font-semibold mb-3">
                구분 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm cursor-default">
                  <div className="relative w-4 h-4">
                    <input type="radio" name="group" checked={groupType === "단체"} readOnly className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      groupType === "단체" ? "border-[#0369A1]" : "border-gray-300"
                    }`}>
                      {groupType === "단체" && <div className="w-2 h-2 rounded-full bg-[#0369A1]"></div>}
                    </div>
                  </div>
                  <span className={groupType === "단체" ? "font-semibold text-[#0369A1]" : "text-gray-400"}>단체</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-default">
                  <div className="relative w-4 h-4">
                    <input type="radio" name="group" checked={groupType === "개인"} readOnly className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      groupType === "개인" ? "border-[#0369A1]" : "border-gray-300"
                    }`}>
                      {groupType === "개인" && <div className="w-2 h-2 rounded-full bg-[#0369A1]"></div>}
                    </div>
                  </div>
                  <span className={groupType === "개인" ? "font-semibold text-[#0369A1]" : "text-gray-400"}>개인</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="group-input"
                  type="text"
                  value={groupName}
                  disabled
                  className="flex-1 border bg-gray-100 rounded px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed border-gray-300"
                />
                <img src={bluecheck} alt="check" className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-400 mt-2">로그인 정보에서 자동 입력됨</p>
            </div>

            <div className="border-b border-gray-200 py-4">
              <label className="block text-sm font-semibold mb-3">
                봉사활동 명 <span className="text-red-500">*</span>
              </label>
              <input
                id="activityName-input"
                type="text"
                placeholder="봉사활동 명을 입력해주세요."
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className={`w-full border bg-white rounded px-3 py-2.5 text-sm ${
                  missingFields.includes("activityName") ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div id="dateTime-row" className="border-b border-gray-200 py-4">
              <label className="block text-sm font-semibold mb-3">
                활동 일자 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`flex-1 border bg-white rounded px-3 py-2.5 text-sm ${
                      missingFields.includes("dateTime") ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-28 border bg-white rounded px-2 py-2.5 text-sm ${
                      missingFields.includes("dateTime") ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-center py-1">
                  <span className="text-gray-400 text-lg">~</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`flex-1 border bg-white rounded px-3 py-2.5 text-sm ${
                      missingFields.includes("dateTime") ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-28 border bg-white rounded px-2 py-2.5 text-sm ${
                      missingFields.includes("dateTime") ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 py-4">
              <label className="block text-sm font-semibold mb-3">봉사활동 시간</label>
              <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-center text-gray-700 text-sm">
                {formatVolunteerTime(volunteerHours)}
              </div>
            </div>

            <div className="border-b border-gray-200 py-4">
              <label className="block text-sm font-semibold mb-3">
                봉사활동 인원 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-between">
                <div
                  id="memberCount-input"
                  className={`flex items-center border rounded-lg overflow-hidden ${
                    missingFields.includes("memberCount") ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 bg-white text-lg"
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
                    className="w-20 h-12 text-center text-gray-800 outline-none bg-white text-base"
                  />
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 bg-white text-lg"
                    onClick={() => {
                      const input = document.getElementById("volunteerCount") as HTMLInputElement;
                      const val = Number(input.value) + 1;
                      input.value = String(val);
                    }}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-700 ml-2">명</span>
              </div>
            </div>

            <div className="border-b border-gray-200 py-4">
              <label className="block text-sm font-semibold mb-3">활동 동기 및 설명</label>
              <textarea
                rows={4}
                maxLength={maxLength}
                placeholder="내용은 500자까지 입력 가능합니다."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
              ></textarea>
              <div className={`text-right text-xs mt-1 ${
                description.length >= maxLength ? "text-red-500 font-semibold" : "text-gray-500"
              }`}>
                {description.length}/{maxLength}자
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 md:mt-20">
          <PhotoUploadSection onChange={setPhotoFiles} onFavoriteChange={setThumbnailIndex} />
        </div>

        <div className="mt-12 md:mt-20 mb-12 md:mb-20">
          <section id="location-section">
            <LocationSection onChange={setLocationData} />
          </section>
        </div>

        <WasteSection onChange={setWasteList} />

        <section className="mb-16 md:mb-25 mt-12 md:mt-20">
          <h3 className="text-base md:text-lg font-semibold mb-4">느낀점 & 특이사항</h3>
          <div className="border border-gray-300 border-l-0 border-r-0 bg-white p-4">
            <textarea
              placeholder="특이사항이 있으면 적어주세요. ex) 기타 폐기물 종류, 특이한 폐기물 발견"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              className="w-full bg-[#f7f8fa] border border-gray-300 rounded px-3 py-2 text-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
            />
          </div>
        </section>

        <div className="text-center mb-12 md:mb-20">
          <button
            className="bg-[#0369A1] hover:bg-[#025985] text-white font-semibold px-8 md:px-12 py-3 rounded-md w-full md:w-auto text-sm md:text-base"
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