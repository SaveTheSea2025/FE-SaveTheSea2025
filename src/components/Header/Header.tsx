import { useNavigate,Link } from "react-router-dom"; // 라우터 링크 추가
import { useEffect, useState } from "react"; // 스크롤 감지 상태 관리

function Header() {
  const navigate = useNavigate(); // 페이지 이동 
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤되면 true 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll); // 스크롤 감지!
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-white  py-5" : "bg-transparent py-5"
      }`}
    >
      {/* ✅ 중앙 컨테이너 
          - max-w-7xl: 최대 폭 제한 (화면이 넓어져도 너무 퍼지지 않게)
          - mx-auto: 중앙 정렬
          - flex justify-between: 좌/중앙/우 3요소 정렬
          - px-10: 좌우 여백 확보
      */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-10">
        {/* 왼쪽 로고 */}
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/logoimage.png"
            alt="바다보다 로고"
            className={`object-contain transition-all duration-300 ${
              isScrolled ? "w-[64px] h-[64px]" : "w-[64px] h-[64px]"
            }`}
          />
          <div className="flex flex-col leading-tight">
            <span
              className={`font-semibold transition-colors duration-300 ${
                isScrolled
                  ? "text-sky-700 text-[20px]"
                  : "text-white text-[20px]"
              }`}
            >
              바다보다
            </span>
            <span
              className={`transition-colors duration-300 ${
                isScrolled
                  ? "text-sky-600 text-[15px]"
                  : "text-white text-[15px]"
              }`}
            >
              Ocean Cleanup Platform
            </span>
          </div>
        </div>

        {/* 중앙 메뉴 */}
        <nav
          className={`flex items-center gap-12 font-medium transition-colors duration-300 ${
            isScrolled ? "text-sky-700" : "text-white"
          }`}
        >
          <Link to="/records" className="hover:text-sky-400">함께한 기록</Link>
          <Link to="/stats" className="hover:text-sky-400">통계</Link>
          <Link to="/ranking" className="hover:text-sky-400">랭킹</Link>
        </nav>

        {/* 오른쪽 버튼 */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/write")}
            className={`flex items-center gap-2 rounded-full font-medium transition duration-300 ${
              isScrolled
                ? "bg-sky-600 text-white px-5 py-2 hover:bg-sky-700"
                : "bg-white text-sky-600 px-5 py-2 hover:bg-sky-100"
            }`}
          >
            <span>작성하기</span>
            <img
              src="/src/assets/headerpen.png"
              alt="작성하기 아이콘"
              className="w-[18px] h-[18px]"
            />
          </button>
          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-2 text-sm cursor-pointer transition-colors duration-300 ${
              isScrolled
                ? "text-sky-700 hover:text-sky-900"
                : "text-gray-100 hover:text-white"
            }`}
          >
            <span>로그인이 필요합니다</span>
            <img
              
              src={
                isScrolled
                ? "/src/assets/headerprofile2.png"
                : "/src/assets/headerprofile.png"
              }
              alt="프로필 아이콘"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
