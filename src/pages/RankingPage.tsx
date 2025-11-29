import { useState } from "react";
import Header from "../components/Header";

import RankTop3Card from "../components/ranking/RankTop3Card";
import RankListItem from "../components/ranking/RankListItem";
import AwardCard from "../components/ranking/AwardCard";

import {
  dummyTop3,
  dummyRankList,
  dummyMonthlyAwards,
} from "../data/rankingDummy";

const RankingPage = () => {
  const [tab, setTab] = useState<"group" | "personal">("group");

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      {/* Header */}
      <Header />

      {/* Title */}
      <section className="mt-40">
        <h1 className="text-center text-[40px] font-semibold tracking-wide text-[#0C4A6E]">
          랭킹
        </h1>
      </section>

      {/* 탭 */}
      <section className="flex justify-center mt-10 gap-4">
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
      <section className="mt-20 px-6">
        <h2 className="text-center text-2xl font-semibold mb-10 text-[#0C4A6E]">
          Top 3
        </h2>

        <div className="flex flex-col md:flex-row justify-center gap-10 max-w-5xl mx-auto">
          {dummyTop3.map((item) => (
            <RankTop3Card key={item.rank} data={item} />
          ))}
        </div>
      </section>

      {/* 4~10 */}
      <section className="mt-24 px-6 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">
          4위 - 10위
        </h3>

        <div className="space-y-4">
          {dummyRankList.map((item) => (
            <RankListItem key={item.rank} data={item} />
          ))}
        </div>
      </section>

      {/* 이달의 업적 */}
      <section className="mt-28 px-6 pb-20 bg-[#FAF9F6] pt-16">
        <h2 className="text-center text-2xl font-semibold mb-12 text-[#0C4A6E]">
          이달의 업적
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <AwardCard data={dummyMonthlyAwards.mostActivity} />
          <AwardCard data={dummyMonthlyAwards.mostWeight} />
          <AwardCard data={dummyMonthlyAwards.mostMember} />
        </div>
      </section>

      {/* Footer 메시지 */}
      <section className="text-center py-14 text-gray-500">
        <div className="text-4xl mb-4">🏆</div>
        <p className="text-lg font-medium">작은 행동이 모여 큰 변화를 만듭니다.</p>
        <p className="text-lg font-medium">함께해 주셔서 감사합니다.</p>
      </section>
    </div>
  );
};

export default RankingPage;
