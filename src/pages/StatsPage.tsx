import Header from "../components/Header";

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

import { useState } from "react";

export default function StatsPage() {
  const [unit, setUnit] = useState<"kg" | "l">("kg");
  const [downloadOpen, setDownloadOpen] = useState(false);

  // 🔹 지역별 그래프 토글
  const [regionMode, setRegionMode] = useState<"count" | "amount">("count");

  const monthlyData = [
    { month: "1월", kg: 600, l: 800 },
    { month: "2월", kg: 650, l: 880 },
    { month: "3월", kg: 900, l: 1100 },
    { month: "4월", kg: 850, l: 1000 },
    { month: "5월", kg: 1000, l: 1300 },
    { month: "6월", kg: 1100, l: 1400 },
    { month: "7월", kg: 1200, l: 1500 },
    { month: "8월", kg: 1350, l: 1650 },
    { month: "9월", kg: 1150, l: 1400 },
    { month: "10월", kg: 1250, l: 1500 },
    { month: "11월", kg: 1000, l: 1250 },
  ];

  const wasteRatio = [
    { name: "플라스틱", value: 45 },
    { name: "유리", value: 15 },
    { name: "금속", value: 10 },
    { name: "종이", value: 13 },
    { name: "기타", value: 17 },
  ];

  const COLORS = ["#004e89", "#1a659e", "#2a9d8f", "#8ecae6", "#d4e09b"];

  const regionData = [
    { region: "부산", cnt: 120, amount: 350 },
    { region: "강릉", cnt: 85, amount: 250 },
    { region: "제주", cnt: 110, amount: 330 },
    { region: "인천", cnt: 75, amount: 200 },
    { region: "여수", cnt: 65, amount: 180 },
  ];

  return (
    <div className="w-full bg-[#e5edf2] min-h-screen">
      <Header />

      <div className="max-w-[1200px] mx-auto pt-20 pb-20 px-8">

        {/* 제목 */}
        <h1 className="text-center text-4xl font-light mb-20">통계</h1>

        {/* 🔹 필터 바 */}
        <div className="flex items-center justify-between mb-10">

          {/* 왼쪽 필터 그룹 */}
          <div className="flex items-center gap-4">

            {/* 필터 아이콘 */}
            <button className="w-9 h-9 bg-[#0077A7] rounded-full flex items-center justify-center shadow-sm">
              <img src={filterIcon} className="w-5 h-5" />
            </button>

            {/* 선택창 */}
            <SelectBox label="기간" />
            <div className="w-px h-6 bg-gray-300"></div>
            <SelectBox label="장소" />
            <SelectBox label="활동 유형" />

            {/* 검색창 */}
            <div className="relative">
              <input
                placeholder="단체 명을 입력해주세요."
                className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm w-56 pr-10 focus:outline-none"
              />
              <img src={searchIcon} className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-70" />
            </div>

            {/* 조회 버튼 */}
            <button className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-sm hover:bg-[#005a95] transition">
              조회
            </button>
          </div>

          {/* 파일 다운로드 */}
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
          <SummaryCard title="활동 수" value="453회" icon={activityIcon} />
          <SummaryCard title="총 참여자 수" value="2,847명" icon={personIcon} />
          <SummaryCard title="총 수거량" value="7,800kg" icon={weightIcon} />
          <SummaryCard title="총 수거 부피" value="15,600L" icon={volumeIcon} />
        </div>

        {/* 🔹 월별 수거량 추이 */}
        <SectionBox title="월별 수거량 추이">

          {/* KG / L 토글 */}
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={() => setUnit("kg")}
              className={`px-4 py-1 rounded-full text-sm ${unit === "kg" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
                }`}
            >
              kg
            </button>

            <button
              onClick={() => setUnit("l")}
              className={`px-4 py-1 rounded-full text-sm ${unit === "l" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
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
                  dataKey={unit}
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

            {/* Donut Chart */}
            <div className="w-[350px] h-[260px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={wasteRatio}
                    dataKey="value"
                    outerRadius={90}
                    innerRadius={50}
                    stroke="#fff"
                    strokeWidth={3}
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {wasteRatio.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 오른쪽 표 */}
            <div className="w-[340px] text-sm space-y-4 ml-10">

              <LegendRow label="플라스틱" value="3,500kg" percent="45%" color={COLORS[0]} />
              <LegendRow label="유리" value="1,200kg" percent="15%" color={COLORS[1]} />
              <LegendRow label="금속" value="800kg" percent="10%" color={COLORS[2]} />
              <LegendRow label="종이" value="1,000kg" percent="13%" color={COLORS[3]} />
              <LegendRow label="기타" value="1,300kg" percent="17%" color={COLORS[4]} />

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
                className={`px-4 py-1 rounded-md text-sm ${regionMode === "count" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
                  }`}
              >
                활동 횟수별
              </button>

              <button
                onClick={() => setRegionMode("amount")}
                className={`px-4 py-1 rounded-md text-sm ${regionMode === "amount" ? "bg-[#0066aa] text-white" : "bg-gray-200 text-gray-600"
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
                  dataKey={regionMode === "count" ? "cnt" : "amount"}
                  fill="#0066aa"
                  barSize={65}  // 🔹 첫 번째 사진처럼 두꺼운 막대
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

function LegendRow({ label, value, percent, color }: any) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-sm" style={{ background: color }}></div>
        <span>{label}</span>
      </div>
      <span className="text-gray-500">{value}</span>
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
