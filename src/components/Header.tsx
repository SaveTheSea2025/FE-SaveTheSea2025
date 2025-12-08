// src/components/Header.tsx

import { useEffect, useState, useRef } from "react"; // useRef 추가
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  forceScrolled?: boolean;
}

/**
 * 전역 네비게이션 헤더 컴포넌트.
 * 스크롤 상태, 로그인 상태에 따라 디자인 및 기능이 변경됩니다.
 */
function Header({ forceScrolled = false }: HeaderProps) {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuth();

  // 로그아웃 드롭다운 외부 클릭 감지를 위한 ref
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);

  // 드롭다운 외부 클릭 감지 및 스크롤 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLogoutDropdown(false);
      }
    };

    if (showLogoutDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutDropdown]);

  // 스크롤 감지 및 헤더 스타일 변경
  useEffect(() => {
    if (forceScrolled) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      // 스크롤 시 드롭다운 닫기
      setShowLogoutDropdown(false);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [forceScrolled]);

  const scrolled = forceScrolled || isScrolled;

  // 작성하기 버튼 클릭 핸들러 (로그인 확인)
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

  // 로그아웃 드롭다운 토글
  const handleLogoutToggle = () => {
    setShowLogoutDropdown((prev) => !prev);
  };

  // 실제 로그아웃 처리 함수
  const confirmLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    setShowLogoutDropdown(false);
    navigate("/");
  };


  // 프로필 이미지 URL 결정 로직
  function getProfileImageUrl(): string {
    // user가 존재하고 profileUrl이 유효하면 해당 URL 사용
    if (user && user.profileUrl && typeof user.profileUrl === 'string') {
      return user.profileUrl;
    }
    // 기본 이미지 (스크롤 상태에 따라 다름)
    return scrolled ? "/src/assets/header/headerprofile2.png" : "/src/assets/header/headerprofile.png";
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-2"}`}
      style={{
        backgroundColor: scrolled ? "rgba(255, 255, 255, 1)" : "transparent",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-10">
        {/* 로고 및 타이틀 */}
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

        {/* 주 메뉴 (데스크탑) */}
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

        {/* 버튼 그룹 (데스크탑) */}
        <div className="hidden md:flex items-center gap-8 relative" ref={dropdownRef}> {/* ref 추가 */}
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

          {/* 로그인된 사용자: 프로필 및 로그아웃 드롭다운 */}
          {user ? (
            <>
              <button
                onClick={handleLogoutToggle}
                className={`flex items-center gap-2 text-sm ${scrolled ? "text-[#0C4A6E] hover:text-sky-800" : "text-gray-100 hover:text-white"}`}
              >
                <span>{user.userName}님</span>
                <img
                  src={getProfileImageUrl()}
                  alt="프로필"
                  className="w-9 h-9 rounded-full border-3 border-[#475d98] object-cover cursor-pointer" // 원형, 흰색 테두리
                />
              </button>

              {/* 로그아웃 드롭다운 메뉴 */}
              {showLogoutDropdown && (
                <div className={`absolute top-full right-0 mt-3 w-40 bg-white shadow-lg rounded-lg border ${scrolled ? "border-gray-200" : "border-sky-700"}`}>
                  <button
                    onClick={confirmLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-100 rounded-lg transition duration-200"
                  >
                    로그아웃 하기
                  </button>
                </div>
              )}
            </>
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

        {/* 모바일 햄버거 메뉴 버튼 */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden flex flex-col gap-1.5 ${scrolled ? "text-[#0C4A6E]" : "text-white"
            }`}
        >
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
        </button>

        {/* 로그인 필요 메시지 (데스크탑 하단) */}
        {showLoginPrompt && !isMobileMenuOpen && (
          <div className="fixed bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl z-[9999]">
            작성하려면 로그인이 필요합니다!
          </div>
        )}
      </div>

      {/* 모바일 드롭다운 메뉴 */}
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

            {/* 작성하기 버튼 (모바일) */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleWriteClick();
              }}
              className="bg-[#0C4A6E] text-white py-2 px-4 rounded-full hover:bg-[#093d5d] transition"
            >
              작성하기
            </button>

            {/* 로그인/로그아웃 버튼 (모바일) */}
            {user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  confirmLogout();
                }}
                className="text-[#0C4A6E] py-2 hover:text-sky-800 transition flex items-center gap-2"
              >
                <span>{user.userName}님 (로그아웃)</span>
                <img
                  src={getProfileImageUrl()}
                  alt="프로필"
                  className="w-6 h-6 rounded-full border border-[#0C4A6E] object-cover" // 크기 6x6으로 조정
                />
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
    </header>
  );
}

export default Header;