import React, { useState, useMemo, useEffect } from "react";

interface WasteSectionProps {
  onChange?: (
    wasteList: { wasteType: string; wasteWeight: number; wasteVolume: number }[]
  ) => void;
}

const WasteSection = ({ onChange }: WasteSectionProps) => {
  // 한글 → 백엔드 ENUM 매핑
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

  // 내부 저장 값은 number이지만 입력 중 문자열도 허용 (입력 UX 위해)
  const [quantities, setQuantities] = useState<{
    [key: string]: { kg: number | string; L: number | string };
  }>({});

  // 체크박스 선택/해제
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

  // ===== 입력 변경 (소수점 자연 입력 지원) =====
  const handleQuantityChange = (
    item: string,
    type: "kg" | "L",
    value: string
  ) => {
    // 숫자 + 소수점만 허용
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(value)) return;

    // 빈 값 허용 → 내부엔 "" 저장
    if (value === "") {
      setQuantities({
        ...quantities,
        [item]: { ...quantities[item], [type]: "" },
      });
      return;
    }

    // 중간 입력: "1." → 문자열 그대로 유지
    if (value.endsWith(".")) {
      setQuantities({
        ...quantities,
        [item]: { ...quantities[item], [type]: value },
      });
      return;
    }

    // 숫자로 변환 가능한 경우
    const num = Number(value);
    setQuantities({
      ...quantities,
      [item]: { ...quantities[item], [type]: isNaN(num) ? "" : num },
    });
  };

  // ===== blur 시 숫자로 정리 "1." → 1 =====
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

  // ===== 총합 계산 (string | number 문제 해결!!) =====
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
  
    // JS 부동소수점 보정 (소숫점 제한 없음)
    return {
      kg: parseFloat(sum.kg.toPrecision(12)),
      L: parseFloat(sum.L.toPrecision(12)),
    };
  }, [quantities]);
  
  
  

  // ===== 부모로 전달 (항상 number로 보냄) =====
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
      <h3 className="text-lg font-semibold mb-4">
        폐기물 <span className="text-red-500">*</span>
      </h3>

      {/* ===== 총합 표시 ===== */}
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

        {/* ===== 체크박스 ===== */}
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

        {/* ===== 선택된 항목의 입력칸 ===== */}
        {selectedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-y-10 gap-x-8 px-6 py-4 bg-white border-t border-gray-300">
            {selectedItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <label className="w-16 font-medium text-gray-800">{item}</label>

                {/* KG 입력 */}
                <input
                  type="number"
                  step="1"
                  min={0}
                  value={quantities[item]?.kg}
                  onChange={(e) =>
                    handleQuantityChange(item, "kg", e.target.value)
                  }
                  onBlur={(e) => handleBlur(item, "kg")}
                  onFocus={(e) => e.target.select()}     // ✨ 클릭 시 전체 선택됨
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center bg-[#f7f8fa] text-gray-700"
                />
                <span className="text-gray-600">kg</span>

                <span className="mx-1 text-gray-400">/</span>

                {/* L 입력 */}
                <input
                  type="number"
                  step="1"
                  min={0}
                  value={quantities[item]?.L}
                  onChange={(e) =>
                    handleQuantityChange(item, "L", e.target.value)
                  }
                  onBlur={(e) => handleBlur(item, "L")}
                  onFocus={(e) => e.target.select()}     // ✨ 클릭 시 전체 선택됨
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
