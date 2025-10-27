// 카카오맵 주소키 24e7f8fbd35263fc2d3d34a6b9ea6f69

import React from "react";
import Header from "../components/Header/Header";
import WasteSection from "../components/Header/WasteSection";
import KakaoMapSection from "../components/Header/Map/KakaoMapSection";


const WritePage = () => {
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
            borderTop:"none",
            borderLeft:"none",
            borderRight:"none"
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
                    <input
                    type="text"
                    placeholder="단체명을 입력해주세요."
                    className="border border-gray-200 bg-gray-50 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                    <span className="text-gray-400 cursor-pointer">✔️</span>
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
                    placeholder="내용은 500자까지 입력 가능합니다."
                    className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    ></textarea>
                    <div className="text-right text-gray-500 text-xs mt-1">0/500자</div>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
        </section>




        {/* ===================== 활동 사진 첨부 ===================== */}
        <section className="mb-30 mt-30 ">
          <h3 className="text-lg font-semibold mb-4">활동 사진 첨부</h3>
          <div className="border border-gray-300  p-6"
          style={{
            borderLeft:"none",
            borderRight:"none"
          }}>
            <p className="text-sm text-gray-600 mb-2">
            이미지는 최대 10장, 3MB 이하로 업로드할 수 있습니다.<br />
            등록 가능한 형식: jpg, jpeg, bmp, png, gif<br />
            대표사진을 지정하지 않으면, 첫 번째 이미지가 자동으로 대표로 설정됩니다.
            </p>
            <div className="flex gap-4 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[140px] h-[140px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"
                >
                  +
                </div>
              ))}
            </div>
            <button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-md">
              첨부파일 등록
            </button>
          </div>
        </section>

       
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
          <KakaoMapSection/>
        </section>


        {/* ===================== 폐기물 ===================== */}
        <WasteSection/>

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
        <script
          className="px-12 p-3"
          type="text/javascript"
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=24e7f8fbd35263fc2d3d34a6b9ea6f69&libraries=services"
        ></script>



      </main>
    </div>
  );
};

export default WritePage;
