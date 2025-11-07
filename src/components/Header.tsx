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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white py-2" : "bg-transparent py-2"
        }`}
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
          className={`flex items-center gap-12 font-medium ${scrolled ? "text-sky-700" : "text-white"
            }`}
        >
          <Link to="/records" className="hover:text-sky-400">
            함께한 기록
          </Link>
          <Link to="/stats" className="hover:text-sky-400">
            통계
          </Link>
          <Link to="/ranking" className="hover:text-sky-400">
            랭킹
          </Link>
        </nav>

        {/* 버튼 */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/write")}
            className={`flex items-center gap-2 rounded-full font-medium transition duration-300 ${scrolled
              ? "bg-sky-600 text-white px-5 py-2 hover:bg-sky-700"
              : "bg-white text-sky-600 px-5 py-2 hover:bg-sky-100"
              }`}
          >
            <span>작성하기</span>
            <img
              src="/src/assets/headerpen.png"
              alt="작성 아이콘"
              className="w-[18px] h-[18px]"
            />
          </button>

          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-2 text-sm ${scrolled
              ? "text-sky-700 hover:text-sky-900"
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
