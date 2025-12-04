// rankingDummy.ts

// ----------------------------------------------
// --- 인터페이스 정의 (Typescript Interfaces) ---
// ----------------------------------------------

/**
 * 랭킹 리스트 아이템의 구조를 정의합니다.
 */
export interface RankItem {
    rank: number;
    name: string;
    totalWeight: number; // 수거량 (kg)
    activityCount: number; // 활동 횟수 (회)
}

/**
 * 이달의 업적 아이템의 구조를 정의합니다.
 */
export interface MonthlyAwardItem {
    title: string; // 업적 제목 (예: 최대 활동)
    name: string; // 달성 주체 (단체 또는 개인 이름)
    value: number; // 달성 값
    unit: string; // 값의 단위 (예: 회 활동, kg, 명)
}

/**
 * 월간 업적 전체 목록의 구조를 정의합니다.
 */
export interface MonthlyAwards {
    mostActivity: MonthlyAwardItem;
    mostWeight: MonthlyAwardItem;
    mostMember: MonthlyAwardItem;
}


// ------------------------------------
// --- 단체별 더미 데이터 (Group Data) ---
// ------------------------------------

/**
 * 단체별 Top 3 랭킹 데이터
 */
export const dummyTop3: RankItem[] = [
    {
        rank: 2,
        name: "해병대 2사단",
        totalWeight: 847.3,
        activityCount: 22,
    },
    {
        rank: 1,
        name: "바다사랑 환경단체",
        totalWeight: 1345.6,
        activityCount: 45,
    },
    {
        rank: 3,
        name: "삼봉중봉 보전회",
        totalWeight: 610.2,
        activityCount: 18,
    },
];

/**
 * 단체별 4위 ~ 10위 랭킹 데이터
 */
export const dummyRankList: RankItem[] = [
    {
        rank: 4,
        name: "그린데이코",
        totalWeight: 599.7,
        activityCount: 26,
    },
    {
        rank: 5,
        name: "그린데이코",
        totalWeight: 598.7,
        activityCount: 26,
    },
    {
        rank: 6,
        name: "그린데이코",
        totalWeight: 598.7,
        activityCount: 26,
    },
    {
        rank: 7,
        name: "윤도현", // 더미 데이터 다양화를 위해 이름 임의 변경
        totalWeight: 598.7,
        activityCount: 26,
    },
    {
        rank: 8,
        name: "한예슬", // 더미 데이터 다양화를 위해 이름 임의 변경
        totalWeight: 598.7,
        activityCount: 26,
    },
    {
        rank: 9,
        name: "신준호", // 더미 데이터 다양화를 위해 이름 임의 변경
        totalWeight: 598.7,
        activityCount: 26,
    },
    {
        rank: 10,
        name: "오세정", // 더미 데이터 다양화를 위해 이름 임의 변경
        totalWeight: 598.7,
        activityCount: 26,
    },
];

/**
 * 단체별 이달의 업적 데이터 (Export 누락 오류 수정)
 */
export const dummyMonthlyAwards: MonthlyAwards = {
    mostActivity: {
        title: "최대 활동",
        name: "바다사랑 환경단체",
        value: 72,
        unit: "회 활동",
    },
    mostWeight: {
        title: "최대 수거량",
        name: "바다사랑 환경단체",
        value: 1570,
        unit: "kg",
    },
    mostMember: {
        title: "최다 참여 인원",
        name: "바다사랑 환경단체",
        value: 50,
        unit: "명",
    },
};


// -------------------------------------
// --- 개인별 더미 데이터 (Personal Data) ---
// -------------------------------------

/**
 * 개인별 Top 3 랭킹 데이터
 */
export const dummyPersonalTop3: RankItem[] = [
    {
        rank: 2,
        name: "김철수",
        totalWeight: 155.8,
        activityCount: 15,
    },
    {
        rank: 1,
        name: "이영희",
        totalWeight: 210.5,
        activityCount: 8,
    },
    {
        rank: 3,
        name: "박민준",
        totalWeight: 130.1,
        activityCount: 12,
    },
];

/**
 * 개인별 4위 ~ 10위 랭킹 데이터
 */
export const dummyPersonalRankList: RankItem[] = [
    {
        rank: 4,
        name: "최지아",
        totalWeight: 110.3,
        activityCount: 9,
    },
    {
        rank: 5,
        name: "강현우",
        totalWeight: 98.6,
        activityCount: 11,
    },
    {
        rank: 6,
        name: "정수민",
        totalWeight: 95.0,
        activityCount: 7,
    },
    {
        rank: 7,
        name: "윤도현",
        totalWeight: 88.9,
        activityCount: 10,
    },
    {
        rank: 8,
        name: "한예슬",
        totalWeight: 85.4,
        activityCount: 6,
    },
    {
        rank: 9,
        name: "신준호",
        totalWeight: 80.2,
        activityCount: 8,
    },
    {
        rank: 10,
        name: "오세정",
        totalWeight: 77.9,
        activityCount: 5,
    },
];

/**
 * 개인별 이달의 업적 데이터
 */
export const dummyPersonalMonthlyAwards: MonthlyAwards = {
    mostActivity: {
        title: "최대 활동",
        name: "최지아",
        value: 18,
        unit: "회 활동",
    },
    mostWeight: {
        title: "최대 수거량",
        name: "이영희",
        value: 210.5,
        unit: "kg",
    },
    mostMember: {
        title: "최다 인증 건수",
        name: "김철수",
        value: 15,
        unit: "건",
    },
};