// RankingPage.tsx

import Header from "../components/Header";
import { useState, useEffect, useMemo } from "react"; 
import axios from "axios";
import RankTop3Card from "../components/ranking/RankTop3Card";
import RankListItem from "../components/ranking/RankListItem";
import AwardCard from "../components/ranking/AwardCard";

// 타입 정의를 가정하고 가져옵니다. (실제 경로에 맞게 수정하세요)
import { RankingData, RankItem, StatItem } from "../types/ranking"; 


// 새로 추가된 API 최상위 응답 타입 정의
interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}


// AwardCard에 전달할 데이터 구조를 만들기 위한 헬퍼 함수
interface AwardItem {
    userName: string;
    value: number;
    category: 'most_activity' | 'most_weight' | 'most_members';
}

// *** 반환 타입 수정: 명시적으로 카멜 케이스 키를 정의합니다. ***
interface MonthlyAwardsData {
    mostActivity: AwardItem;
    mostWeight: AwardItem;
    mostMember: AwardItem;
}

const getAwardsData = (stats: StatItem[]): MonthlyAwardsData => {
    const activityStat = stats.find(s => s.category === 'most_activity');
    const weightStat = stats.find(s => s.category === 'most_weight');
    const membersStat = stats.find(s => s.category === 'most_members');

    // API 응답 구조가 'stats' 배열만 주기 때문에, AwardCard가 예상하는 구조로 변환합니다.
    return {
        mostActivity: {
            userName: activityStat?.userName || 'N/A',
            value: activityStat?.value || 0,
            category: 'most_activity',
        },
        mostWeight: {
            userName: weightStat?.userName || 'N/A',
            value: weightStat?.value || 0,
            category: 'most_weight',
        },
        // 개인 랭킹에는 most_members가 없으므로, 데이터가 없으면 기본값 처리
        mostMember: { 
            userName: membersStat?.userName || 'N/A',
            value: membersStat?.value || 0,
            category: 'most_members',
        }
    };
};


const Footer = () => (
  <footer className="bg-[#0C4A6E] text-white text-center py-14">
    <div className="text-4xl mb-4">🏆</div>
    <p className="text-lg font-medium">작은 행동이 모여 큰 변화를 만듭니다.</p>
    <p className="text-lg font-medium">함께해 주셔서 감사합니다.</p>
  </footer>
);


const RankingPage = () => {
  const [tab, setTab] = useState<"group" | "personal">("group");
  const [groupRanking, setGroupRanking] = useState<RankingData | null>(null);
  const [personalRanking, setPersonalRanking] = useState<RankingData | null>(null);
  
  const [groupLoading, setGroupLoading] = useState(false);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 1. 단체 랭킹 API 호출 함수
  const fetchGroupRanking = async () => {
    if (groupRanking) return;
    
    setGroupLoading(true);
    setError(null);
    try {
      const BASE_URL = "/api/ranking/groups";
      const response = await axios.get<ApiResponse<RankingData>>(BASE_URL, { 
        params: { year, month },
        // headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      setGroupRanking(response.data.data); 
    } catch (err) {
      console.error("단체 랭킹 조회 오류:", err);
      setError("단체 랭킹 데이터를 불러오는 데 실패했습니다."); 
    } finally {
      setGroupLoading(false);
    }
  };

  // 2. 개인 랭킹 API 호출 함수
  const fetchPersonalRanking = async () => {
    if (personalRanking) return;

    setPersonalLoading(true);
    setError(null);
    try {
      const BASE_URL = "/api/ranking/users";
      const response = await axios.get<ApiResponse<RankingData>>(BASE_URL, { 
        params: { year, month },
        // headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      setPersonalRanking(response.data.data); 
    } catch (err) {
      console.error("개인 랭킹 조회 오류:", err);
      setError("개인 랭킹 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setPersonalLoading(false);
    }
  };

  // 탭 상태가 바뀔 때 해당 API 호출
  useEffect(() => {
    setError(null); 
    
    if (tab === "group") {
      fetchGroupRanking();
    } else {
      fetchPersonalRanking();
    }
  }, [tab]); 

  // 현재 탭에 따라 표시할 데이터 결정 (useMemo로 최적화)
  const currentRankingData = useMemo(() => {
    return tab === 'group' ? groupRanking : personalRanking;
  }, [tab, groupRanking, personalRanking]);
  
  // 현재 로딩 상태 결정
  const isLoading = tab === 'group' ? groupLoading : personalLoading;

  // 데이터 구조 분리
  const currentTop10: RankItem[] = currentRankingData?.top10 || [];
  const currentStats: StatItem[] = currentRankingData?.stats || [];
  
  // Top 3 데이터와 4-10위 데이터 분리
  const currentTop3 = currentTop10.slice(0, 3);
  const currentRankList = currentTop10.slice(3, 10);
  
  // AwardCard에 전달할 데이터 구조 생성
  const currentMonthlyAwards = getAwardsData(currentStats);


  // 로딩 및 오류 처리 렌더링
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <p className="text-gray-600">잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  // 데이터가 없는데 에러도 아닌 경우 (API 결과가 빈 배열로 왔을 때) 처리
  if (!currentRankingData || currentTop10.length === 0) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center pt-20">
              <p className="text-xl text-gray-500 font-semibold mb-4">이번 달 랭킹 데이터가 없습니다.</p>
              <p className="text-gray-600">다음 달 랭킹을 기대해 주세요!</p>
          </div>
      );
  }


  return (
    <div className="min-h-screen flex flex-col bg-[#e8e8e8]">
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
          {/* 이제 카멜 케이스로 안전하게 접근합니다. */}
          <AwardCard data={currentMonthlyAwards.mostActivity} />
          <AwardCard data={currentMonthlyAwards.mostWeight} />
          <AwardCard data={currentMonthlyAwards.mostMember} />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default RankingPage;