import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex justify-between items-center  pl-10 pr-18 py-4">
      {/* relative 위치 고정 기준점임! / z 로 앞에 올라오게 만들기 
      */}
      {/* 로고 */}
      <div className="flex items-center space-x-2">
        <img
          src="/src/assets/logoimage.png"
          alt="바다보다 로고"
          className="w-[64px] h-[64px] object-contain" // object : 이미지 안 잘리게 할라꼬
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[20px]  text-[#FAF9F6] pr-10 font-semibold text-white">바다보다</span>
          <span className="text-[15px] text-[#FAF9F6]">Ocean Cleanup Platform</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex space-x-30 text-[20px] text-white font-medium">
        <button className="text-[#FAF9F6] hover:text-sky-200">함께한 기록</button>
        <button className="text-[#FAF9F6] hover:text-sky-200">통계</button>
        <button className="text-[#FAF9F6] hover:text-sky-200">발걸음</button>
      </nav>

      {/* 우측 버튼 */}
      <div className="flex items-center space-x-13">
        <button
          onClick={() => navigate("/calendar")}
          className="text-[20px] bg-white text-sky-600 px-5 py-2 rounded-full font-medium hover:bg-sky-100 transition flex items-center gap-2"
        >
        <span>작성하기</span>
        <img
          src="/src/assets/headerpen.png"
          alt="작성하기 아이콘"
          className="w-[18px] h-[18px]"
        />
        </button>
        <button 
          onClick={() => navigate("/calendar")}
          className="cursor-pointer text-[17px] flex items-center gap-2 text-gray-100 text-sm hover:text-white">
          <span>로그인이 필요합니다</span>
          <img
            src="/src/assets/headerprofile.png"
            alt="프로필 아이콘"
            className="w-5 h-5"
            />
        </button>
      </div>
    </header>
  );
}

export default Header;
