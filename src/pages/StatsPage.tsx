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
import instance from "../api/axios";

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

interface SummaryStats {
  activityCount: number;
  totalMembers: number;
  totalWeight: number;
  totalVolume: number;
}

interface MonthlyWeight {
  month: string;
  totalWeight: number;
  totalVolume: number;
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
  const [loading, setLoading] = useState(false);

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
  const [viewMode, setViewMode] = useState<"mine" | "all">("all");

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

  useEffect(() => {
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);

    if (!user && viewMode === "mine") {
      setViewMode("all");
      return;
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, viewMode]);

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

  const fetchAllData = async () => {
    if (!user && viewMode === "mine") {
      return;
    }

    setLoading(true);

    try {
      const regionParam = location === "전체 지역" ? "전체" : location;

      console.log("[API 호출 정보]");
      console.log("startDate:", startDate);
      console.log("endDate:", endDate);
      console.log("region:", regionParam);
      console.log("viewMode:", viewMode);

      // ✅ viewMode를 파라미터에 추가
      const commonParams = {
        viewMode: viewMode,
        startDate: startDate,
        endDate: endDate,
        region: regionParam,
      };

      // 1. 전체 통계 - ✅ 엔드포인트 통일
      try {
        const summaryUrl = "/api/statistics/summary";

        console.log("전체 통계 요청:", summaryUrl, commonParams);

        const summaryRes = await instance.get(summaryUrl, { params: commonParams });
        const summaryData = summaryRes.data;

        if (summaryData.code === 0) {
          const data = summaryData.data;
          setSummaryStats({
            activityCount: data.activityCount ?? 0,
            totalMembers: data.totalParticipants ?? data.totalParticipant ?? 0,
            totalWeight: data.totalWeight ?? 0,
            totalVolume: data.totalVolume ?? 0,
          });
        }
      } catch (err) {
        console.error("전체 통계 API 실패:", err);
      }

      // 2. 월별 수거량 - ✅ 엔드포인트 통일
      try {
        const monthlyUrl = "/api/statistics/monthly-change";

        console.log("월별 수거량 요청:", monthlyUrl, commonParams);

        const monthlyRes = await instance.get(monthlyUrl, { params: commonParams });
        const monthlyResult = monthlyRes.data;

        if (monthlyResult.code === 0 && monthlyResult.data.length > 0) {
          console.log("📊 백엔드 원본 데이터:", monthlyResult.data);
          
          const fillMissingMonths = (data: any[]) => {
            const result: any[] = [];
            
            const startYear = parseInt(startDate.split("-")[0]);
            const startMonth = parseInt(startDate.split("-")[1]);
            const endYear = parseInt(endDate.split("-")[0]);
            const endMonth = parseInt(endDate.split("-")[1]);
            
            let currentYear = startYear;
            let currentMonth = startMonth;
            
            while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
              const monthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
              
              const found = data.find((item: any) => 
                item.year === currentYear && item.month === currentMonth
              );
              
              result.push({
                month: monthKey,
                totalWeight: found?.totalWeight || 0,
                totalVolume: found?.totalVolume || 0,
              });
              
              currentMonth++;
              if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
              }
            }
            
            return result;
          };
          
          const formatted = fillMissingMonths(monthlyResult.data);
          console.log("📊 빠진 월 채운 데이터:", formatted);
          setMonthlyData(formatted);
        } else {
          setMonthlyData([]);
        }
      } catch (err) {
        console.error("월별 수거량 API 실패:", err);
        setMonthlyData([]);
      }

      // 3. 폐기물 비율 - ✅ 엔드포인트 통일
      try {
        const wasteUrl = "/api/statistics/waste-type-ratio";

        console.log("폐기물 비율 요청:", wasteUrl, commonParams);

        const wasteRes = await instance.get(wasteUrl, { params: commonParams });
        const wasteResult = wasteRes.data;

        if (wasteResult.code === 0) {
          const formatted = wasteResult.data.map((item: any) => ({
            wasteType: item.wasteType,
            weight: item.weight,
            ratio: item.percentage,
          }));
          setWasteRatio(formatted);
        }
      } catch (err) {
        console.error("폐기물 비율 API 실패:", err);
      }

      // 4. 지역별 통계 - ✅ 엔드포인트 통일
      try {
        const regionUrl = "/api/statistics/region-activity";

        console.log("지역별 통계 요청:", regionUrl, commonParams);

        const regionRes = await instance.get(regionUrl, { params: commonParams });
        const regionResult = regionRes.data;

        if (regionResult.code === 0) {
          setRegionData(regionResult.data);
        } else {
          setRegionData([]);
        }
      } catch (err) {
        console.error("지역별 통계 API 실패:", err);
        setRegionData([]);
      }

    } catch (error) {
      console.error("전체 API 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
    fetchAllData();
  };

  const handleExcelDownload = async () => {
    try {
      const regionParam = location === "전체 지역" ? "전체" : location;

      const params = {
        viewType: viewMode,
        startDate: startDate,
        endDate: endDate,
        region: regionParam,
      };

      console.log("📊 엑셀 다운로드 요청:", params);

      const response = await instance.get("/api/export/excel", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const startYear = parseInt(startDate.split("-")[0]);
      const startMonth = parseInt(startDate.split("-")[1]);
      const endYear = parseInt(endDate.split("-")[0]);
      const endMonth = parseInt(endDate.split("-")[1]);
      const dateRange = `${startYear}${String(startMonth).padStart(2, "0")}-${endYear}${String(endMonth).padStart(2, "0")}`;
      const prefix = viewMode === "mine" ? user?.userName || "사용자" : "전체";
      const fileName = `${prefix}_통계데이터_${dateRange}.xlsx`;
      
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadOpen(false);
    } catch (error: any) {
      console.error("❌ 엑셀 다운로드 실패:", error);
      alert("엑셀 다운로드에 실패했습니다.");
    }
  };

  const handlePdfDownload = async () => {
    try {
      const regionParam = location === "전체 지역" ? "전체" : location;

      const params = {
        scope: viewMode,
        startDate: startDate,
        endDate: endDate,
        region: regionParam,
      };

      console.log("PDF 다운로드 요청:", params);

      const response = await instance.get("/api/statistics/pdf/download", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const startYear = parseInt(startDate.split("-")[0]);
      const startMonth = parseInt(startDate.split("-")[1]);
      const endYear = parseInt(endDate.split("-")[0]);
      const endMonth = parseInt(endDate.split("-")[1]);
      const dateRange = `${startYear}${String(startMonth).padStart(2, "0")}-${endYear}${String(endMonth).padStart(2, "0")}`;
      const prefix = viewMode === "mine" ? user?.userName || "사용자" : "전체";
      const fileName = `${prefix}_통계보고서_${dateRange}.pdf`;
      
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadOpen(false);
    } catch (error: any) {
      console.error("PDF 다운로드 실패:", error);
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  const wasteTypeMap: Record<string, string> = {
    PLASTIC: "페트병",
    GLASS: "유리",
    CAN: "캔",
    PAPER: "박스",
    ETC: "기타",
    SACK: "마대",
    BUOY: "부표",
    FISH_TRAP: "통발",
    SYRINGE: "주사기",
    MEDICINE: "약품",
    RUBBER: "고무류",
    FOREIGN_WASTE: "외국쓰레기",
    METAL: "금속류",
    WOOD: "나무류",
    COMPOSITE: "혼합재질류",
  };

  const COLORS = [
    "#08306b",
    "#08519c",
    "#084594",
    "#2171b5",
    "#2171b5",
    "#4292c6",
    "#4292c6",
    "#6baed6",
    "#6baed6",
    "#9ecae1",
    "#9ecae1",
    "#c6dbef",
    "#c6dbef",
    "#deebf7",
    "#eff3ff",
  ];

  const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null);

  return (
    <div className="w-full bg-[#e5edf2] min-h-screen">
      <Header forceScrolled />

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3"></div>
          <p className="text-sm tracking-wide">데이터 로딩 중입니다...</p>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto pt-48 pb-20 px-8">
        <h2 className="text-center text-[22px] md:text-[30px] font-bold text-center mb-20 leading-normal">통계</h2>

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 bg-[#0077A7] rounded-full flex items-center justify-center shadow-sm">
              <img src={filterIcon} className="w-5 h-5" />
            </button>

            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => {
                  if (!user) {
                    alert("로그인이 필요한 기능입니다.");
                    return;
                  }
                  setViewMode("mine");
                }}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${viewMode === "mine"
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

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-md hover:bg-[#004d7a] hover:shadow-lg hover:scale-105 active:bg-[#002845] active:scale-95 active:shadow-inner transition-all duration-150 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              조회
            </button>

            <button
              onClick={() => {
                const today = new Date();
                const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

                setStartDate(oneYearAgo.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
                setLocation("전체 지역");
                setViewMode(user ? "mine" : "all");

                setDisplayStartDate(oneYearAgo.toISOString().split("T")[0]);
                setDisplayEndDate(today.toISOString().split("T")[0]);

                fetchAllData();
              }}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-sm shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-150 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div
                  onClick={handlePdfDownload}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-t-xl cursor-pointer transition"
                >
                  <img src={pdfIcon} className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">PDF 보고서 다운로드</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div
                  onClick={handleExcelDownload}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-b-xl cursor-pointer transition"
                >
                  <img src={excelIcon} className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">데이터 엑셀 다운로드</span>
                </div>
              </div>
            )}
          </div>
        </div>

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

        <SectionBox title="월별 수거량 추이">
          <div className="flex justify-end mb-4">
            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setUnit("kg")}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${unit === "kg"
                  ? "bg-[#0066aa] text-white shadow-md"
                  : "text-gray-600"
                  }`}
              >
                kg
              </button>
              <button
                onClick={() => setUnit("l")}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${unit === "l"
                  ? "bg-[#0066aa] text-white shadow-md"
                  : "text-gray-600"
                  }`}
              >
                L
              </button>
            </div>
          </div>

          {monthlyData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9d9d9" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
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
            <div className="w-full h-72 flex items-center justify-center text-gray-400 min-h-[288px]">
              <p>조회된 데이터가 없습니다.</p>
            </div>
          )}
        </SectionBox>

        <SectionBox title="폐기물 분류 비율">
          {wasteRatio.length > 0 ? (
            <div className="flex justify-center items-center gap-16">
              <div className="w-[420px] h-[400px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[...wasteRatio]
                        .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
                        .map((w) => ({
                          name: wasteTypeMap[w.wasteType] || w.wasteType,
                          value: w.ratio,
                          wasteType: w.wasteType,
                        }))}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      outerRadius={100}
                      innerRadius={65}
                      stroke="#fff"
                      strokeWidth={3}
                      labelLine={false}
                      label={(props) => {
                        const { name, value, cx, cy, midAngle, outerRadius } = props;
                        const ratio = Number(value ?? 0);

                        if (ratio <= 3) return null;

                        const RADIAN = Math.PI / 180;
                        const normalizedAngle = ((90 - (midAngle ?? 0)) % 360 + 360) % 360;

                        let baseDistance = 40;
                        if (ratio < 7) baseDistance = 70;
                        else if (ratio < 10) baseDistance = 60;
                        else if (ratio < 15) baseDistance = 50;

                        if (normalizedAngle > 180 && normalizedAngle < 360) {
                          baseDistance += 8;
                        }

                        const lineStartRadius = outerRadius + 5;
                        const lineStartX = cx + lineStartRadius * Math.cos(-(midAngle ?? 0) * RADIAN);
                        const lineStartY = cy + lineStartRadius * Math.sin(-(midAngle ?? 0) * RADIAN);

                        const radius = outerRadius + baseDistance;
                        const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
                        const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

                        const safeValue = ratio.toFixed(0);
                        const fontSize = ratio < 7 ? 10 : ratio < 10 ? 11 : ratio < 15 ? 12 : 13;

                        return (
                          <g>
                            <line
                              x1={lineStartX}
                              y1={lineStartY}
                              x2={x}
                              y2={y}
                              stroke="#0066aa"
                              strokeWidth={1.5}
                            />
                            <text
                              x={x}
                              y={y}
                              fill="#0066aa"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              fontSize={fontSize}
                              fontWeight="600"
                            >
                              {`${name} ${safeValue}%`}
                            </text>
                          </g>
                        );
                      }}
                    >
                      {[...wasteRatio]
                        .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
                        .map((item, idx) => (
                          <Cell
                            key={idx}
                            fill={COLORS[idx % COLORS.length]}
                            opacity={hoveredWasteType === null || hoveredWasteType === item.wasteType ? 1 : 0.3}
                            style={{ transition: 'opacity 0.2s' }}
                          />
                        ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

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
            <div className="w-full h-72 flex items-center justify-center text-gray-400 min-h-[288px]">
              <p>조회된 데이터가 없습니다.</p>
            </div>
          )}
        </SectionBox>

        <SectionBox
          title="지역별 활동 현황"
          rightElement={
            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setRegionMode("count")}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${regionMode === "count"
                  ? "bg-[#0066aa] text-white shadow-md"
                  : "text-gray-600"
                  }`}
              >
                활동 횟수별
              </button>
              <button
                onClick={() => setRegionMode("amount")}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${regionMode === "amount"
                  ? "bg-[#0066aa] text-white shadow-md"
                  : "text-gray-600"
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
            <div className="w-full h-72 flex items-center justify-center text-gray-400 min-h-[288px]">
              <p>조회된 데이터가 없습니다.</p>
            </div>
          )}
        </SectionBox>
      </div>
    </div>
  );
}

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