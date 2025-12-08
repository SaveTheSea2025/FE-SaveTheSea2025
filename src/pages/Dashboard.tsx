/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import { useEffect, useState } from "react";
import MainpageScrollReveal from "../components/main/MainpageScrollReveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

// ✅ ActivityRecord 타입 정의
interface ActivityRecord {
  id: number;
  name: string;
  thumbnail: string;
  totalWeight: number;
  memberCount: number;
}

function Dashboard() {
  const navigate = useNavigate();
  // ActivityRecord 타입이 정의되었다고 가정하고 사용합니다.
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [, setIsHeaderScrolled] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

  // ✅ 스크롤 감지 (모바일 snap 컨테이너용)
  useEffect(() => {
    const container = document.getElementById('scroll-container');

    const handleScroll = () => {
      if (container) {
        setIsHeaderScrolled(container.scrollTop > 100);
      }
    };

    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 모바일: 스냅 스크롤 / 데스크톱: 일반 플로우 */}
      <div className="md:contents snap-y snap-mandatory h-screen overflow-y-scroll md:overflow-visible">

        {/* 섹션 1: 메인 히어로 */}
        <div
          className="snap-start h-screen md:h-auto relative text-white flex flex-col"
          style={{
            backgroundImage: "url('/src/assets/main/backgroundimage.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Header forceScrolled={false} />

          {/* 메인 */}
          <section className="flex-1 md:py-32 flex flex-col justify-center items-center text-center px-4 pb-20">
            <h3 className="text-[20px] md:text-[40px] font-light tracking-wide mb-4 md:mb-0">
              바다를 향한 우리의 시선
            </h3>
            <h1 className="text-[48px] md:text-[140px] font-extrabold tracking-wider mb-8 md:mb-8">
              바 다 보 다
            </h1>

            {/* 모바일 신청 버튼 */}
            <button
              onClick={() => {
                const userAgent = navigator.userAgent || navigator.vendor;

                if (/android/i.test(userAgent)) {
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.letspl.oceankeeper&pcampaignid=web_share",
                    "_blank"
                  );
                } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
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
              className="md:hidden bg-[#72A0BF] text-white px-8 py-3 rounded-full text-[14px] font-medium hover:bg-[#5d8da8] transition"
            >
              해양 봉사활동 신청하러 가기 →
            </button>

            {/* 스크롤 다운 아이콘 (모바일 전용) */}
            <div className="md:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg
                className="w-6 h-6 text-white opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </section>
        </div>

        {/* 데스크톱 신청 버튼 바 */}
        <div
          className="hidden md:flex text-[24px] py-3 justify-center"
          style={{ backgroundColor: "#72A0BF" }}
        >
          <button
            onClick={() => {
              const userAgent = navigator.userAgent || navigator.vendor;

              if (/android/i.test(userAgent)) {
                window.open(
                  "https://play.google.com/store/apps/details?id=com.letspl.oceankeeper&pcampaignid=web_share",
                  "_blank"
                );
              } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
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
            className="text-white font-medium cursor-pointer hover:no-underline px-4"
          >
            해양 봉사활동 신청하러 가기 →
          </button>
        </div>

        {/* 섹션 2: 함께 만든 변화 */}
        <section className="snap-start h-screen md:h-auto bg-[#FAF9F6] md:pt-45 md:pb-20 flex flex-col justify-center items-center text-center px-4 py-10">
          {/* 상단 타이틀 */}
          <MainpageScrollReveal>
            <div className="mb-8 md:mb-10">
              <div className="inline-block bg-[#479BA4] text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[14px] md:text-[20px] font-semibold tracking-wide">
                함께 만든 변화
              </div>
              <p className="mt-3 md:mt-4 text-[#0F575F] text-[12px] md:text-[18px]">
                전국 해양정화 활동 현황
              </p>
            </div>
          </MainpageScrollReveal>

          {/* 가운데 아이콘 + 수거량 */}
          <MainpageScrollReveal delay={0.4}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-32 mt-6 md:mt-10 relative">
              {/* 아이콘 이미지 */}
              <img
                src="/src/assets/main/mainpage-cleanup.png"
                alt="cleanup"
                className="w-[100px] h-[100px] md:w-[260px] md:h-[260px]"
              />

              {/* 수거량 섹션 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-36 items-center md:-translate-x-8">
                <div>
                  <p className="text-[14px] md:text-[28px] text-[#0F575F] mb-2 md:mb-3 font-semibold">
                    수거량(kg)
                  </p>
                  <p className="text-[36px] md:text-[100px] font-extrabold text-[#0C4A6E]">
                    1,321
                  </p>
                </div>
                <div>
                  <p className="text-[14px] md:text-[28px] text-[#0F575F] mb-2 md:mb-3 font-semibold">
                    수거량(L)
                  </p>
                  <p className="text-[36px] md:text-[100px] font-extrabold text-[#0C4A6E]">
                    745
                  </p>
                </div>
              </div>
            </div>
          </MainpageScrollReveal>

          {/* 하단 활동건수 + 참여자수 */}
          <MainpageScrollReveal delay={0.6}>
            <div className="flex justify-center items-center gap-12 md:gap-44 mt-8 md:mt-20">
              <div>
                <p className="text-[14px] md:text-[28px] text-[#0F575F] mb-2 md:mb-3 font-semibold">
                  활동건수
                </p>
                <p className="text-[36px] md:text-[96px] font-extrabold text-[#0C4A6E]">
                  47
                </p>
              </div>
              <div>
                <p className="text-[14px] md:text-[28px] text-[#0F575F] mb-2 md:mb-3 font-semibold">
                  참여자수
                </p>
                <p className="text-[36px] md:text-[96px] font-extrabold text-[#0C4A6E]">
                  897
                </p>
              </div>
            </div>
          </MainpageScrollReveal>

          {/* 모바일 하단 버튼 */}
          <button
            onClick={() => navigate("/stats")}
            className="md:hidden mt-8 bg-[#72A0BF] text-white px-6 py-2 rounded-full text-[12px] font-medium hover:bg-[#5d8da8] transition"
          >
            해양 정화 지도 자세히 보기
          </button>
        </section>

        {/* 섹션 3: 현장의 이야기 */}
        <section className="snap-start h-screen md:h-auto bg-[#FAF9F6] md:pt-40 md:pb-80 flex flex-col justify-center items-center text-center px-4 py-10">
          {/* 상단 타이틀 */}
          <div className="mb-8 md:mb-10">
            <div className="inline-block bg-[#479BA4] text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[14px] md:text-[20px] font-semibold tracking-wide">
              현장의 이야기
            </div>
            <p className="mt-3 md:mt-4 text-[#0F575F] text-[12px] md:text-[18px]">
              전국 각지에서 진행된 해양 정화 활동
            </p>
          </div>

          {/* 모바일: 활동 카드 그리드 (2개) */}
          <div className="grid grid-cols-2 md:hidden gap-4 w-full max-w-sm mb-6">
            {activities.slice(0, 2).map((activity) => (
              <div
                key={activity.id}
                onClick={() => navigate("/records")}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
              >
                <img
                  src={activity.thumbnail}
                  alt={activity.name}
                  className="w-full h-28 object-cover"
                />
                <div className="p-3 text-left">
                  <h3 className="text-[12px] font-semibold text-[#0C4A6E] mb-2 truncate">
                    {activity.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-[#0C4A6E]">
                    <div className="flex items-center gap-1">
                      <img src="/src/assets/main/mainpage-trashcan.png" alt="trash" className="w-3 h-3" />
                      <span>{activity.totalWeight}kg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/src/assets/main/mainpage-people.png" alt="people" className="w-3 h-3" />
                      <span>{activity.memberCount}명</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱: Swiper */}
          <div className="hidden md:block w-[90%] max-w-7xl">
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
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={activity.thumbnail}
                      alt={activity.name}
                      className="w-full h-64 object-cover"
                    />

                    <div className="p-5 text-left">
                      <h3 className="text-[18px] font-semibold text-[#0C4A6E] mb-3 truncate">
                        {activity.name}
                      </h3>

                      <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-[#0C4A6E] text-[14px]">
                        <div className="flex items-center gap-5">
                          <div className="flex items-center gap-2">
                            <img
                              src="/src/assets/main/mainpage-trashcan.png"
                              alt="trash"
                              className="w-4 h-4"
                            />
                            <span>{activity.totalWeight}kg</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <img
                              src="/src/assets/main/mainpage-people.png"
                              alt="people"
                              className="w-4 h-4"
                            />
                            <span>{activity.memberCount}명</span>
                          </div>
                        </div>

                        <img
                          src="/src/assets/main/mainpage-arrow.png"
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

          {/* 모바일 하단 버튼 */}
          <button
            onClick={() => navigate("/records")}
            className="md:hidden mt-6 bg-[#72A0BF] text-white px-6 py-2 rounded-full text-[12px] font-medium hover:bg-[#5d8da8] transition"
          >
            해양 정화 사진첩 자세히 보기
          </button>
        </section>
      </div>

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
              <a
                href="https://www.youtube.com/@pq-8594"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/src/assets/main/mainpage-youtube.png"
                  alt="YouTube"
                  className="w-6 h-6 hover:opacity-80 transition-opacity"
                />
              </a>

              <a
                href="https://badanetwork.imweb.me/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/src/assets/main/mainpage-earth.png"
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