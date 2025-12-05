// src/types/ranking.ts

export interface RankItem {
    userId: number;
    // API 연동에 따라 추가된 속성들
    userName: string;     
    profileUrl: string | null; 
    totalWeight: number;
    activityCount: number;
    totalParticipants?: number;
    rank: number;
}

export interface StatItem { 
    userName: string;
    category: "most_activity" | "most_weight" | "most_members";
    value: number;
}

export interface RankingData { 
    top10: RankItem[];
    stats: StatItem[];
}