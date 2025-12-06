import Header from "../components/Header";
import { useState, useEffect } from "react";

// icons
import filterIcon from "../assets/filterIcon.png";
import downloadIcon from "../assets/downloadIcon.png";
import pdfIcon from "../assets/pdfIcon.png";
import excelIcon from "../assets/excelIcon.png";
import activityIcon from "../assets/activityIcon.png";
import personIcon from "../assets/personIcon.png";
import weightIcon from "../assets/weightIcon.png";
import volumeIcon from "../assets/volumeIcon.png";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// ✅ API 응답 타입 정의
interface SummaryStats {
  activityCount: number;
  totalMembers: number;
  totalWeight: number;
  totalVolume: number;
}

interface MonthlyWeight {
  month: string;
  totalWeight: number;
}

interface WasteTypeRatio {
  wasteType: string;
  ratio: number;
  weight?: number;
}

interface RegionStats {
  region: string;
  activityCount?: number;
  totalWeight: number;
  totalVolume: number;
}

export default function StatsPage() {
  const [unit, setUnit] = useState<"kg" | "l">("kg");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [regionMode, setRegionMode] = useState<"count" | "amount">("count");

  // ✅ 필터 상태 - 오늘부터 1년 전까지 기본값
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  const [startDate, setStartDate] = useState<string>(
    oneYearAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );
  const [location, setLocation] = useState<string>("전체");
  const [activityType, setActivityType] = useState<string>("단체");
  const [organization, setOrganization] = useState<string>("전체");
  const [searchText, setSearchText] = useState<string>("");

  // ✅ 조회된 날짜 상태 (조회 버튼 클릭 시에만 업데이트)
  const [displayStartDate, setDisplayStartDate] = useState<string>(
    oneYearAgo.toISOString().split("T")[0]
  );
  const [displayEndDate, setDisplayEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [activityTypeOpen, setActivityTypeOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);

  // ✅ API 데이터 상태
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>({
    activityCount: 24,
    totalMembers: 1250,
    totalWeight: 3450,
    totalVolume: 5800,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyWeight[]>([]);
  const [wasteRatio, setWasteRatio] = useState<WasteTypeRatio[]>([
    { wasteType: "PLASTIC", ratio: 45, weight: 3500 },
    { wasteType: "BUOY", ratio: 15, weight: 1200 },
    { wasteType: "FISH_NET", ratio: 45, weight: 3500 },
    { wasteType: "SACK", ratio: 45, weight: 3500 },
    { wasteType: "FISH_TRAP", ratio: 45, weight: 3500 },
    { wasteType: "SYRINGE", ratio: 45, weight: 3500 },
    { wasteType: "MEDICINE", ratio: 45, weight: 3500 },
    { wasteType: "ETC", ratio: 45, weight: 1300 },
  ]);
  const [regionData, setRegionData] = useState<RegionStats[]>([
    { region: "동해", activityCount: 150, totalWeight: 1200, totalVolume: 2000 },
    { region: "서해", activityCount: 98, totalWeight: 950, totalVolume: 1600 },
    { region: "남해", activityCount: 120, totalWeight: 800, totalVolume: 1400 },
    { region: "제주", activityCount: 85, totalWeight: 500, totalVolume: 800 },
    { region: "인천", activityCount: 72, totalWeight: 650, totalVolume: 1100 },
  ]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ 컴포넌트 마운트 시 초기 월별 데이터 구조 생성
  useEffect(() => {
    generateMonthlyDataStructure();
  }, []);

  // ✅ 장소 옵션
  const locationOptions = ["전체", "동해", "서해", "남해", "제주"];

  // ✅ 활동유형 옵션
  const activityTypeOptions = ["단체", "개인"];

  // ✅ 단체 옵션 (검색 필터링용)
  const organizationOptions = [
    "전체",
    "가나다단체",
    "나라사랑모임",
    "다같이환경",
    "라온환경보호",
    "마음모아",
    "바다지킴이",
    "사랑의손길",
    "아름다운바다",
  ];

  // ✅ 검색어로 필터링된 단체 목록
  const filteredOrganizations = organizationOptions.filter((org) =>
    org.toLowerCase().includes(searchText.toLowerCase())
  );

  // ✅ 데이터 불러오기
  const fetchAllData = async () => {
    // BASE_URL이 없으면 더미 데이터 사용
    if (!BASE_URL) {
      console.warn(
        "BASE_URL이 설정되지 않았습니다. 더미 데이터를 사용합니다."
      );
      return;
    }

    try {
      // 필터 파라미터 구성
      const params = new URLSearchParams({
        startDate,
        endDate,
        location: location === "전체" ? "" : location,
        activityType: activityType,
        organization: organization === "전체" ? "" : organization,
      });

      console.log("API 호출 시작:", `${BASE_URL}/api/statistics/*?${params}`);

      // 1. 전체 통계
      try {
        const summaryRes = await fetch(
          `${BASE_URL}/api/statistics/summary?${params}`
        );
        const summaryData = await summaryRes.json();
        if (summaryData.code === 0) {
          setSummaryStats(summaryData.data);
          console.log("✅ 전체 통계 로드 완료");
        }
      } catch (err) {
        console.error("❌ 전체 통계 API 실패:", err);
      }

      // 2. 월별 수거량
      try {
        const monthlyRes = await fetch(
          `${BASE_URL}/api/statistics/monthly-weight?${params}`
        );
        const monthlyResult = await monthlyRes.json();
        if (monthlyResult.code === 0 && monthlyResult.data.length > 0) {
          setMonthlyData(monthlyResult.data);
          console.log("✅ 월별 수거량 로드 완료");
        } else {
          // API 데이터가 없으면 선택한 기간에 맞는 빈 구조 생성
          generateMonthlyDataStructure();
        }
      } catch (err) {
        console.error("❌ 월별 수거량 API 실패:", err);
        generateMonthlyDataStructure();
      }

      // 3. 폐기물 비율
      try {
        const wasteRes = await fetch(
          `${BASE_URL}/api/statistics/waste-type-ratio?${params}`
        );
        const wasteResult = await wasteRes.json();
        if (wasteResult.code === 0) {
          setWasteRatio(wasteResult.data);
          console.log("✅ 폐기물 비율 로드 완료");
        }
      } catch (err) {
        console.error("❌ 폐기물 비율 API 실패:", err);
      }

      // 4. 지역별 통계
      try {
        const regionRes = await fetch(
          `${BASE_URL}/api/statistics/region?${params}`
        );
        const regionResult = await regionRes.json();
        if (regionResult.code === 0) {
          setRegionData(regionResult.data);
          console.log("✅ 지역별 통계 로드 완료");
        }
      } catch (err) {
        console.error("❌ 지역별 통계 API 실패:", err);
      }

      console.log("🎉 모든 API 호출 완료");
    } catch (error) {
      console.error("전체 API 로드 오류:", error);
    }
  };

  // ✅ 초기 로드 시에만 데이터 불러오기
  useEffect(() => {
    // 초기 표시 날짜 설정
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
    
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    // 표시 날짜 업데이트
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
    
    // 모든 API 데이터 다시 불러오기
    fetchAllData();
  };

  // ✅ 선택한 기간에 맞는 월별 데이터 생성 함수
  const generateMonthlyDataStructure = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months: MonthlyWeight[] = [];

    // 시작 월부터 종료 월까지 반복
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      
      // 월 표시 형식: "12월" 또는 "2024-12월" (년도가 다른 경우)
      const monthLabel = 
        start.getFullYear() === end.getFullYear() 
          ? `${month}월`
          : `${year}-${month}월`;

      // 더미 데이터: 400~800 사이의 랜덤 값 생성
      const dummyWeight = Math.floor(Math.random() * 400) + 400;

      months.push({
        month: monthLabel,
        totalWeight: dummyWeight,
      });

      // 다음 달로 이동
      current.setMonth(current.getMonth() + 1);
    }

    setMonthlyData(months);
  };

  // ✅ 폐기물 한글 변환
  const wasteTypeMap: Record<string, string> = {
    PLASTIC: "플라스틱",
    GLASS: "유리",
    CAN: "금속",
    PAPER: "종이",
    ETC: "기타",
    SACK: "마대",
    BUOY: "부표",
    FISH_TRAP: "통발",
    FISH_NET: "폐트병",
    SYRINGE: "박스",
    MEDICINE: "약품",
  };

  const COLORS = [
    "#004e89",
    "#1a659e",
    "#2a9d8f",
    "#8ecae6",
    "#b8d4e3",
    "#a8c7db",
    "#95b8d1",
    "#7fa3c3",
  ];

  return (
    <div className="w-full bg-[#e5edf2] min-h-screen">
      <Header forceScrolled />

      <div className="max-w-[1200px] mx-auto pt-48 pb-20 px-8">
        <h2 className="text-center text-[22px] md:text-[30px] font-bold text-center mb-20 leading-normal">통계</h2>

        {/* 🔹 필터 바 */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 bg-[#0077A7] rounded-full flex items-center justify-center shadow-sm">
              <img src={filterIcon} className="w-5 h-5" />
            </button>

            {/* 기간 선택 */}
            <div className="relative">
              <button
                onClick={() => {
                  setDatePickerOpen(!datePickerOpen);
                  setLocationOpen(false);
                  setActivityTypeOpen(false);
                  setOrgOpen(false);
                }}
                className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none hover:bg-gray-50"
              >
                {startDate} ~ {endDate}
              </button>
              <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>

              {datePickerOpen && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 p-4 rounded-xl shadow-lg z-20 w-80">
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066aa]"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066aa]"
                    />
                  </div>
                  <button
                    onClick={() => setDatePickerOpen(false)}
                    className="w-full px-4 py-2 bg-[#0066aa] text-white rounded-lg text-sm hover:bg-[#005a95] transition"
                  >
                    확인
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* 장소 선택 */}
            <div className="relative">
              <button
                onClick={() => {
                  setLocationOpen(!locationOpen);
                  setDatePickerOpen(false);
                  setActivityTypeOpen(false);
                  setOrgOpen(false);
                }}
                className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none hover:bg-gray-50"
              >
                {location}
              </button>
              <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>

              {locationOpen && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-40">
                  {locationOptions.map((loc, idx) => (
                    <div
                      key={loc}
                      onClick={() => {
                        setLocation(loc);
                        setLocationOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                        location === loc
                          ? "bg-blue-50 text-[#0066aa] font-medium"
                          : ""
                      } ${idx === 0 ? "rounded-t-xl" : ""} ${
                        idx === locationOptions.length - 1
                          ? "rounded-b-xl"
                          : ""
                      }`}
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 활동유형 선택 */}
            <div className="relative">
              <button
                onClick={() => {
                  setActivityTypeOpen(!activityTypeOpen);
                  setDatePickerOpen(false);
                  setLocationOpen(false);
                  setOrgOpen(false);
                }}
                className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none hover:bg-gray-50"
              >
                {activityType}
              </button>
              <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>

              {activityTypeOpen && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-32">
                  {activityTypeOptions.map((type, idx) => (
                    <div
                      key={type}
                      onClick={() => {
                        setActivityType(type);
                        setActivityTypeOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                        activityType === type
                          ? "bg-blue-50 text-[#0066aa] font-medium"
                          : ""
                      } ${idx === 0 ? "rounded-t-xl" : ""} ${
                        idx === activityTypeOptions.length - 1
                          ? "rounded-b-xl"
                          : ""
                      }`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 단체명 검색 */}
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setOrgOpen(true);
                }}
                onFocus={() => {
                  setOrgOpen(true);
                  setDatePickerOpen(false);
                  setLocationOpen(false);
                  setActivityTypeOpen(false);
                }}
                placeholder="단체명을 입력해주세요"
                className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm focus:outline-none hover:bg-gray-50 w-56"
              />

              {orgOpen && filteredOrganizations.length > 0 && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-56 max-h-60 overflow-y-auto">
                  {filteredOrganizations.map((org, idx) => (
                    <div
                      key={org}
                      onClick={() => {
                        setOrganization(org);
                        setSearchText(org);
                        setOrgOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                        organization === org
                          ? "bg-blue-50 text-[#0066aa] font-medium"
                          : ""
                      } ${
                        idx === 0 ? "rounded-t-xl border-b border-gray-100" : ""
                      } ${
                        idx === filteredOrganizations.length - 1
                          ? "rounded-b-xl"
                          : ""
                      }`}
                    >
                      {org}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-md hover:bg-[#004d7a] hover:shadow-lg hover:scale-105 active:bg-[#002845] active:scale-95 active:shadow-inner transition-all duration-150 font-semibold cursor-pointer"
            >
              조회
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white border border-gray-200 text-sm shadow-sm hover:bg-gray-50 transition"
            >
              <img src={downloadIcon} className="w-4 h-4" />
              파일 다운
            </button>

            {downloadOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[220px]">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-t-xl cursor-pointer transition">
                  <img src={pdfIcon} className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">PDF 보고서 다운로드</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-b-xl cursor-pointer transition">
                  <img src={excelIcon} className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">데이터 엑셀 다운로드</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 활동 보고서 */}
        <h2 className="text-lg font-semibold mb-4">
          {displayStartDate} ~ {displayEndDate} 활동 보고서
        </h2>

        <div className="grid grid-cols-4 gap-6 mb-14">
          <SummaryCard
            title="활동 수"
            value={`${summaryStats?.activityCount || 0}회`}
            icon={activityIcon}
          />
          <SummaryCard
            title="총 참여자 수"
            value={`${summaryStats?.totalMembers.toLocaleString() || 0}명`}
            icon={personIcon}
          />
          <SummaryCard
            title="총 수거량"
            value={`${summaryStats?.totalWeight.toLocaleString() || 0}kg`}
            icon={weightIcon}
          />
          <SummaryCard
            title="총 수거 부피"
            value={`${summaryStats?.totalVolume.toLocaleString() || 0}L`}
            icon={volumeIcon}
          />
        </div>

        {/* 🔹 월별 수거량 추이 */}
        <SectionBox title="월별 수거량 추이">
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={() => setUnit("kg")}
              className={`px-4 py-1 rounded-full text-sm ${
                unit === "kg"
                  ? "bg-[#0066aa] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit("l")}
              className={`px-4 py-1 rounded-full text-sm ${
                unit === "l"
                  ? "bg-[#0066aa] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              L
            </button>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9d9d9" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [value, unit === "kg" ? "전체(kg)" : "전체(L)"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ fontWeight: "600", marginBottom: "4px" }}
                />
                <Line
                  type="monotone"
                  dataKey="totalWeight"
                  stroke="#0066aa"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#0066aa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionBox>

        {/* 🔹 폐기물 분류 비율 */}
        <SectionBox title="폐기물 분류 비율">
          <div className="flex justify-between items-start gap-12">
            {/* 왼쪽: 도넛 차트 */}
            <div className="w-[420px] h-[320px] flex-shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={wasteRatio.map((w) => ({
                      name: wasteTypeMap[w.wasteType] || w.wasteType,
                      value: w.ratio,
                    }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={65}
                    stroke="#fff"
                    strokeWidth={2}
                    labelLine={false}
                    label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 25;
                      const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
                      const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
                      const safeValue = Number(value ?? 0).toFixed(0);
                      
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#0066aa"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize="13"
                          fontWeight="500"
                        >
                          {`${name} ${safeValue}%`}
                        </text>
                      );
                    }}
                  >
                    {wasteRatio.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 오른쪽: 범례 */}
            <div className="flex-1 pt-4">
              <div className="grid grid-cols-1 gap-3">
                {wasteRatio.map((item, idx) => (
                  <div
                    key={item.wasteType}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        style={{ background: COLORS[idx % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {wasteTypeMap[item.wasteType] || item.wasteType}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {item.weight?.toLocaleString() || 0}kg
                      </span>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {Number(item.ratio ?? 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionBox>

        {/* 🔹 지역별 활동 */}
        <SectionBox
          title="지역별 활동 현황"
          rightElement={
            <div className="flex gap-2">
              <button
                onClick={() => setRegionMode("count")}
                className={`px-4 py-1 rounded-md text-sm ${
                  regionMode === "count"
                    ? "bg-[#0066aa] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                활동 횟수별
              </button>
              <button
                onClick={() => setRegionMode("amount")}
                className={`px-4 py-1 rounded-md text-sm ${
                  regionMode === "amount"
                    ? "bg-[#0066aa] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                수거량별
              </button>
            </div>
          }
        >
          <div className="w-full h-72">
            <ResponsiveContainer>
              {regionMode === "count" ? (
                // 활동 횟수별 - 단일 막대 그래프
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value}회`, "활동 횟수"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ fontWeight: "600", marginBottom: "4px" }}
                  />
                  <Bar
                    dataKey="activityCount"
                    fill="#0066aa"
                    barSize={65}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              ) : (
                // 수거량별 - kg와 L 두 개의 막대 그래프
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ fontWeight: "600", marginBottom: "4px" }}
                  />
                  <Bar
                    dataKey="totalWeight"
                    fill="#0066aa"
                    name="무게(kg)"
                    barSize={50}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="totalVolume"
                    fill="#2a9d8f"
                    name="부피(L)"
                    barSize={50}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ */
/* Components */
/* ------------------------------------------------------ */

function SummaryCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-lg bg-[#c9e3e7] flex items-center justify-center">
        <img src={icon} className="w-6 h-6" />
      </div>
    </div>
  );
}

function SectionBox({
  title,
  children,
  rightElement,
}: {
  title: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-14">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {rightElement}
      </div>
      {children}
    </div>
  );
}
