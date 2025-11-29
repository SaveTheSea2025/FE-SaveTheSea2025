// 📌 랭킹 타입 정의
export interface RankItem {
  rank: number;
  name: string;
  totalWeight: number;
  activityCount: number;
  logo: string;
}

export interface MonthlyAwardItem {
  title: string;
  name: string;
  value: number;
  unit: string;
}

export interface MonthlyAwards {
  mostActivity: MonthlyAwardItem;
  mostWeight: MonthlyAwardItem;
  mostMember: MonthlyAwardItem;
}

// -------------------------------------------
// 📌 Top 3 더미 데이터
// -------------------------------------------
export const dummyTop3: RankItem[] = [
  {
    rank: 1,
    name: "바다사랑 환경단체",
    totalWeight: 1345.6,
    activityCount: 45,
    logo: "/assets/logo1.png",
  },
  {
    rank: 2,
    name: "청년환경연합",
    totalWeight: 847.3,
    activityCount: 32,
    logo: "/assets/logo2.png",
  },
  {
    rank: 3,
    name: "강원환경보전회",
    totalWeight: 610.2,
    activityCount: 29,
    logo: "/assets/logo3.png",
  },
];

// -------------------------------------------
// 📌 4~10위 목록 더미 데이터
// -------------------------------------------
export const dummyRankList: RankItem[] = [
  { rank: 4, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
  { rank: 5, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
  { rank: 6, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
  { rank: 7, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
  { rank: 8, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
  { rank: 9, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
  { rank: 10, name: "그린웨이브", totalWeight: 598.7, activityCount: 26, logo: "/assets/logo_wave.png" },
];

// -------------------------------------------
// 📌 이달의 업적 더미 데이터
// -------------------------------------------
export const dummyMonthlyAwards: MonthlyAwards = {
  mostActivity: {
    title: "최다 참여",
    name: "바다사랑 환경단체",
    value: 12,
    unit: "회",
  },
  mostWeight: {
    title: "최다 수거",
    name: "바다사랑 환경단체",
    value: 345.6,
    unit: "kg",
  },
  mostMember: {
    title: "최다 인원",
    name: "바다사랑 환경단체",
    value: 156,
    unit: "명",
  },
};
