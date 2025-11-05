import React, { useState, useMemo, useEffect } from "react";

interface WasteSectionProps {
  onChange?: (
    wasteList: { wasteType: string; wasteWeight: number; wasteVolume: number }[]
  ) => void;
}

const WasteSection = ({ onChange }: WasteSectionProps) => {
  // ✅ 한글 → 백엔드 ENUM 코드 매핑
  const wasteTypeMap: Record<string, string> = {
    마대수: "SACK",
    페트병: "PLASTIC",
    캔: "CAN",
    유리병: "GLASS",
    박스: "PAPER",
    부표: "BUOY",
    통발: "FISH_TRAP",
    주사기: "SYRINGE",
    약품: "MEDICINE",
    기타: "ETC",
  };

  // ✅ 체크박스 표시 항목
  const wasteOptions = [
    "마대수",
    "부표",
    "페트병",
    "박스",
    "통발",
    "주사기",
    "약품",
    "기타",
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: { kg: number; L: number } }>({});

  // ✅ 체크박스 선택/해제
  const handleCheckboxChange = (item: string) => {
    if (selectedItems.includes(item)) {
      const updated = selectedItems.filter((v) => v !== item);
      setSelectedItems(updated);
      const qCopy = { ...quantities };
      delete qCopy[item];
      setQuantities(qCopy);
    } else {
      const updated = [...selectedItems, item];
      const sorted = wasteOptions.filter((opt) => updated.includes(opt));
      setSelectedItems(sorted);
      setQuantities({ ...quantities, [item]: { kg: 0, L: 0 } });
    }
  };

  // ✅ 항목별 kg/L 입력
  const handleQuantityChange = (item: string, type: "kg" | "L", value: string) => {
    const num = Math.max(0, Number(value));
    setQuantities({
      ...quantities,
      [item]: { ...quantities[item], [type]: num },
    });
  };

  // ✅ 총합 계산
  const total = useMemo(() => {
    return Object.values(quantities).reduce(
      (acc, cur) => ({
        kg: acc.kg + (cur.kg || 0),
        L: acc.L + (cur.L || 0),
      }),
      { kg: 0, L: 0 }
    );
  }, [quantities]);

  // ✅ 부모 컴포넌트로 데이터 전달 (백엔드 ENUM 변환)
  useEffect(() => {
    const wasteList = selectedItems.map((item) => ({
      wasteType: wasteTypeMap[item] || "ETC", // ✅ 한글 → ENUM 변환
      wasteWeight: quantities[item]?.kg || 0,
      wasteVolume: quantities[item]?.L || 0,
    }));
    onChange?.(wasteList);
  }, [selectedItems, quantities, onChange]);

  return (
    <section className="mb-10">
      <h3 className="text-[22px] font-semibold mb-4">
        폐기물 <span className="text-red-500">*</span>
      </h3>

      {/* ==================== 상단 총 수거량 ==================== */}
      <div className="border border-gray-300 text-sm border-l-0 border-r-0">
        <div className="grid grid-cols-6 border-b border-gray-300 h-[44px]">
          <div className="bg-[#f7f8fa] px-4 py-2 font-medium border-r border-b border-gray-300 col-span-1 flex items-center">
            총 수거량(kg)
          </div>
          <div className="px-4 py-2 col-span-1 flex items-center">
            <input
              type="number"
              readOnly
              value={total.kg}
              className="w-full border border-gray-300 rounded bg-[#f7f8fa] text-center text-gray-700 cursor-not-allowed h-[28px]"
            />
          </div>
          <div className="px-2 py-3 border-r border-gray-300 col-span-1 flex items-center justify-center">
            kg
          </div>

          <div className="bg-[#f7f8fa] px-4 py-2 font-medium border-b border-r border-gray-300 col-span-1 flex items-center">
            총 수거량(L)
          </div>
          <div className="px-4 py-2 col-span-1 flex items-center">
            <input
              type="number"
              readOnly
              value={total.L}
              className="w-full border border-gray-300 rounded bg-[#f7f8fa] text-center text-gray-700 cursor-not-allowed h-[28px]"
            />
          </div>
          <div className="px-2 py-3 col-span-1 flex items-center justify-center">
            L
          </div>
        </div>

        {/* ==================== 체크박스 ==================== */}
        <div className="flex flex-wrap gap-6 px-4 py-4 border-b border-gray-300">
          {wasteOptions.map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-sky-600"
                checked={selectedItems.includes(item)}
                onChange={() => handleCheckboxChange(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        {/* ==================== 선택된 항목 ==================== */}
        {selectedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-y-10 gap-x-8 px-6 py-4 bg-white border-t border-gray-300">
            {wasteOptions
              .filter((item) => selectedItems.includes(item))
              .map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <label className="w-16 font-medium text-gray-800">{item}</label>
                  <input
                    type="number"
                    min={0}
                    value={quantities[item]?.kg || 0}
                    onChange={(e) => handleQuantityChange(item, "kg", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center bg-[#f7f8fa] text-gray-700"
                  />
                  <span className="text-gray-600">kg</span>
                  <span className="mx-1 text-gray-400">/</span>
                  <input
                    type="number"
                    min={0}
                    value={quantities[item]?.L || 0}
                    onChange={(e) => handleQuantityChange(item, "L", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center bg-[#f7f8fa] text-gray-700"
                  />
                  <span className="text-gray-600">L</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WasteSection;
