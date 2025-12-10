/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from "../components/common/Header";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// icons
import filterIcon from "../assets/stats/filterIcon.webp";
import downloadIcon from "../assets/stats/downloadIcon.webp";
import pdfIcon from "../assets/stats/pdfIcon.webp";
import excelIcon from "../assets/stats/excelIcon.webp";
import activityIcon from "../assets/stats/activityIcon.webp";
import personIcon from "../assets/stats/personIcon.webp";
import weightIcon from "../assets/stats/weightIcon.webp";
import volumeIcon from "../assets/stats/volumeIcon.webp";

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
  const { user } = useAuth();

  const [unit, setUnit] = useState<"kg" | "l">("kg");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [regionMode, setRegionMode] = useState<"count" | "amount">("count");

  const downloadRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  const [startDate, setStartDate] = useState<string>(
    oneYearAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );
  const [location, setLocation] = useState<string>("전체 지역");
  const [viewMode, setViewMode] = useState<"mine" | "all">("all"); // 기본값을 "all"로 변경

  const [displayStartDate, setDisplayStartDate] = useState<string>(
    oneYearAgo.toISOString().split("T")[0]
  );
  const [displayEndDate, setDisplayEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyWeight[]>([]);
  const [wasteRatio, setWasteRatio] = useState<WasteTypeRatio[]>([]);
  const [regionData, setRegionData] = useState<RegionStats[]>([]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
    // 로그인 여부와 관계없이 데이터 로드
    // 비로그인 시 자동으로 전체 데이터 조회
    if (!user) {
      setViewMode("all");
    }
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
    };

    if (downloadOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [downloadOpen]);

  const locationOptions = ["전체 지역", "동해", "서해", "남해", "제주"];

  // ✅ 백엔드 API와 완전히 일치하도록 수정
  const fetchAllData = async () => {
    if (!BASE_URL) {
      console.warn("BASE_URL이 설정되지 않았습니다.");
      return;
    }

    // 비로그인 시 전체 데이터만 조회 가능
    if (!user && viewMode === "mine") {
      console.warn("비로그인 상태에서는 전체 데이터만 조회 가능합니다.");
      setViewMode("all");
      return;
    }

    try {
      // ✅ 날짜를 년/월로 변환
      const startYear = parseInt(startDate.split("-")[0]);
      const startMonth = parseInt(startDate.split("-")[1]);
      const endYear = parseInt(endDate.split("-")[0]);
      const endMonth = parseInt(endDate.split("-")[1]);

      // ✅ region 매핑
      const regionParam = location === "전체 지역" ? "" : location;

      // ✅ Authorization 헤더
      const token = localStorage.getItem("accessToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log("🔍 [API 호출 정보]");
      console.log("startYear:", startYear, "startMonth:", startMonth);
      console.log("endYear:", endYear, "endMonth:", endMonth);
      console.log("region:", regionParam);
      console.log("viewMode:", viewMode);

      // 1. 전체 통계
      try {
        const params = new URLSearchParams({
          startYear: startYear.toString(),
          startMonth: startMonth.toString(),
          endYear: endYear.toString(),
          endMonth: endMonth.toString(),
        });
        if (regionParam) params.append("region", regionParam);

        const summaryUrl = viewMode === "mine"
          ? `${BASE_URL}/api/statistics/my-summary?${params}`
          : `${BASE_URL}/api/statistics/summary?${params}`;

        console.log("📡 전체 통계 요청:", summaryUrl);

        const summaryRes = await fetch(summaryUrl, { headers });
        const summaryData = await summaryRes.json();

        console.log("📦 전체 통계 응답:", summaryData);

        if (summaryData.code === 0) {
          // ✅ 백엔드 응답 필드명 확인 및 매핑
          const data = summaryData.data;
          setSummaryStats({
            activityCount: data.activityCount ?? 0,
            // ✅ 실제 API 응답: totalParticipants (복수형)
            totalMembers: data.totalParticipants ?? data.totalParticipant ?? 0,
            totalWeight: data.totalWeight ?? 0,
            totalVolume: data.totalVolume ?? 0,
          });
          console.log("✅ 전체 통계 로드 완료", data);
        }
      } catch (err) {
        console.error("❌ 전체 통계 API 실패:", err);
      }

      // 2. 월별 수거량
      try {
        const params = new URLSearchParams({
          startYear: startYear.toString(),
          startMonth: startMonth.toString(),
          endYear: endYear.toString(),
          endMonth: endMonth.toString(),
        });
        if (regionParam) params.append("region", regionParam);

        const monthlyUrl = viewMode === "mine"
          ? `${BASE_URL}/api/statistics/my-monthly-change?${params}`
          : `${BASE_URL}/api/statistics/monthly-change?${params}`;

        console.log("📡 월별 수거량 요청:", monthlyUrl);

        const monthlyRes = await fetch(monthlyUrl, { headers });
        const monthlyResult = await monthlyRes.json();

        console.log("📦 월별 수거량 응답:", monthlyResult);

        if (monthlyResult.code === 0 && monthlyResult.data.length > 0) {
          // ✅ 백엔드: { year, month, totalWeight, totalVolume }
          // ✅ 프론트: { month: "2025-11", totalWeight }
          const formatted = monthlyResult.data.map((item: any) => ({
            month: `${item.year}-${String(item.month).padStart(2, "0")}`,
            totalWeight: item.totalWeight,
            totalVolume: item.totalVolume,
          }));
          setMonthlyData(formatted);
          console.log("✅ 월별 수거량 로드 완료");
        } else {
          setMonthlyData([]);
        }
      } catch (err) {
        console.error("❌ 월별 수거량 API 실패:", err);
        setMonthlyData([]);
      }

      // 3. 폐기물 비율
      try {
        const params = new URLSearchParams({
          startYear: startYear.toString(),
          startMonth: startMonth.toString(),
          endYear: endYear.toString(),
          endMonth: endMonth.toString(),
        });
        if (regionParam) params.append("region", regionParam);

        const wasteUrl = viewMode === "mine"
          ? `${BASE_URL}/api/statistics/my-waste-type-ratio?${params}`
          : `${BASE_URL}/api/statistics/waste-type-ratio?${params}`;

        console.log("📡 폐기물 비율 요청:", wasteUrl);

        const wasteRes = await fetch(wasteUrl, { headers });
        const wasteResult = await wasteRes.json();

        console.log("📦 폐기물 비율 응답:", wasteResult);

        if (wasteResult.code === 0) {
          // ✅ 백엔드: { wasteType, weight, percentage }
          // ✅ 프론트: { wasteType, weight, ratio }
          const formatted = wasteResult.data.map((item: any) => ({
            wasteType: item.wasteType,
            weight: item.weight,
            ratio: item.percentage,
          }));
          setWasteRatio(formatted);
          console.log("✅ 폐기물 비율 로드 완료");
        }
      } catch (err) {
        console.error("❌ 폐기물 비율 API 실패:", err);
      }

      // 4. 지역별 통계
      // ⚠️ 백엔드 확인 필요: 실제 엔드포인트가 /region인지 /region-activity인지 확인
      try {
        const params = new URLSearchParams({
          startYear: startYear.toString(),
          startMonth: startMonth.toString(),
          endYear: endYear.toString(),
          endMonth: endMonth.toString(),
        });

        // 백엔드 API 문서: /api/statistics/region (확인 필요)
        const regionUrl = viewMode === "mine"
          ? `${BASE_URL}/api/statistics/my-region-activity?${params}`
          : `${BASE_URL}/api/statistics/region-activity?${params}`;

        console.log("📡 지역별 통계 요청:", regionUrl);

        const regionRes = await fetch(regionUrl, { headers });
        const regionResult = await regionRes.json();

        console.log("📦 지역별 통계 응답:", regionResult);

        if (regionResult.code === 0) {
          setRegionData(regionResult.data);
          console.log("✅ 지역별 통계 로드 완료");
        } else {
          console.warn("⚠️ 지역별 통계 API 응답 코드:", regionResult.code);
          setRegionData([]);
        }
      } catch (err) {
        console.error("❌ 지역별 통계 API 실패:", err);
        setRegionData([]);
      }

      console.log("🎉 모든 API 호출 완료");
    } catch (error) {
      console.error("전체 API 로드 오류:", error);
    }
  };

  const handleSearch = () => {
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
    fetchAllData();
  };

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
    "#004e89", // 가장 진한 파랑 (54% - 종이)
    "#1a659e", // 진한 파랑 (26% - 플라스틱)
    "#2e7ca8", // 중간 파랑 (5% - 통발)
    "#4d91b5", // (5% - 박스)
    "#6ba6c3", // (4% - 무표)
    "#89bbd1", // (4% - 마대)
    "#a7d0df", // (3% - 기타)
    "#c5e5ed", // 가장 밝은 파랑 (1% - 금속)
    "#e0f2f7", // 거의 하얀 파랑 (0% - 약품)
  ];

  const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null);

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

            {/* 내정보/전체 토글 스위치 */}
            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setViewMode("personal")}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${viewMode === "personal"
                  ? "bg-[#0066aa] text-white shadow-md"
                  : "text-gray-600"
                  }`}
              >
                내정보
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${viewMode === "all"
                  ? "bg-[#0066aa] text-white shadow-md"
                  : "text-gray-600"
                  }`}
              >
                전체
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

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

            {/* 조회 버튼 */}
            <button
              onClick={handleSearch}
              className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-md hover:bg-[#004d7a] hover:shadow-lg hover:scale-105 active:bg-[#002845] active:scale-95 active:shadow-inner transition-all duration-150 font-semibold cursor-pointer"
            >
              조회
            </button>

            {/* 초기화 버튼 */}
            <button
              onClick={() => {
                const today = new Date();
                const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

                setStartDate(oneYearAgo.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
                setLocation("전체 지역");
                setViewMode("personal");

                setDisplayStartDate(oneYearAgo.toISOString().split("T")[0]);
                setDisplayEndDate(today.toISOString().split("T")[0]);

                fetchAllData();
              }}
              className="px-5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-sm shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-150 font-medium cursor-pointer"
            >
              초기화
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
            value={`${summaryStats?.activityCount ?? 0}회`}
            icon={activityIcon}
          />
          <SummaryCard
            title="총 참여자 수"
            value={`${(summaryStats?.totalMembers ?? 0).toLocaleString()}명`}
            icon={personIcon}
          />
          <SummaryCard
            title="총 수거량"
            value={`${(summaryStats?.totalWeight ?? 0).toLocaleString()}kg`}
            icon={weightIcon}
          />
          <SummaryCard
            title="총 수거 부피"
            value={`${(summaryStats?.totalVolume ?? 0).toLocaleString()}L`}
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

          {monthlyData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9d9d9" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [value, unit === "kg" ? "무게(kg)" : "부피(L)"]}
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
                    dataKey={unit === "kg" ? "totalWeight" : "totalVolume"}
                    stroke="#0066aa"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#0066aa" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-72 flex items-center justify-center text-gray-400">
              <p>조회된 데이터가 없습니다.</p>
            </div>
          )}
        </SectionBox>

        {/* 🔹 폐기물 분류 비율 */}
        <SectionBox title="폐기물 분류 비율">
          <div className="flex justify-between items-start gap-12">
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

              {/* 범례 - 호버 효과 추가 */}
              <div className="flex-1 pt-4">
                <div className="grid grid-cols-1 gap-3">
                  {[...wasteRatio]
                    .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
                    .map((item, idx) => (
                      <div
                        key={item.wasteType}
                        onMouseEnter={() => setHoveredWasteType(item.wasteType)}
                        onMouseLeave={() => setHoveredWasteType(null)}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
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
          ) : (
            <div className="w-full h-72 flex items-center justify-center text-gray-400">
              <p>조회된 데이터가 없습니다.</p>
            </div>
          )}
        </SectionBox>

        {/* 🔹 지역별 활동 */}
        <SectionBox
          title="지역별 활동 현황"
          rightElement={
            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
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
          {regionData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                {regionMode === "count" ? (
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis allowDecimals={false} />
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
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis allowDecimals={false} />
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
          ) : (
            <div className="w-full h-72 flex items-center justify-center text-gray-400">
              <p>조회된 데이터가 없습니다.</p>
            </div>
          )}
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