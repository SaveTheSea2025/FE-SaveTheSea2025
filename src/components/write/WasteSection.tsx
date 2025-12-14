/* eslint-disable prefer-const */
import { useState, useMemo, useEffect } from "react";

interface WasteSectionProps {
  onChange?: (
    wasteList: { wasteType: string; wasteWeight: number; wasteVolume: number }[]
  ) => void;
}

const WasteSection = ({ onChange }: WasteSectionProps) => {
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
    고무: "RUBBER",
    외국쓰레기: "FOREIGN_WASTE",
    금속: "METAL",
    나무: "WOOD",
    혼합재질: "COMPOSITE",
    기타: "ETC",
  };

  const wasteOptions = [
    "마대",
    "플라스틱",
    "캔",
    "유리",
    "종이",
    "부표",
    "통발",
    "주사기",
    "약품",
    "고무",
    "외국쓰레기",
    "금속",
    "나무",
    "혼합재질",
    "기타",
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<{
    [key: string]: { kg: number | string; L: number | string };
  }>({});

  const handleCheckboxChange = (item: string) => {
    if (selectedItems.includes(item)) {
      const updated = selectedItems.filter((v) => v !== item);
      setSelectedItems(updated);
      const copy = { ...quantities };
      delete copy[item];
      setQuantities(copy);
    } else {
      const updated = [...selectedItems, item];
      const sorted = wasteOptions.filter((opt) => updated.includes(opt));
      setSelectedItems(sorted);
      setQuantities({ ...quantities, [item]: { kg: 0, L: 0 } });
    }
  };

  const handleQuantityChange = (
    item: string,
    type: "kg" | "L",
    value: string
  ) => {
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(value)) return;

    if (value === "") {
      setQuantities({
        ...quantities,
        [item]: { ...quantities[item], [type]: "" },
      });
      return;
    }

    if (value.endsWith(".")) {
      setQuantities({
        ...quantities,
        [item]: { ...quantities[item], [type]: value },
      });
      return;
    }

    const num = Number(value);
    setQuantities({
      ...quantities,
      [item]: { ...quantities[item], [type]: isNaN(num) ? "" : num },
    });
  };

  const handleBlur = (item: string, type: "kg" | "L") => {
    let v = quantities[item][type];

    if (v === "" || v === "." || v === "0.") {
      setQuantities({
        ...quantities,
        [item]: { ...quantities[item], [type]: 0 },
      });
      return;
    }

    if (typeof v === "string" && v.endsWith(".")) {
      setQuantities({
        ...quantities,
        [item]: {
          ...quantities[item],
          [type]: Number(v.slice(0, -1)),
        },
      });
    }
  };

  const total = useMemo(() => {
    const sum = Object.values(quantities).reduce(
      (acc: { kg: number; L: number }, cur) => {
        const kg = Number(cur.kg) || 0;
        const L = Number(cur.L) || 0;

        return {
          kg: acc.kg + kg,
          L: acc.L + L,
        };
      },
      { kg: 0, L: 0 }
    );

    return {
      kg: parseFloat(sum.kg.toPrecision(12)),
      L: parseFloat(sum.L.toPrecision(12)),
    };
  }, [quantities]);

  useEffect(() => {
    const wasteList = selectedItems.map((item) => ({
      wasteType: wasteTypeMap[item] || "ETC",
      wasteWeight: Number(quantities[item]?.kg) || 0,
      wasteVolume: Number(quantities[item]?.L) || 0,
    }));
    onChange?.(wasteList);
  }, [selectedItems, quantities, onChange]);

  return (
    <section className="mb-10">
      <h3 className="text-base md:text-lg font-semibold mb-4">
        폐기물 <span className="text-red-500">*</span>
      </h3>

      {/* 데스크톱 버전 */}
      <div className="hidden md:block border border-gray-300 text-sm border-l-0 border-r-0">
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

        {selectedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-y-10 gap-x-8 px-6 py-4 bg-white border-t border-gray-300">
            {selectedItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <label className="w-20 font-medium text-gray-800">{item}</label>
                <input
                  type="number"
                  step="1"
                  min={0}
                  value={quantities[item]?.kg}
                  onChange={(e) =>
                    handleQuantityChange(item, "kg", e.target.value)
                  }
                  onBlur={() => handleBlur(item, "kg")}
                  onFocus={(e) => e.target.select()}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center bg-[#f7f8fa] text-gray-700"
                />
                <span className="text-gray-600">kg</span>
                <span className="mx-1 text-gray-400">/</span>
                <input
                  type="number"
                  step="1"
                  min={0}
                  value={quantities[item]?.L}
                  onChange={(e) =>
                    handleQuantityChange(item, "L", e.target.value)
                  }
                  onBlur={() => handleBlur(item, "L")}
                  onFocus={(e) => e.target.select()}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center bg-[#f7f8fa] text-gray-700"
                />
                <span className="text-gray-600">L</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 모바일 버전 - 왼쪽 라벨 제거 및 간격 조정 */}
      <div className="md:hidden border-t border-b border-gray-300">
        {/* 총 수거량 */}
        <div className="border-b border-gray-300 py-4">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-semibold text-gray-700 w-28 flex-shrink-0">총 수거량(kg)</label>
            <div className="flex items-center flex-1">
              <input
                type="number"
                readOnly
                value={total.kg}
                className="flex-1 border border-gray-300 rounded bg-gray-50 text-center text-gray-700 py-2 text-sm"
              />
              <span className="ml-2 text-sm text-gray-600 w-8 flex-shrink-0">kg</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 w-28 flex-shrink-0">총 수거량(L)</label>
            <div className="flex items-center flex-1">
              <input
                type="number"
                readOnly
                value={total.L}
                className="flex-1 border border-gray-300 rounded bg-gray-50 text-center text-gray-700 py-2 text-sm"
              />
              <span className="ml-2 text-sm text-gray-600 w-8 flex-shrink-0">L</span>
            </div>
          </div>
        </div>

        {/* 구분 체크박스 */}
        <div className="border-b border-gray-300 py-4">
          <label className="block text-sm font-semibold mb-3 text-gray-700">구분</label>
          <div className="grid grid-cols-3 gap-3">
            {wasteOptions.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-sky-600"
                  checked={selectedItems.includes(item)}
                  onChange={() => handleCheckboxChange(item)}
                />
                <span className="text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ✅ 선택된 항목 입력 - 폐기물 이름을 왼쪽에 배치 */}
        {selectedItems.length > 0 && (
          <div className="py-4 space-y-6">
            <label className="block text-sm font-semibold text-gray-700">폐기물</label>
            {selectedItems.map((item) => (
              <div key={item} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">{item}</span>
                  <input
                    type="number"
                    step="1"
                    min={0}
                    value={quantities[item]?.kg}
                    onChange={(e) =>
                      handleQuantityChange(item, "kg", e.target.value)
                    }
                    onBlur={() => handleBlur(item, "kg")}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 border border-gray-300 rounded px-3 py-2.5 text-center bg-white text-gray-700 text-sm"
                  />
                  <span className="text-sm text-gray-600 w-8 flex-shrink-0">kg</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-20 flex-shrink-0"></span>
                  <input
                    type="number"
                    step="1"
                    min={0}
                    value={quantities[item]?.L}
                    onChange={(e) =>
                      handleQuantityChange(item, "L", e.target.value)
                    }
                    onBlur={() => handleBlur(item, "L")}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 border border-gray-300 rounded px-3 py-2.5 text-center bg-white text-gray-700 text-sm"
                  />
                  <span className="text-sm text-gray-600 w-8 flex-shrink-0">L</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WasteSection;