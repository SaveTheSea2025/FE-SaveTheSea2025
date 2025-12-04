// RankingPage.tsx
import Header from "../components/Header";
import { useState } from "react";
import RankTop3Card from "../components/ranking/RankTop3Card";
import RankListItem from "../components/ranking/RankListItem";
import AwardCard from "../components/ranking/AwardCard";

// 개인별 더미 데이터도 import 해야 합니다.
import {
  dummyTop3,
  dummyRankList,
  dummyMonthlyAwards,
  dummyPersonalTop3,
  dummyPersonalRankList,
  dummyPersonalMonthlyAwards,
} from "../data/rankingDummy";

// Footer 컴포넌트 (생략)
const Footer = () => (
  <footer className="bg-[#0C4A6E] text-white text-center py-14">
    <div className="text-4xl mb-4">🏆</div>
    <p className="text-lg font-medium">작은 행동이 모여 큰 변화를 만듭니다.</p>
    <p className="text-lg font-medium">함께해 주셔서 감사합니다.</p>
  </footer>
);


const RankingPage = () => {
  const [tab, setTab] = useState<"group" | "personal">("group");

  // 탭 상태에 따라 사용할 데이터를 결정합니다. (가장 중요한 수정 부분)
  const currentTop3 = tab === "group" ? dummyTop3 : dummyPersonalTop3;
  const currentRankList = tab === "group" ? dummyRankList : dummyPersonalRankList;
  const currentMonthlyAwards = tab === "group" ? dummyMonthlyAwards : dummyPersonalMonthlyAwards;


  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      {/* Header */}
      <Header forceScrolled={true} />

      {/* Title */}
      <section className="mt-60">
        <h1 className="text-center text-4xl font-semibold tracking-wide text-[#0C4A6E]">
          랭킹
        </h1>
      </section>

      {/* 탭 */}
      <section className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => setTab("group")}
          className={`px-5 py-2 rounded-full text-sm font-medium border transition ${tab === "group"
            ? "bg-[#0C4A6E] text-white border-[#0C4A6E]"
            : "bg-white text-gray-600 border-gray-300"
            }`}
        >
          단체별
        </button>

        <button
          onClick={() => setTab("personal")}
          className={`px-5 py-2 rounded-full text-sm font-medium border transition ${tab === "personal"
            ? "bg-[#0C4A6E] text-white border-[#0C4A6E]"
            : "bg-white text-gray-600 border-gray-300"
            }`}
        >
          개인별
        </button>
      </section>

      {/* TOP 3 */}
      <section className="mt-14 px-6">
        <h2 className="text-center text-xl font-bold mb-8 text-gray-700">
          Top 3
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-end gap-5 max-w-6xl mx-auto">
          {currentTop3.map((item) => (
            <RankTop3Card key={item.rank} data={item} />
          ))}
        </div>
      </section>

      {/* 4위 - 10위 */}
      <section className="mt-12 px-6 max-w-3xl mx-auto w-full">
        <h3 className="text-xl font-bold text-gray-700 mb-6">4위 - 10위</h3>

        <div className="space-y-4">
          {currentRankList.map((item) => (
            <RankListItem key={item.rank} data={item} />
          ))}
        </div>
      </section>

      {/* 이달의 업적 */}
      <section className="mt-20 px-6 pb-20 bg-F9F9F9 pt-10">
        <h2 className="text-center text-2xl font-bold mb-10 text-[#0C4A6E]">
          이달의 업적
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <AwardCard data={currentMonthlyAwards.mostActivity} />
          <AwardCard data={currentMonthlyAwards.mostWeight} />
          <AwardCard data={currentMonthlyAwards.mostMember} />
        </div>
      </section>

      {/* Footer 메시지 */}
      <Footer />
    </div>
  );
};

export default RankingPage;