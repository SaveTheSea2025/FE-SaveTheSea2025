import Header from "../components/Header";
import { useState, useEffect } from "react";

// icons
import filterIcon from "../assets/filterIcon.png";
import searchIcon from "../assets/searchIcon.png";
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
}

interface RegionStats {
  region: string;
  totalWeight: number;
  totalVolume: number;
}

export default function StatsPage() {
  const [unit, setUnit] = useState<"kg" | "l">("kg");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [regionMode, setRegionMode] = useState<"count" | "amount">("amount");

  // ✅ API 데이터 상태
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyWeight[]>([]);
  const [wasteRatio, setWasteRatio] = useState<WasteTypeRatio[]>([]);
  const [regionData, setRegionData] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ 데이터 불러오기
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. 전체 통계
        const summaryRes = await fetch(`${BASE_URL}/api/statistics/summary`);
        const summaryData = await summaryRes.json();
        if (summaryData.code === 0) {
          setSummaryStats(summaryData.data);
        }

        // 2. 월별 수거량
        const monthlyRes = await fetch(`${BASE_URL}/api/statistics/monthly-weight`);
        const monthlyResult = await monthlyRes.json();
        if (monthlyResult.code === 0) {
          setMonthlyData(monthlyResult.data);
        }

        // 3. 폐기물 비율
        const wasteRes = await fetch(`${BASE_URL}/api/statistics/waste-type-ratio`);
        const wasteResult = await wasteRes.json();
        if (wasteResult.code === 0) {
          setWasteRatio(wasteResult.data);
        }

        // 4. 지역별 통계
        const regionRes = await fetch(`${BASE_URL}/api/statistics/region`);
        const regionResult = await regionRes.json();
        if (regionResult.code === 0) {
          setRegionData(regionResult.data);
        }
      } catch (error) {
        console.error("API 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [BASE_URL]);

  // ✅ 폐기물 한글 변환
  const wasteTypeMap: Record<string, string> = {
    PLASTIC: "플라스틱",
    GLASS: "유리",
    CAN: "금속",
    PAPER: "종이",
    ETC: "기타",
    SACK: "마대수",
    BUOY: "부표",
    FISH_TRAP: "통발",
    SYRINGE: "주사기",
    MEDICINE: "약품",
  };

  const COLORS = ["#004e89", "#1a659e", "#2a9d8f", "#8ecae6", "#d4e09b"];

  if (loading) {
    return (
      <div className="w-full bg-[#e5edf2] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#e5edf2] min-h-screen">
      <Header forceScrolled />

      <div className="max-w-[1200px] mx-auto pt-20 pb-20 px-8">
        <h1 className="text-center text-4xl font-light mb-20">통계</h1>

        {/* 🔹 필터 바 */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 bg-[#0077A7] rounded-full flex items-center justify-center shadow-sm">
              <img src={filterIcon} className="w-5 h-5" />
            </button>

            <SelectBox label="기간" />
            <div className="w-px h-6 bg-gray-300"></div>
            <SelectBox label="장소" />
            <SelectBox label="활동 유형" />

            <div className="relative">
              <input
                placeholder="단체 명을 입력해주세요."
                className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm w-56 pr-10 focus:outline-none"
              />
              <img src={searchIcon} className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-70" />
            </div>

            <button className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-sm hover:bg-[#005a95] transition">
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
              <div className="absolute right-0 mt-2 bg-white border p-3 rounded-xl shadow-md w-44 z-10">
                <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
                  <img src={pdfIcon} className="w-5 h-5" /> PDF 보고서 다운로드
                </div>
                <div className="flex items-center gap-2 px-2 py-2 mt-1 hover:bg-gray-50 rounded-md cursor-pointer">
                  <img src={excelIcon} className="w-5 h-5" /> 데이터 엑셀 다운로드
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 활동 보고서 */}
        <h2 className="text-lg font-semibold mb-4">1, 2분기 활동 보고서</h2>

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
                unit === "kg" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit("l")}
              className={`px-4 py-1 rounded-full text-sm ${
                unit === "l" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
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
                <Tooltip />
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
          <div className="flex justify-between items-center">
            <div className="w-[350px] h-[260px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={wasteRatio.map((w) => ({
                      name: wasteTypeMap[w.wasteType] || w.wasteType,
                      value: w.ratio,
                    }))}
                    dataKey="value"
                    outerRadius={90}
                    innerRadius={50}
                    stroke="#fff"
                    strokeWidth={3}
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                  >
                    {wasteRatio.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-[340px] text-sm space-y-4 ml-10">
              {wasteRatio.map((item, idx) => (
                <LegendRow
                  key={item.wasteType}
                  label={wasteTypeMap[item.wasteType] || item.wasteType}
                  percent={`${item.ratio.toFixed(1)}%`}
                  color={COLORS[idx % COLORS.length]}
                />
              ))}
            </div>
          </div>
        </SectionBox>

        {/* 🔹 지역별 활동 */}
        <SectionBox
          title="지역별 활동 현황"
          rightElement={
            <div className="flex gap-2">
              <button
                onClick={() => setRegionMode("amount")}
                className={`px-4 py-1 rounded-md text-sm ${
                  regionMode === "amount" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                수거량별
              </button>
            </div>
          }
        >
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey={regionMode === "amount" ? "totalWeight" : "totalVolume"}
                  fill="#0066aa"
                  barSize={65}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
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

function SelectBox({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none">
        <option>{label}</option>
      </select>
      <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">▼</span>
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

function LegendRow({ label, percent, color }: any) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-sm" style={{ background: color }}></div>
        <span>{label}</span>
      </div>
      <span className="text-gray-500">{percent}</span>
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