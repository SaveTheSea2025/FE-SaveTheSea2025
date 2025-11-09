// ✅ Header.tsx
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  forceScrolled?: boolean; // ✅ 외부에서 색상 강제 지정 가능
}

function Header({ forceScrolled = false }: HeaderProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (forceScrolled) return; // 강제 모드일 때 스크롤 이벤트 무시

    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceScrolled]);

  const scrolled = forceScrolled || isScrolled; // ✅ 강제 or 스크롤

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-2"
        }`}
      style={{
        backgroundColor: scrolled ? "rgba(255, 255, 255, 1)" : "transparent", // ✅ [변경] 90% 투명 흰색 배경
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-10">
        {/* ✅ 로고 (누르면 홈으로 이동) */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/src/assets/logoimage.png"
            alt="바다보다 로고"
            className="w-[57px] h-[57px] object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span
              className={`font-semibold ${scrolled
                ? "text-sky-700 text-[17px]"
                : "text-white text-[20px]"
                }`}
            >
              바다보다
            </span>
            <span
              className={`${scrolled
                ? "text-sky-600 text-[12px]"
                : "text-white text-[12px]"
                }`}
            >
              Ocean Cleanup Platform
            </span>
          </div>
        </Link>

        {/* 메뉴 */}
        <nav
          className={`flex items-center gap-12 font-medium ${scrolled ? "text-[#2C3E50]" : "text-white"
            }`}
        >
          <Link
            to="/records"
            className={`transition-colors duration-300 ${scrolled
                ? "hover:text-blue-400"
                : "hover:text-sky-300"
              }`}
          >
            함께한 기록
          </Link>
          <Link
            to="/stats"
            className={`transition-colors duration-300 ${scrolled
                ? "hover:text-blue-400"
                : "hover:text-sky-300"
              }`}
          >
            통계
          </Link>
          <Link
            to="/ranking"
            className={`transition-colors duration-300 ${scrolled
                ? "hover:text-blue-400"
                : "hover:text-sky-300"
              }`}
          >
            랭킹
          </Link>
        </nav>

        {/* 버튼 */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/write")}
            className={`flex items-center gap-2 rounded-full font-medium transition duration-300 px-5 py-2 ${scrolled
                ? "bg-[#0C4A6E] text-white hover:bg-[#093d5d]"
                : "bg-white text-sky-600 hover:bg-sky-100"
              }`}
          >
            <span>작성하기</span>
            <img
              src={
                scrolled
                  ? "/src/assets/headerpen-white.png"
                  : "/src/assets/headerpen.png"
              }
              alt="작성 아이콘"
              className="w-[18px] h-[18px]"
            />
          </button>

          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-2 text-sm ${scrolled
              ? "text-[#0C4A6E] hover:text-sky-800"
              : "text-gray-100 hover:text-white"
              }`}
          >
            <span>로그인이 필요합니다</span>
            <img
              src={
                scrolled
                  ? "/src/assets/headerprofile2.png"
                  : "/src/assets/headerprofile.png"
              }
              alt="프로필"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
