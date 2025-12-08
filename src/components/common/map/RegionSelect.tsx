import { useState } from "react";
import { regions } from "../../../data/regions";

interface Props {
  onSelect: (region: { sido: string; sigungu: string }) => void;
}

const RegionSelect = ({ onSelect }: Props) => {
  const [sido, setSido] = useState("선택");
  const [sigungu, setSigungu] = useState("선택");

  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSido(selected);
    setSigungu("선택");
    onSelect({ sido: selected, sigungu: "선택" });
  };

  const handleSigunguChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSigungu(selected);
    onSelect({ sido, sigungu: selected });
  };

  return (
    <div className="grid grid-cols-4 border-b border-gray-300">
      <div className="bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
        시/도
      </div>
      <div className="px-4 py-3 border-r border-gray-300 bg-[#f7f8fa]">
        <select
          className="w-full border border-gray-300 bg-white rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
          value={sido}
          onChange={handleSidoChange}
        >
          <option>선택</option>
          {Object.keys(regions).map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300">
        시·군·구
      </div>
      <div className="px-4 py-3 bg-[#f7f8fa]">
        <select
          className="w-full border border-gray-300 bg-white rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
          value={sigungu}
          onChange={handleSigunguChange}
        >
          <option>선택</option>
          {sido !== "선택" &&
            regions[sido].map((r: string) => <option key={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
};

export default RegionSelect;
