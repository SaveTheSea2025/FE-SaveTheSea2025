import Header from "../components/Header";
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
  Legend,
  BarChart,
  Bar,
} from "recharts";

export default function StatsPage() {
  const monthlyData = [
    { month: "1월", kg: 600 },
    { month: "2월", kg: 650 },
    { month: "3월", kg: 900 },
    { month: "4월", kg: 850 },
    { month: "5월", kg: 1000 },
    { month: "6월", kg: 1100 },
    { month: "7월", kg: 1200 },
    { month: "8월", kg: 1350 },
    { month: "9월", kg: 1150 },
    { month: "10월", kg: 1250 },
    { month: "11월", kg: 1000 },
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
    { region: "부산", cnt: 120 },
    { region: "강릉", cnt: 85 },
    { region: "제주", cnt: 110 },
    { region: "인천", cnt: 75 },
    { region: "여수", cnt: 65 },
  ];

  return (
    <div className="w-full bg-[#e5edf2] min-h-screen">
      <Header />

      <div className="max-w-[1200px] mx-auto pt-20 pb-20 px-8">

        {/* 제목 */}
        <h1 className="text-center text-4xl font-light mb-20">통계</h1>

        {/* 상단 필터 */}
        {/* 필터 영역 */}
<div className="flex items-center justify-between mb-10">

{/* 왼쪽 필터 */}
<div className="flex items-center gap-4">

  {/* 필터 아이콘 버튼 */}
  <button className="w-9 h-9 bg-[#0077A7] rounded-full flex items-center justify-center shadow-sm text-white text-sm">
    필터
  </button>

  {/* 기간 */}
  <div className="relative">
    <select
      className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none focus:border-blue-400"
    >
      <option>기간</option>
    </select>
    <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">▼</span>
  </div>

  {/* 구분선 */}
  <div className="w-px h-6 bg-gray-300"></div>

  {/* 장소 */}
  <div className="relative">
    <select
      className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none focus:border-blue-400"
    >
      <option>장소</option>
    </select>
    <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">▼</span>
  </div>

  {/* 활동 유형 */}
  <div className="relative">
    <select
      className="appearance-none bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm pr-8 focus:outline-none focus:border-blue-400"
    >
      <option>활동 유형</option>
    </select>
    <span className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">▼</span>
  </div>

  {/* 입력창 */}
  <div className="relative">
    <input
      placeholder="단체 명을 입력해주세요."
      className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm w-56 focus:outline-none focus:border-blue-400"
    />
    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">🔍</span>
  </div>

  {/* 조회 버튼 */}
  <button className="px-5 py-2 rounded-xl bg-[#0066aa] text-white text-sm shadow-sm hover:bg-[#005a95] transition">
    조회
  </button>
</div>

{/* 파일 다운로드 */}
<button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white border border-gray-200 text-sm shadow-sm hover:bg-gray-50 transition">
  ⬇️ 파일 다운
</button>
</div>


        {/* 중간 제목 */}
        <h2 className="text-lg font-semibold mb-4">1, 2분기 활동 보고서</h2>

        {/* 카드 4개 */}
        <div className="grid grid-cols-4 gap-6 mb-14">
          <SummaryCard title="활동 수" value="453회" icon="활동 아이콘 자리" />
          <SummaryCard title="총 참여자 수" value="2,847명" icon="참여자 아이콘 자리" />
          <SummaryCard title="총 수거량" value="7,800kg" icon="수거량 아이콘 자리" />
          <SummaryCard title="총 수거 부피" value="15,600L" icon="부피 아이콘 자리" />
        </div>

        {/* 월별 수거량 추이 */}
        <SectionBox title="월별 수거량 추이">
          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9d9d9" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#0066aa"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#0066aa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionBox>

        {/* 폐기물 분류 */}
        <SectionBox title="폐기물 분류 비율">
          <div className="flex justify-between items-center">
            <div className="w-[380px] h-[260px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={wasteRatio}
                    dataKey="value"
                    outerRadius={95}
                    innerRadius={45}
                    label
                  >
                    {wasteRatio.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 오른쪽 텍스트 */}
            <div className="text-sm leading-7">
              {wasteRatio.map((item) => (
                <p key={item.name} className="flex justify-between w-36">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </p>
              ))}
            </div>
          </div>
        </SectionBox>

        {/* 지역별 활동 */}
        <SectionBox title="지역별 활동 현황">
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cnt" fill="#005f99" barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

// components -------------------

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>

      {/* 네가 이미지 넣을 자리 */}
      <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-[10px] text-gray-600">
        {icon}
      </div>
    </div>
  );
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-14">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      {children}
    </div>
  );
}
