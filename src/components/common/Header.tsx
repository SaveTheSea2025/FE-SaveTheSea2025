// src/components/Header.tsx

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  forceScrolled?: boolean;
}

function Header({ forceScrolled = false }: HeaderProps) {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (forceScrolled) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [forceScrolled]);

  const scrolled = forceScrolled || isScrolled;

  const handleWriteClick = () => {
    if (!accessToken) {
      setShowLoginPrompt(true);
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        setShowLoginPrompt(false);
      }, 3000);
    } else {
      navigate("/write");
    }
  };

  const handleLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-2"}`}
      style={{
        backgroundColor: scrolled ? "rgba(255, 255, 255, 1)" : "transparent",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-10">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/src/assets/header/logoimage.png"
            alt="바다보다 로고"
            className="w-[45px] h-[45px] md:w-[57px] md:h-[57px] object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className={`font-semibold ${scrolled ? "text-sky-700 text-[17px]" : "text-white text-[20px]"}`}>
              바다보다
            </span>
            <span className={`${scrolled ? "text-sky-600 text-[12px]" : "text-white text-[12px]"}`}>
              Ocean Cleanup Platform
            </span>
          </div>
        </Link>

        {/* 메뉴: 모바일에서 숨김 (hidden md:flex) */}
        <nav className={`hidden md:flex items-center gap-12 font-medium ${scrolled ? "text-[#2C3E50]" : "text-white"}`}>
          <Link to="/records" className={`transition-colors duration-300 ${scrolled ? "hover:text-blue-400" : "hover:text-sky-300"}`}>
            함께한 기록
          </Link>
          <Link to="/stats" className={`transition-colors duration-300 ${scrolled ? "hover:text-blue-400" : "hover:text-sky-300"}`}>
            통계
          </Link>
          <Link to="/ranking" className={`transition-colors duration-300 ${scrolled ? "hover:text-blue-400" : "hover:text-sky-300"}`}>
            랭킹
          </Link>
        </nav>

        {/* 버튼 그룹: 모바일에서 숨김 (hidden md:flex) */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={handleWriteClick}
            className={`flex items-center gap-2 rounded-full font-medium transition duration-300 px-5 py-2 ${scrolled ? "bg-[#0C4A6E] text-white hover:bg-[#093d5d]" : "bg-white text-sky-600 hover:bg-sky-100"}`}
          >
            <span>작성하기</span>
            <img
              src={scrolled ? "/src/assets/header/headerpen-white.png" : "/src/assets/header/headerpen.png"}
              alt="작성 아이콘"
              className="w-[18px] h-[18px]"
            />
          </button>

          {/* 로그인 상태에 따른 버튼 변경 */}
          {user ? (
            <button
              onClick={handleLogout} // 로그아웃 함수 연결
              className={`flex items-center gap-2 text-sm ${scrolled ? "text-[#0C4A6E] hover:text-sky-800" : "text-gray-100 hover:text-white"}`}
            >
              <span>{user.userName}님 (로그아웃)</span> {/* 사용자 이름 표시 */}
              <img
                src={scrolled ? "/src/assets/header/headerprofile2.png" : "/src/assets/header/headerprofile.png"}
                alt="프로필"
                className="w-5 h-5"
              />
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className={`flex items-center gap-2 text-sm ${scrolled ? "text-[#0C4A6E] hover:text-sky-800" : "text-gray-100 hover:text-white"}`}
            >
              <span>로그인이 필요합니다</span>
              <img
                src={scrolled ? "/src/assets/header/headerprofile2.png" : "/src/assets/header/headerprofile.png"}
                alt="프로필"
                className="w-5 h-5"
              />
            </button>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 버튼: md 사이즈에서만 숨김 (md:hidden) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden flex flex-col gap-1.5 ${scrolled ? "text-[#0C4A6E]" : "text-white"
            }`}
        >
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴: md 사이즈에서만 표시 (md:hidden) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col px-6 py-4 gap-4 text-[#2C3E50]">
            <Link
              to="/records"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-400 transition-colors"
            >
              함께한 기록
            </Link>
            <Link
              to="/stats"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-400 transition-colors"
            >
              통계
            </Link>
            <Link
              to="/ranking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-400 transition-colors"
            >
              랭킹
            </Link>

            {/* 작성하기 버튼 (로그인 로직 반영) */}
            <button
              onClick={() => {
                // 모바일 메뉴를 닫고, 로그인 상태에 따라 작성 페이지로 이동 또는 알림 표시
                setIsMobileMenuOpen(false);
                handleWriteClick();
              }}
              className="bg-[#0C4A6E] text-white py-2 px-4 rounded-full hover:bg-[#093d5d] transition"
            >
              작성하기
            </button>

            {/* 로그인/로그아웃 버튼 (로그인 상태에 따라 표시) */}
            {user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-[#0C4A6E] py-2 hover:text-sky-800 transition"
              >
                {user.userName}님 (로그아웃)
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="text-[#0C4A6E] py-2 hover:text-sky-800 transition"
              >
                로그인이 필요합니다
              </button>
            )}
          </nav>
        </div>
      )}

      {/* 로그인 필요 메시지 (showLoginPrompt 상태에 따라 표시) */}
      {showLoginPrompt && (
        <div className="fixed bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl z-[9999]">
          작성하려면 로그인이 필요합니다!
        </div>
      )}

    </header>
  );
}

export default Header;