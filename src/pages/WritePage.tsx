/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback ,useRef } from "react";
import Header from "../components/Header";
import WasteSection from "../components/WasteSection";
import KakaoMap from "../components/KakaoMap";
import { loadKakao } from "../lib/loadKakao";
import graycheck from "/src/assets/graycheck.png";
import bluecheck from "/src/assets/bluecheck.png";
import PhotoUploadSection from "../components/PhotoUploadSection";




const WritePage = () => {
  const [description, setDescription] = useState("");
  const maxLength = 500;
  const [groupType, setGroupType] = useState("단체");
  const [groupName, setGroupName] = useState("");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);
  const [endPos, setEndPos] = useState<{ lat: number; lng: number } | null>(null);

  const geocode = useCallback(async (addr: string) => {
    if (!addr?.trim()) return null;
    await loadKakao();
    const geocoder = new window.kakao.maps.services.Geocoder();
    return await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      geocoder.addressSearch(addr, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const { x, y } = result[0]; // x: lng, y: lat
          resolve({ lat: Number(y), lng: Number(x) });
        } else resolve(null);
      });
    });
  }, []);

  const handleSearchStart = useCallback(async () => {
    const pos = await geocode(startText);
    setStartPos(pos);
    if (!pos) alert("출발지 주소를 찾을 수 없습니다. 다시 입력해주세요.");
  }, [geocode, startText]);

  const handleSearchEnd = useCallback(async () => {
    const pos = await geocode(endText);
    setEndPos(pos);
    if (!pos) alert("종료지 주소를 찾을 수 없습니다. 다시 입력해주세요.");
  }, [geocode, endText]);

 


  return (
    <div className="bg-white min-h-screen">
      {/* 공용 Header */}
      <Header />

      {/* 상단 배경 이미지  */}
      <div
        className="w-full h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/src/assets/backgroundimage2.png')",
        }}
      ></div>

      {/* 전체 */}
      <main className="max-w-5xl mx-auto bg-white  p-10 mt-0 relative z-10">
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-center mb-10">
          봉사활동 기록하기
        </h2>

        {/* ===================== 활동 정보 ===================== */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-4">활동 정보</h3>

          <div className="border border-gray-300 w-full"
            style={{
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none"
            }}>
            <div className="flex justify-end pr-4 py-2 text-sm text-gray-500">
              <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다
            </div>

            <table className="w-full border-collapse border-t border-gray-300 text-sm">
              <tbody>
                {/* 구분 */}
                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f3f4f6] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    구분
                  </th>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <label className="flex items-center gap-1">
                      <input type="radio" name="group" defaultChecked /> 단체
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="group" /> 개인
                    </label>
                    
                    {/* 단체명 입력 */}
                    <input
                      type="text"
                      placeholder="단체명을 입력해주세요."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="border border-gray-200 bg-gray-50 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />

                    {/* ✅ 입력 여부에 따른 체크 아이콘 */}
                    <img
                      src={groupName.trim() ? bluecheck : graycheck}
                      alt="check"
                      className="w-5 h-5"
                    />
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
                  <td className="px-4 py-3 flex items-center gap-2">
                    <input
                      type="date"
                      className="border border-gray-200 bg-gray-50 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                    <input
                      type="time"
                      className="border border-gray-200 bg-gray-50 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="date"
                      className="border border-gray-200 bg-gray-50 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                    <input
                      type="time"
                      className="border border-gray-200 bg-gray-50 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                  </td>
                </tr>

                {/* 봉사활동 시간 / 인원 */}
                <tr className="border-t border-gray-300">
                  <th className="w-40 bg-[#f5f6f8] border-r border-gray-300 px-4 py-3 text-left font-medium">
                    봉사활동 시간
                  </th>
                  <td className="p-0">
                    <div className="flex">
                      {/* 시간 */}
                      <div className="flex items-center justify-center w-1/3 border-r border-gray-300 bg-white text-sm text-gray-800">
                        <span>0 시간</span>
                      </div>

                      {/* 봉사활동 인원  */}
                      <div className="flex items-center justify-start w-1/3 bg-[#f5f6f8] border-r border-gray-300 px-6 py-3">
                        <label className="font-medium text-gray-800">
                          봉사활동 인원 <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* 숫자 적는 칸 */}
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

                    {/* ✅ 글자 수 표시 (textarea 바깥 하단 정렬) */}
                    <div className="text-right text-gray-500 text-xs mt-1">
                      {description.length}/{maxLength}자
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>




        {/* ===================== 활동 사진 첨부 ===================== */}
        <PhotoUploadSection/>


        {/* ===================== 활동 위치 ===================== */}
        <section className="mb-10">
          <h3 className="text-[22px] font-semibold mb-4">활동 위치</h3>

          {/* STEP 1 지역 선택 */}
          <p className="text-[#0071CE] font-semibold mb-2">
            STEP 1 <span className="text-black font-normal">지역 선택</span>
          </p>

          <div className="border border-gray-300 border-l-0 border-r-0 text-sm">
            {/* 첫 번째 줄 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
                시/도
              </div>
              <div className="px-4 py-3 border-r border-gray-300 bg-[#f7f8fa]">
                <select className="w-full border border-gray-300 bg-white rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option>선택</option>
                </select>
              </div>
              <div className="bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
                시·군·구
              </div>
              <div className="px-4 py-3 bg-[#f7f8fa]">
                <select className="w-full border border-gray-300 bg-white rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option>선택</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2 출발/종료지점 선택 */}
          <p className="text-[#0071CE] font-semibold mt-8 mb-2">
            STEP 2 <span className="text-black font-normal">출발·종료지점 선택</span>
          </p>

          {/* 출발지점 */}
          <div className="border border-gray-300 border-l-0 border-r-0 text-sm mb-2">
            <div className="flex border-b border-gray-300">
              <div className="w-1/5 bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
                출발지점
              </div>
              <div className="w-4/5 px-4 py-3 bg-[#f7f8fa] flex gap-2">
                <input
                  type="text"
                  placeholder="예) 강원 강릉시 강문동 000-0"
                  value={startText}
                  onChange={(e) => setStartText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchStart()}
                  className="flex-1 bg-[#f7f8fa] border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  type="button"
                  onClick={handleSearchStart}
                  className="whitespace-nowrap px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 출발지 지도 */}
          <div className="w-full mb-6">
            <KakaoMap
              center={startPos ?? { lat: 37.5665, lng: 126.978 }}
              markers={startPos ? [{ ...startPos, title: "출발지점" }] : []}
            />
          </div>

          {/* 종료지점 */}
          <div className="border border-gray-300 border-l-0 border-r-0 text-sm mb-2">
            <div className="flex border-b border-gray-300">
              <div className="w-1/5 bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
                종료지점
              </div>
              <div className="w-4/5 px-4 py-3 bg-[#f7f8fa] flex gap-2">
                <input
                  type="text"
                  placeholder="예) 강원 강릉시 경포동 000-0"
                  value={endText}
                  onChange={(e) => setEndText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchEnd()}
                  className="flex-1 bg-[#f7f8fa] border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  type="button"
                  onClick={handleSearchEnd}
                  className="whitespace-nowrap px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 종료지 지도 */}
          <div className="w-full">
            <KakaoMap
              center={endPos ?? { lat: 37.5665, lng: 126.978 }}
              markers={endPos ? [{ ...endPos, title: "종료지점" }] : []}
            />
          </div>


        </section>


        {/* ===================== 폐기물 ===================== */}
        <WasteSection />

        {/* ===================== 특이사항 ===================== */}
        <section className="mb-16">
          <h3 className="text-[22px] font-semibold mb-3">특이사항</h3>
          <div className="border border-gray-300 border-l-0 border-r-0 bg-[#f7f8fa] p-4">
            <textarea
              placeholder="특이사항이 있으면 적어주세요."
              className="w-full bg-[#f7f8fa] border border-gray-300 rounded px-3 py-2 text-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
            ></textarea>
          </div>
        </section>

        {/* 작성 완료 버튼 */}
        <div className="text-center mb-10">
          <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-12 py-3 rounded-md">
            작성 완료
          </button>
        </div>


      </main>
    </div>
  );
};

export default WritePage;
