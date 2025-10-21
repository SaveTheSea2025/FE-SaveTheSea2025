import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 헤더까지 전체 배경 이미지 넣기 */}
      <div
        className="relative text-white" //
        style={{
          backgroundImage: "url('/src/assets/backgroundimage.png')", // ocean 배경
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        

        {/* 공용 컴포넌트에서 헤더씀 */}
        <Header/>

        {/* 메인  */}
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
      <div className="text-[24px] bg-sky-400 py-3 flex justify-center text-decoration-none">
        <button
          onClick={() => navigate("/calendar")}
          className="text-white font-medium cursor-pointer hover:no-underline focus:no-underline active:no-underline"
        >
          해양 봉사활동 신청하러 가기 →
        </button>
      </div>

      
    </div>
  );
}

export default Dashboard;
