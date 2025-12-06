// RankingPage.tsx

import Header from "../components/Header";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

import RankTop3Card from "../components/ranking/RankTop3Card";
import RankListItem from "../components/ranking/RankListItem";
import AwardCard from "../components/ranking/AwardCard";

import type { RankingData, RankItem, StatItem } from "../types/ranking";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

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

// 🔥 stats → AwardCard용 구조로 변환
const getAwardsData = (stats: StatItem[]): MonthlyAwardsData => {
    const findStat = (cat: StatItem["category"]) =>
        stats.find(s => s.category === cat);

    const makeItem = (stat: StatItem | undefined, category: AwardItem["category"]) => ({
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

    // 🔥 API 호출 공통 함수
    const callRankingAPI = async (
        url: string,
        setter: (data: RankingData) => void,
        setLoading: (v: boolean) => void
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<ApiResponse<RankingData>>(url, {
                params: { year, month }
            });

            setter(response.data.data);
        } catch (err) {
            console.error(err);
            setError("랭킹 데이터를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 단체 API
    const fetchGroupRanking = async () => {
        if (!groupRanking) {
            await callRankingAPI("/api/ranking/groups", setGroupRanking, setGroupLoading);
        }
    };

    // 🔹 개인 API
    const fetchPersonalRanking = async () => {
        if (!personalRanking) {
            await callRankingAPI("/api/ranking/users", setPersonalRanking, setPersonalLoading);
        }
    };

    // 탭 변경 시 API 호출
    useEffect(() => {
        if (tab === "group") fetchGroupRanking();
        else fetchPersonalRanking();
    }, [tab]);

    // 현재 탭의 데이터 선택
    const currentRankingData = useMemo(() => {
        return tab === "group" ? groupRanking : personalRanking;
    }, [tab, groupRanking, personalRanking]);

    const isLoading = tab === "group" ? groupLoading : personalLoading;

    const top10 = currentRankingData?.top10 ?? [];
    const top3 = top10.slice(0, 3);
    const rankList = top10.slice(3, 10);

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

    // 데이터 없음
    if (top10.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
                <Header forceScrolled={true} />

                <section className="mt-60">
                    <h1 className="text-center text-4xl font-semibold text-[#0C4A6E]">
                        랭킹
                    </h1>
                </section>

                <section className="flex justify-center mt-6 gap-3">
                    <button
                        onClick={() => setTab("group")}
                        className={`px-5 py-2 rounded-full text-sm font-medium border ${tab === "group"
                            ? "bg-[#0C4A6E] text-white border-[#0C4A6E]"
                            : "bg-white text-gray-600 border-gray-300"
                            }`}
                    >
                        단체별
                    </button>
                    <button
                        onClick={() => setTab("personal")}
                        className={`px-5 py-2 rounded-full text-sm font-medium border ${tab === "personal"
                            ? "bg-[#0C4A6E] text-white border-[#0C4A6E]"
                            : "bg-white text-gray-600 border-gray-300"
                            }`}
                    >
                        개인별
                    </button>
                </section>

                <div className="flex flex-col items-center justify-center py-20 flex-grow">
                    <p className="text-xl text-gray-500 font-semibold mb-4">
                        이번 달 랭킹 데이터가 없습니다.
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
                <h1 className="text-center text-4xl font-semibold text-[#0C4A6E]">랭킹</h1>
            </section>

            {/* 탭 버튼 */}
            <section className="flex justify-center mt-6 gap-3">
                <button
                    onClick={() => setTab("group")}
                    className={`px-5 py-2 rounded-full text-sm font-medium border ${tab === "group"
                        ? "bg-[#0C4A6E] text-white border-[#0C4A6E]"
                        : "bg-white text-gray-600 border-gray-300"
                        }`}
                >
                    단체별
                </button>

                <button
                    onClick={() => setTab("personal")}
                    className={`px-5 py-2 rounded-full text-sm font-medium border ${tab === "personal"
                        ? "bg-[#0C4A6E] text-white border-[#0C4A6E]"
                        : "bg-white text-gray-600 border-gray-300"
                        }`}
                >
                    개인별
                </button>
            </section>

            {/* TOP 3 */}
            <section className="mt-14 px-6">
                <h2 className="text-center text-xl font-bold mb-8 text-gray-700">Top 3</h2>

                <div className="flex flex-col md:flex-row justify-center items-end gap-5 max-w-6xl mx-auto">
                    {top3.map(item => (
                        <RankTop3Card key={item.rank} data={item} />
                    ))}
                </div>
            </section>

            {/* 4 ~ 10위 */}
            {/* 4 ~ 10위 — 데이터가 최소 4개 이상일 때만 표시 */}
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
                <h2 className="text-center text-2xl font-bold mb-10 text-[#0C4A6E]">이달의 업적</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <AwardCard data={awards.mostActivity} />
                    <AwardCard data={awards.mostWeight} />
                    <AwardCard data={awards.mostMember} />
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default RankingPage;
