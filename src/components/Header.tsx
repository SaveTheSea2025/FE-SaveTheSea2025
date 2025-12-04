import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  forceScrolled?: boolean;
}

function Header({ forceScrolled = false }: HeaderProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(forceScrolled);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // forceScrolled가 true면 항상 스크롤된 상태 유지
    if (forceScrolled) {
      setIsScrolled(true);
      return;
    }

    // Intersection Observer로 첫 번째 섹션 감지
    const firstSection = document.querySelector('.snap-start');
    
    if (firstSection) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // 첫 번째 섹션이 화면에서 벗어나면 헤더 색상 변경
          setIsScrolled(!entry.isIntersecting);
        },
        {
          threshold: 0.5, // 섹션의 50%가 보일 때 트리거
          rootMargin: '-80px 0px 0px 0px' // 헤더 높이만큼 offset
        }
      );
      
      observer.observe(firstSection);
      
      return () => observer.disconnect();
    }
    
    // fallback: 일반 스크롤 감지 (데스크톱)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [forceScrolled]);

  const scrolled = forceScrolled || isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-2"
      }`}
      style={{
        backgroundColor: scrolled ? "rgba(255, 255, 255, 1)" : "transparent",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/src/assets/logoimage.png"
            alt="바다보다 로고"
            className="w-[45px] h-[45px] md:w-[57px] md:h-[57px] object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span
              className={`font-semibold ${
                scrolled
                  ? "text-sky-700 text-[15px] md:text-[17px]"
                  : "text-white text-[17px] md:text-[20px]"
              }`}
            >
              바다보다
            </span>
            <span
              className={`${
                scrolled
                  ? "text-sky-600 text-[10px] md:text-[12px]"
                  : "text-white text-[10px] md:text-[12px]"
              }`}
            >
              Ocean Cleanup Platform
            </span>
          </div>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav
          className={`hidden md:flex items-center gap-12 font-medium ${
            scrolled ? "text-[#2C3E50]" : "text-white"
          }`}
        >
          <Link
            to="/records"
            className={`transition-colors duration-300 ${
              scrolled ? "hover:text-blue-400" : "hover:text-sky-300"
            }`}
          >
            함께한 기록
          </Link>
          <Link
            to="/stats"
            className={`transition-colors duration-300 ${
              scrolled ? "hover:text-blue-400" : "hover:text-sky-300"
            }`}
          >
            통계
          </Link>
          <Link
            to="/ranking"
            className={`transition-colors duration-300 ${
              scrolled ? "hover:text-blue-400" : "hover:text-sky-300"
            }`}
          >
            랭킹
          </Link>
        </nav>

        {/* 데스크톱 버튼 */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate("/write")}
            className={`flex items-center gap-2 rounded-full font-medium transition duration-300 px-5 py-2 ${
              scrolled
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
            className={`flex items-center gap-2 text-sm ${
              scrolled
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

        {/* 모바일 햄버거 메뉴 버튼 */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden flex flex-col gap-1.5 ${
            scrolled ? "text-[#0C4A6E]" : "text-white"
          }`}
        >
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
          <span className="block w-6 h-0.5 bg-current transition-all"></span>
        </button>
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
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/write");
              }}
              className="bg-[#0C4A6E] text-white py-2 px-4 rounded-full hover:bg-[#093d5d] transition"
            >
              작성하기
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/login");
              }}
              className="text-[#0C4A6E] py-2 hover:text-sky-800 transition"
            >
              로그인이 필요합니다
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;