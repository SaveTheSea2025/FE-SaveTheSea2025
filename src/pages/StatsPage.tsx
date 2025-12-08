/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import Header from "../components/common/Header";
import { useState, useEffect, useRef } from "react";

// icons
import filterIcon from "../assets/stats/filterIcon.png";
import downloadIcon from "../assets/stats/downloadIcon.png";
import pdfIcon from "../assets/stats/pdfIcon.png";
import excelIcon from "../assets/stats/excelIcon.png";
import activityIcon from "../assets/stats/activityIcon.png";
import personIcon from "../assets/stats/personIcon.png";
import weightIcon from "../assets/stats/weightIcon.png";
import volumeIcon from "../assets/stats/volumeIcon.png";

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

  // ✅ 드롭다운 ref (바깥 클릭 감지용)
  const downloadRef = useRef<HTMLDivElement>(null);

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
  // 💡 뷰 모드 추가
  const [viewMode, setViewMode] = useState<"personal" | "organization">("personal");

  // ✅ 사용자 정보 (로그인 후 토큰에서 가져올 정보)
  const [userId, setUserId] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  // ✅ 조회된 날짜 상태 (조회 버튼 클릭 시에만 업데이트)
  const [displayStartDate, setDisplayStartDate] = useState<string>(
    oneYearAgo.toISOString().split("T")[0]
  );
  const [displayEndDate, setDisplayEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // ✅ API 데이터 상태 (더미 데이터 제거 및 초기화)
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyWeight[]>([]);
  const [wasteRatio, setWasteRatio] = useState<WasteTypeRatio[]>([]);
  const [regionData, setRegionData] = useState<RegionStats[]>([]);
  // ❌ 사용하지 않는/정리해야 할 상태 제거: setActivityType, setOrganization, setSearchText, setOrgOpen, setActivityTypeOpen

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ 컴포넌트 마운트 시 초기 월별 데이터 구조 생성
  useEffect(() => {
    generateMonthlyDataStructure();
    fetchUserInfo(); // 사용자 정보 가져오기
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 모든 드롭다운 닫기
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
      // 날짜, 장소 등 다른 드롭다운도 여기서 처리할 수 있습니다.
      // (현재는 datePickerOpen, locationOpen이 이 useEffect 외부에 의존성을 가질 수 있어 경고 발생 가능)
    };

    if (downloadOpen || datePickerOpen || locationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [downloadOpen, datePickerOpen, locationOpen]);


  // ✅ 사용자 정보 가져오기 (로그인 토큰으로부터)
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.warn("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.code === 0) {
        const userData = result.data;
        setUserId(userData.userId);

        // 단체 회원이면 organizationId도 설정
        // (organizationId는 API 응답 타입에 포함되어 있어야 함)
        if (userData.organizationId) {
          setOrganizationId(userData.organizationId);
        }
        // 사용자가 단체 소속인 경우 기본 뷰 모드를 'organization'으로 설정 (선택 사항)
        // if (userData.memberType === 'GROUP') { setViewMode('organization'); }


        console.log("✅ 사용자 정보 로드:", userData);
      }
    } catch (error) {
      console.error("❌ 사용자 정보 로드 실패:", error);
    }
  };

  // ✅ 장소 옵션
  const locationOptions = ["전체", "동해", "서해", "남해", "제주"];

  // ✅ 데이터 불러오기
  const fetchAllData = async () => {
    // BASE_URL이 없으면 API 호출하지 않음
    if (!BASE_URL) {
      console.warn(
        "BASE_URL이 설정되지 않았습니다. API 호출을 건너뜁니다."
      );
      return;
    }

    try {
      // 필터 파라미터 구성
      const params = new URLSearchParams({
        startDate,
        endDate,
        location: location === "전체" ? "" : location,
      });

      // viewMode에 따라 userId 또는 organizationId 추가
      if (viewMode === "personal" && userId) {
        params.append("userId", userId.toString());
      } else if (viewMode === "organization" && organizationId) {
        params.append("organizationId", organizationId.toString());
      }

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

  // ✅ 초기 로드 시 및 뷰 모드/사용자 ID 변경 시 데이터 불러오기
  useEffect(() => {
    // 초기 표시 날짜 설정
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);

    // userId나 organizationId가 유효할 때만 데이터 로드를 시도합니다.
    if (viewMode === 'personal' && userId !== null) {
      fetchAllData();
    } else if (viewMode === 'organization' && organizationId !== null) {
      fetchAllData();
    } else if (userId === null && organizationId === null) {
      // 사용자 정보가 로드되지 않았거나, 전역 모드일 경우 (현재는 해당 필터 없음)
      // 일단 fetchAllData를 호출하여 전체 데이터를 로드합니다.
      fetchAllData();
    }
    // 💡 의존성 배열에 viewMode, userId, organizationId 추가
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, userId, organizationId]);

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
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;

      // 월 표시 형식: "12월" 또는 "2024-12월" (년도가 다른 경우)
      const monthLabel =
        start.getFullYear() === end.getFullYear()
          ? `${month}월`
          : `${year}-${month}월`;

      // 💡 더미 데이터 생성 로직 대신 0으로 초기화
      months.push({
        month: monthLabel,
        totalWeight: 0,
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
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm ${location === loc
                        ? "bg-blue-50 text-[#0066aa] font-medium"
                        : ""
                        } ${idx === 0 ? "rounded-t-xl" : ""} ${idx === locationOptions.length - 1
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

            {/* 내 정보 / 단체 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("personal")}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${viewMode === "personal"
                  ? "bg-[#0066aa] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                내 정보
              </button>
              <button
                onClick={() => setViewMode("organization")}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${viewMode === "organization"
                  ? "bg-[#0066aa] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                단체
              </button>
            </div>

            <button
              onClick={handleSearch}
              className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-md hover:bg-[#004d7a] hover:shadow-lg hover:scale-105 active:bg-[#002845] active:scale-95 active:shadow-inner transition-all duration-150 font-semibold cursor-pointer"
            >
              조회
            </button>
          </div>

          <div className="relative" ref={downloadRef}>
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
              className={`px-4 py-1 rounded-full text-sm ${unit === "kg"
                ? "bg-[#0066aa] text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit("l")}
              className={`px-4 py-1 rounded-full text-sm ${unit === "l"
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
                className={`px-4 py-1 rounded-md text-sm ${regionMode === "count"
                  ? "bg-[#0066aa] text-white"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                활동 횟수별
              </button>
              <button
                onClick={() => setRegionMode("amount")}
                className={`px-4 py-1 rounded-md text-sm ${regionMode === "amount"
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