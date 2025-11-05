import { useState } from "react";

interface WasteSectionProps {
  onChange?: (wastes: { wasteType: string; wasteWeight: number; wasteVolume: number }[]) => void;
}

// ✅ 백엔드 enum에 맞춘 wasteType 매핑
const wasteTypeMap: Record<string, string> = {
  마대: "SACK",
  플라스틱: "PLASTIC",
  캔: "CAN",
  유리: "GLASS",
  종이: "PAPER",
  부표: "BUOY",
  통발: "FISH_TRAP",
  주사기: "SYRINGE",
  약품: "MEDICINE",
  기타: "ETC",
};

const WasteSection = ({ onChange }: WasteSectionProps) => {
  const initialState = Object.keys(wasteTypeMap).reduce(
    (acc, key) => ({
      ...acc,
      [key]: { kg: 0, L: 0 },
    }),
    {} as Record<string, { kg: number; L: number }>
  );

  const [quantities, setQuantities] = useState(initialState);

  // ✅ 입력 변경 핸들러
  const handleChange = (type: string, field: "kg" | "L", value: string) => {
    const num = Number(value);
    if (isNaN(num)) return;

    const updated = {
      ...quantities,
      [type]: { ...quantities[type], [field]: num },
    };

    setQuantities(updated);

    // ✅ 백엔드 전송용 데이터 변환
    const mappedData = Object.entries(updated).map(([key, val]) => ({
      wasteType: wasteTypeMap[key] || "ETC",
      wasteWeight: val.kg,
      wasteVolume: val.L,
    }));

    onChange?.(mappedData);
  };

  return (
    <section className="mb-10">
      <h3 className="text-[22px] font-semibold mb-4">폐기물 입력</h3>

      <p className="text-[#0071CE] font-semibold mb-2">
        STEP 3 <span className="text-black font-normal">폐기물 수거량 입력</span>
      </p>

      <table className="w-full border-collapse border-t border-b border-gray-300 text-sm">
        <thead className="bg-[#f5f6f8]">
          <tr>
            <th className="py-3 border border-gray-300 text-center">구분</th>
            <th className="py-3 border border-gray-300 text-center">무게 (kg)</th>
            <th className="py-3 border border-gray-300 text-center">부피 (L)</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(quantities).map((type) => (
            <tr key={type} className="border-t border-gray-200">
              <td className="py-3 px-2 border border-gray-300 text-center font-medium">{type}</td>
              <td className="py-3 px-2 border border-gray-300 text-center">
                <input
                  type="number"
                  min="0"
                  value={quantities[type].kg}
                  onChange={(e) => handleChange(type, "kg", e.target.value)}
                  className="w-24 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </td>
              <td className="py-3 px-2 border border-gray-300 text-center">
                <input
                  type="number"
                  min="0"
                  value={quantities[type].L}
                  onChange={(e) => handleChange(type, "L", e.target.value)}
                  className="w-24 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default WasteSection;
