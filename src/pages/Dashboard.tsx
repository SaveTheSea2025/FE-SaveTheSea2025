import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MainpageScrollReveal from "../components/MainpageScrollReveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 헤더까지 전체 배경 이미지 넣기 */}
      <div
        className="relative text-white" //
        style={{
          backgroundImage: "url('/src/assets/backgroundimage.png')", // ocean 배경
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >


        {/* 공용 컴포넌트에서 헤더씀 */}
        <Header />

        {/* 메인  */}
        <section className="relative z-10 flex flex-col justify-center items-center text-center py-32">
          <h3 className="text-[40px] font-light tracking-wide">
            바다를 향한 우리의 시선
          </h3>
          <h1 className="text-[140px] font-extrabold tracking-wider mb-8">
            바 다 보 다
          </h1>
        </section>
      </div>

      {/* 신청하러 가기 버튼 */}
      <div className="text-[24px] py-3 flex justify-center text-decoration-none"
        style={{ backgroundColor: "#72A0BF" }}>
        <button
          onClick={() => navigate("/calendar")}
          className="text-white font-medium cursor-pointer hover:no-underline focus:no-underline active:no-underline"
        >
          해양 봉사활동 신청하러 가기 →
        </button>
      </div>

      {/* 함께 만든 변화 섹션 */}
      <section className="bg-[#FAF9F6] pt-45 pb-20 flex flex-col items-center text-center">
        {/* 상단 타이틀 */}
        <MainpageScrollReveal>
          <div className="mb-10">
            <div className="inline-block bg-[#479BA4] text-white px-8 py-3 rounded-full text-[20px] font-semibold tracking-wide">
              함께 만든 변화
            </div>
            <p className="mt-4 text-[#0F575F] text-[18px]">
              전국 해양정화 활동 현황
            </p>
          </div>
        </MainpageScrollReveal>

        {/* 가운데 아이콘 + 수거량 */}
        <MainpageScrollReveal delay={0.4}>
          <div className="flex flex-col md:flex-row justify-center items-center gap-16 mt-14">
            {/* 아이콘 이미지 */}
            <img
              src="/src/assets/mainpage-cleanup.png"
              alt="cleanup"
              className="w-[160px] h-[160px]"
            />

            {/* 수거량 통계 */}
            <div className="flex flex-col md:flex-row gap-20 items-center">
              <div>
                <p className="text-[20px] text-[#0F575F] mb-2 font-medium">
                  수거량(kg)
                </p>
                <p className="text-[80px] font-extrabold text-[#0C4A6E]">1,321</p>
              </div>
              <div>
                <p className="text-[20px] text-[#0F575F] mb-2 font-medium">
                  수거량(L)
                </p>
                <p className="text-[80px] font-extrabold text-[#0C4A6E]">745</p>
              </div>
            </div>
          </div>
        </MainpageScrollReveal>

        {/* 하단 활동건수 + 참여자수 */}
        <MainpageScrollReveal delay={0.6}>
          <div className="flex justify-center items-center gap-28 mt-16">
            <div>
              <p className="text-[20px] text-[#0F575F] mb-2 font-medium">활동건수</p>
              <p className="text-[72px] font-extrabold text-[#0C4A6E]">47</p>
            </div>
            <div>
              <p className="text-[20px] text-[#0F575F] mb-2 font-medium">참여자수</p>
              <p className="text-[72px] font-extrabold text-[#0C4A6E]">897</p>
            </div>
          </div>
        </MainpageScrollReveal>
      </section>

      {/* 현장의 이야기 섹션 */}
      <section className="bg-[#FAF9F6] pt-40 pb-80 flex flex-col items-center text-center">
        {/* 상단 타이틀 */}
        <div className="mb-10">
          <div className="inline-block bg-[#479BA4] text-white px-8 py-3 rounded-full text-[20px] font-semibold tracking-wide">
            현장의 이야기
          </div>
          <p className="mt-4 text-[#0F575F] text-[18px]">
            전국 각지에서 진행된 해양 정화 활동
          </p>
        </div>

        {/* 카드 슬라이더 */}
        <div className="w-[90%] max-w-7xl">
          <Swiper
            spaceBetween={40}
            slidesPerView={3}
            loop={true}
            speed={1700}
            autoplay={{
              delay: 700,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="mySwiper"
          >
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                  {/* 이미지 자리 */}
                  <div className="w-full h-64 bg-gray-200 rounded-t-2xl"></div>

                  {/* 카드 내용 */}
                  <div className="p-5 text-left">
                    <h3 className="text-[18px] font-semibold text-[#0C4A6E] mb-3">
                      바다사랑 환경단체
                    </h3>

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-[#0C4A6E] text-[14px]">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <img
                            src="/src/assets/mainpage-trashcan.png"
                            alt="trash"
                            className="w-4 h-4"
                          />
                          <span>26.5kg</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <img
                            src="/src/assets/mainpage-people.png"
                            alt="people"
                            className="w-4 h-4"
                          />
                          <span>14명</span>
                        </div>
                      </div>

                      <img
                        src="/src/assets/mainpage-arrow.png"
                        alt="arrow"
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C4A6E] text-white py-14 px-8 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          {/* 왼쪽: 소개 */}
          <div className="flex-1">
            <h3 className="text-[18px] font-semibold mb-4">
              바다보다 | Ocean Cleanup Platform
            </h3>
            <p className="text-[14px] leading-relaxed text-gray-200">
              바다보다(Ocean Cleanup Platform)는 해양 환경 보호와 <br />
              시민 참여를 통해 더 깨끗한 바다를 만들어가는 플랫폼입니다. <br />
              당신의 한 걸음이 바다의 변화를 만듭니다.
            </p>
          </div>

          {/* 가운데: 이용안내 */}
          <div className="flex-1">
            <h3 className="text-[18px] font-semibold mb-4">이용안내</h3>
            <ul className="space-y-2 text-[14px] text-gray-200">
              <li>이용약관</li>
              <li>개인정보처리방침</li>
              <li>문의하기</li>
              <li>FAQ</li>
            </ul>
          </div>

          {/* 오른쪽: 팔로우하기 */}
          <div className="flex-1 text-right">
            <h3 className="text-[18px] font-semibold mb-4">팔로우하기</h3>
            <div className="flex justify-end gap-4 mb-4">
              {/* 유튜브 */}
              <a
                href="https://www.youtube.com/@pq-8594"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/src/assets/mainpage-youtube.png"
                  alt="YouTube"
                  className="w-6 h-6 hover:opacity-80 transition-opacity"
                />
              </a>

              {/* 지구 아이콘 */}
              <a
                href="https://badanetwork.imweb.me/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/src/assets/mainpage-earth.png"
                  alt="Website"
                  className="w-6 h-6 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>

            <p className="text-[12px] text-gray-300">
              © 2025 바다보다 | Ocean Cleanup Platform <br className="md:hidden" />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}


export default Dashboard;
