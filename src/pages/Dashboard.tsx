/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import MainpageScrollReveal from "../components/MainpageScrollReveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

// 💡 수정 1: ActivityRecord 타입 정의가 없으므로 임시로 정의합니다.
// 실제 프로젝트의 타입 파일에서 가져와야 합니다. (예: import type { ActivityRecord } from "../types/activity";)
interface ActivityRecord {
  id: number;
  thumbnail: string;
  name: string;
  totalWeight: number;
  memberCount: number;
}


function Dashboard() {
  const navigate = useNavigate();
  // ActivityRecord 타입이 정의되었다고 가정하고 사용합니다.
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${BASE_URL}/api/activity-records?page=0&size=50`);
        const result = await response.json();

        if (result.code === 0 && result.data?.content) {
          setActivities(result.data.content);
        } else {
          console.error("데이터 로드 실패:", result);
        }
      } catch (error) {
        console.error("API 호출 오류:", error);
      }
    };

    fetchActivities();
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-white custom-scroll">
      {/* 헤더까지 전체 배경 이미지 넣기 */}
      <div
        className="relative text-white"
        style={{
          backgroundImage: "url('/src/assets/backgroundimage.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >


        {/* 공용 컴포넌트에서 헤더씀 */}
        <Header />

        {/* 메인  */}
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
      <div
        className="text-[24px] py-3 flex justify-center text-decoration-none"
        style={{ backgroundColor: "#72A0BF" }}
      >
        <button
          onClick={() => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

            if (/android/i.test(userAgent)) {
              window.open(
                "https://play.google.com/store/apps/details?id=com.letspl.oceankeeper&pcampaignid=web_share",
                "_blank"
              );
            }
            // 💡 수정 2: window.MSStream 대신 타입 안전한 속성 존재 확인 사용
            else if (/iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window)) {
              window.open(
                "https://apps.apple.com/kr/app/%EC%98%A4%EC%85%98%ED%82%A4%ED%8D%BC/id6470431291",
                "_blank"
              );
            } else {
              window.open(
                "https://play.google.com/store/apps/details?id=com.letspl.oceankeeper&pcampaignid=web_share",
                "_blank"
              );
            }
          }}
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
          <div className="flex flex-col md:flex-row justify-center items-center gap-32 mt-10 relative">
            {/* 아이콘 이미지 */}
            <img
              src="/src/assets/mainpage-cleanup.png"
              alt="cleanup"
              className="w-[200px] h-[200px] md:w-[260px] md:h-[260px]"
            />

            {/* 수거량 섹션 - 왼쪽으로 약간 이동 */}
            <div className="flex flex-col md:flex-row gap-36 items-center md:-translate-x-8">
              <div>
                <p className="text-[24px] md:text-[28px] text-[#0F575F] mb-3 font-semibold">
                  수거량(kg)
                </p>
                <p className="text-[88px] md:text-[100px] font-extrabold text-[#0C4A6E]">
                  1,321
                </p>
              </div>
              <div>
                <p className="text-[24px] md:text-[28px] text-[#0F575F] mb-3 font-semibold">
                  수거량(L)
                </p>
                <p className="text-[88px] md:text-[100px] font-extrabold text-[#0C4A6E]">
                  745
                </p>
              </div>
            </div>
          </div>
        </MainpageScrollReveal>


        {/* 하단 활동건수 + 참여자수 */}
        <MainpageScrollReveal delay={0.6}>
          <div className="flex justify-center items-center gap-44 mt-20">
            <div>
              <p className="text-[24px] md:text-[28px] text-[#0F575F] mb-3 font-semibold">
                활동건수
              </p>
              <p className="text-[80px] md:text-[96px] font-extrabold text-[#0C4A6E]">
                47
              </p>
            </div>
            <div>
              <p className="text-[24px] md:text-[28px] text-[#0F575F] mb-3 font-semibold">
                참여자수
              </p>
              <p className="text-[80px] md:text-[96px] font-extrabold text-[#0C4A6E]">
                897
              </p>
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

        {/* 활동 카드 슬라이드 */}
        <div className="w-[90%] max-w-7xl">
          <Swiper
            key={activities.length}
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
            {activities.map((activity) => (
              <SwiperSlide key={activity.id}>
                <div
                  onClick={() => navigate("/records")}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* thumbnail 사용 */}
                  <img
                    src={activity.thumbnail}
                    alt={activity.name}
                    className="w-full h-64 object-cover"
                  />

                  {/* 카드 내용 - API 데이터 렌더링 */}
                  <div className="p-5 text-left">
                    <h3 className="text-[18px] font-semibold text-[#0C4A6E] mb-3 truncate">
                      {activity.name}
                    </h3>

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-[#0C4A6E] text-[14px]">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <img
                            src="/src/assets/mainpage-trashcan.png"
                            alt="trash"
                            className="w-4 h-4"
                          />
                          <span>{activity.totalWeight}kg</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <img
                            src="/src/assets/mainpage-people.png"
                            alt="people"
                            className="w-4 h-4"
                          />
                          <span>{activity.memberCount}명</span>
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