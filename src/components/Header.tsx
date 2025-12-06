// src/components/Header.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  forceScrolled?: boolean;
}

function Header({ forceScrolled = false }: HeaderProps) {
  const navigate = useNavigate();
  // ✅ useAuth에서 필요한 상태와 함수를 가져옵니다.
  const { user, accessToken, isLoading, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (forceScrolled) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceScrolled]);

  const scrolled = forceScrolled || isScrolled;

  const handleWriteClick = () => {
    // ✅ 액세스 토큰으로 로그인 상태 확인
    if (!accessToken) {
      setShowLoginPrompt(true);
      setTimeout(() => {
        setShowLoginPrompt(false);
      }, 3000);
    } else {
      navigate("/write");
    }
  };

  const handleLogout = () => {
    logout(); // AuthContext의 로그아웃 함수 호출
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
            src="/src/assets/logoimage.png"
            alt="바다보다 로고"
            className="w-[57px] h-[57px] object-contain"
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

        {/* 메뉴 */}
        <nav className={`flex items-center gap-12 font-medium ${scrolled ? "text-[#2C3E50]" : "text-white"}`}>
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

        <div className="flex items-center gap-6">
          <button
            onClick={handleWriteClick}
            className={`flex items-center gap-2 rounded-full font-medium transition duration-300 px-5 py-2 ${scrolled ? "bg-[#0C4A6E] text-white hover:bg-[#093d5d]" : "bg-white text-sky-600 hover:bg-sky-100"}`}
          >
            <span>작성하기</span>
            <img
              src={scrolled ? "/src/assets/headerpen-white.png" : "/src/assets/headerpen.png"}
              alt="작성 아이콘"
              className="w-[18px] h-[18px]"
            />
          </button>

          {/* ✅ 로그인 상태에 따른 버튼 변경 */}
          {user ? (
            <button
              onClick={handleLogout} // ✅ 로그아웃 함수 연결
              className={`flex items-center gap-2 text-sm ${scrolled ? "text-[#0C4A6E] hover:text-sky-800" : "text-gray-100 hover:text-white"}`}
            >
              <span>{user.userName}님 (로그아웃)</span> {/* ✅ 사용자 이름 표시 */}
              <img
                src={scrolled ? "/src/assets/headerprofile2.png" : "/src/assets/headerprofile.png"}
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
                src={scrolled ? "/src/assets/headerprofile2.png" : "/src/assets/headerprofile.png"}
                alt="프로필"
                className="w-5 h-5"
              />
            </button>
          )}
        </div>
      </div>

      {showLoginPrompt && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded-md">
          <span>로그인이 필요합니다.</span>
        </div>
      )}
    </header>
  );
}

export default Header;