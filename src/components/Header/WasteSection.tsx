{/* ===================== 폐기물선택 코드 ===================== */}
import React, { useState } from "react";

const WasteSection = () => {
  // 선택된 항목 관리
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // 각 항목의 수량 관리
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

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

  // 체크박스 클릭 시 실행
  const handleCheckboxChange = (item: string) => {
    if (selectedItems.includes(item)) {
      // 이미 선택된 경우 → 해제
      setSelectedItems(selectedItems.filter((v) => v !== item));
      const updated = { ...quantities };
      delete updated[item];
      setQuantities(updated);
    } else {
      // 새로 선택된 경우
      setSelectedItems([...selectedItems, item]);
      setQuantities({ ...quantities, [item]: 0 });
    }
  };

  // 수량 입력 시 상태 업데이트
  const handleQuantityChange = (item: string, value: string) => {
    const num = Math.max(0, Number(value));
    setQuantities({ ...quantities, [item]: num });
  };

  return (
    <section className="mb-10">
      <h3 className="text-[22px] font-semibold mb-4">
        폐기물 <span className="text-red-500">*</span>
      </h3>

      <div className="border border-gray-300 border-l-0 border-r-0 text-sm">
        {/* 총 수거량 */}
        <div className="grid grid-cols-6 border-b border-gray-300">
          <div className="bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300 col-span-1">
            총 수거량(kg)
          </div>
          <div className="px-4 py-3 border-r border-gray-300 col-span-1">
            <input
              type="number"
              min={0}
              defaultValue={0}
              className="w-full border border-gray-300 rounded px-2 py-1 text-center bg-white"
            />
          </div>
          <div className="px-2 py-3 border-r border-gray-300 text-center col-span-1">
            kg
          </div>
          <div className="bg-[#f7f8fa] px-4 py-3 font-medium border-r border-gray-300 col-span-1">
            총 수거량(L)
          </div>
          <div className="px-4 py-3 border-r border-gray-300 col-span-1">
            <input
              type="number"
              min={0}
              defaultValue={0}
              className="w-full border border-gray-300 rounded px-2 py-1 text-center bg-white"
            />
          </div>
          <div className="px-2 py-3 text-center col-span-1">L</div>
        </div>

        {/* 체크박스 */}
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

        {/* 선택된 항목만 표시 */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-8 px-4 py-4 bg-[#f9f9f9] border-t border-gray-300">
            {selectedItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <label className="font-medium text-gray-800">{item}</label>
                <input
                  type="number"
                  min={0}
                  value={quantities[item] || 0}
                  onChange={(e) => handleQuantityChange(item, e.target.value)}
                  className="w-20 border border-gray-300 rounded px-3 py-1 text-center bg-white"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WasteSection;
