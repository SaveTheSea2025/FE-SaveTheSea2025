// RankingPage.tsx
import Header from "../components/common/Header";
import { useState, useEffect, useMemo } from "react";
import RankTop3Card from "../components/ranking/RankTop3Card";
import RankListItem from "../components/ranking/RankListItem";
import AwardCard from "../components/ranking/AwardCard";
import type { RankingData, StatItem } from "../types/ranking";
import instance from "../api/axios";

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v7l-4 2v-8.414a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);


interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface AwardItem {
  userName: string;
  value: number;
  category: "most_activity" | "most_weight" | "most_members";
}

interface MonthlyAwardsData {
  mostActivity: AwardItem;
  mostWeight: AwardItem;
  mostMember: AwardItem;
}

const getAwardsData = (stats: StatItem[]): MonthlyAwardsData => {
  const findStat = (cat: StatItem["category"]) =>
    stats.find(s => s.category === cat);

  const makeItem = (
    stat: StatItem | undefined,
    category: AwardItem["category"]
  ) => ({
    userName: stat?.userName || "N/A",
    value: stat?.value ?? 0,
    category,
  });

  return {
    mostActivity: makeItem(findStat("most_activity"), "most_activity"),
    mostWeight: makeItem(findStat("most_weight"), "most_weight"),
    mostMember: makeItem(findStat("most_members"), "most_members"),
  };
};

// Footer 컴포넌트
const Footer = () => (
  <footer className="bg-[#0C4A6E] text-white text-center py-14">
    <div className="text-4xl mb-4">🏆</div>
    <p className="text-lg font-medium">작은 행동이 모여 큰 변화를 만듭니다.</p>
    <p className="text-lg font-medium">함께해 주셔서 감사합니다.</p>
  </footer>
);

// 년도와 월 목록 생성
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

// 현재 연도부터 이전 3년까지의 연도 목록
const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
// 1월부터 12월까지의 월 목록
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const RankingPage = () => {
  const [tab, setTab] = useState<"group" | "personal">("group");

  // 년/월 선택 상태
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [groupRanking, setGroupRanking] = useState<RankingData | null>(null);
  const [personalRanking, setPersonalRanking] = useState<RankingData | null>(
    null
  );

  const [groupLoading, setGroupLoading] = useState(false);
  const [personalLoading, setPersonalLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // API 호출 공통 함수 - year, month 인자 추가
  const callRankingAPI = async (
    url: string,
    year: number,
    month: number,
    setter: (data: RankingData) => void,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      // instance 사용
      const response = await instance.get<ApiResponse<RankingData>>(url, {
        params: { year, month },
      });

      setter(response.data.data);
    } catch (err) {
      console.error(err);
      setError("랭킹 데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 단체 API
  const fetchGroupRanking = async (year: number, month: number) => {
    await callRankingAPI(
      "/api/ranking/groups",
      year,
      month,
      setGroupRanking,
      setGroupLoading
    );
  };

  // 개인 API
  const fetchPersonalRanking = async (year: number, month: number) => {
    await callRankingAPI(
      "/api/ranking/users",
      year,
      month,
      setPersonalRanking,
      setPersonalLoading
    );
  };

  // 탭, 년, 월 변경 시 API 호출
  useEffect(() => {
    setGroupRanking(null);
    setPersonalRanking(null);

    if (tab === "group") {
      fetchGroupRanking(selectedYear, selectedMonth);
    } else {
      fetchPersonalRanking(selectedYear, selectedMonth);
    }
  }, [tab, selectedYear, selectedMonth]);

  // 현재 탭의 데이터 선택
  const currentRankingData = useMemo(() => {
    return tab === "group" ? groupRanking : personalRanking;
  }, [tab, groupRanking, personalRanking]);

  const isLoading = tab === "group" ? groupLoading : personalLoading;

  // 개인 탭 여부
  const isPersonalTab = tab === "personal";

  // Top 3 데이터 추출 로직
  const top10 = currentRankingData?.top10 ?? [];

  // top10 배열에서 순위별 데이터 추출 (없으면 null)
  const rank1Data = top10.find(item => item.rank === 1) || null;
  const rank2Data = top10.find(item => item.rank === 2) || null;
  const rank3Data = top10.find(item => item.rank === 3) || null;

  const rankList = top10.slice(3, 10); // 4위부터 10위까지 목록

  const stats = currentRankingData?.stats ?? [];
  const awards = getAwardsData(stats);

  // 로딩 UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 에러 UI
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <p className="text-gray-600">잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  // 데이터 없음 및 메인 렌더링을 위한 공통 컴포넌트
  const RankingControls = (
    <section className="flex justify-center">
      <div className="max-w-3xl mx-auto w-full px-6  mt-15 mb-10">
        <div className="flex items-center gap-4 mb-6">
          {/* 필터 아이콘 버튼 */}
          <button className="w-9 h-9 bg-[#0C4A6E] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <FilterIcon />
          </button>

          {/* 탭 버튼 - 스위치 스타일 */}
          <div className="relative inline-flex bg-gray-200 rounded-full p-1 flex-shrink-0">
            <button
              onClick={() => setTab("group")}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${tab === "group"
                ? "bg-[#0C4A6E] text-white shadow-md"
                : "text-gray-600"
                }`}
            >
              단체별
            </button>
            <button
              onClick={() => setTab("personal")}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${tab === "personal"
                ? "bg-[#0C4A6E] text-white shadow-md"
                : "text-gray-600"
                }`}
            >
              개인별
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 flex-shrink-0"></div>

          {/* 년/월 드롭다운 - 버튼 스타일 */}
          <div className="flex items-center gap-3">
            {/* 년도 선택 드롭다운 */}
            <div className="relative flex-shrink-0">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none hover:bg-gray-50 cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>
            </div>

            {/* 월 선택 드롭다운 */}
            <div className="relative flex-shrink-0">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none hover:bg-gray-50 cursor-pointer"
              >
                {months.map(month => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // 데이터 없음
  if (top10.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
        <Header forceScrolled={true} />

        <section className="mt-60">
          <h1 className="text-center text-4xl font-semibold text-[#0C4A6E]">
            랭킹
          </h1>
        </section>

        {/* 필터 컨트롤 */}
        {RankingControls}

        <div className="flex flex-col items-center justify-center py-20 flex-grow">
          <p className="text-xl text-gray-500 font-semibold mb-4">
            선택한 기간의 랭킹 데이터가 없습니다.
          </p>
          <p className="text-gray-500">
            {selectedYear}년 {selectedMonth}월에는 활동 내역이 없어요.
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      <Header forceScrolled={true} />

      <section className="mt-60">
        <h1 className="text-center text-4xl font-semibold text-[#0C4A6E]">
          랭킹
        </h1>
      </section>

      {/* 필터 컨트롤 */}
      {RankingControls}

      {/* TOP 3 */}
      <section className="mt-14 px-6">
        <p className="text-center text-lg text-gray-400 mb-4 font-semibold">
          {selectedYear}년 {selectedMonth}월 기준
        </p>
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-700">
          Top 3
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-end gap-5 max-w-6xl mx-auto">
          {/* 2위 */}
          <RankTop3Card data={rank2Data} rank={2} />

          {/* 1위 */}
          <RankTop3Card data={rank1Data} rank={1} />

          {/* 3위 */}
          <RankTop3Card data={rank3Data} rank={3} />
        </div>
      </section>

      {/* 4 ~ 10위 */}
      {top10.length >= 4 && (
        <section className="mt-12 px-6 max-w-3xl mx-auto w-full">
          <h3 className="text-xl font-bold text-gray-700 mb-6">4위 - 10위</h3>

          <div className="space-y-4">
            {rankList.map(item => (
              <RankListItem key={item.rank} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* 이달의 업적 */}
      <section className="mt-20 px-6 pb-20 pt-10 bg-F9F9F9">
        <h2 className="text-center text-2xl font-bold mb-10 text-[#0C4A6E]">
          이달의 업적
        </h2>

        <div
          className={`grid grid-cols-1 gap-6 max-w-6xl mx-auto ${isPersonalTab
            ? "md:grid-cols-2 md:max-w-3xl" // 개인 탭: 2열, 최대 너비를 줄여 중앙에 모이게 함
            : "md:grid-cols-3" // 단체 탭: 3열
            }`}
        >
          <AwardCard data={awards.mostActivity} isPersonalTab={isPersonalTab} />
          <AwardCard data={awards.mostWeight} isPersonalTab={isPersonalTab} />

          {!isPersonalTab && (
            <AwardCard data={awards.mostMember} isPersonalTab={isPersonalTab} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RankingPage;