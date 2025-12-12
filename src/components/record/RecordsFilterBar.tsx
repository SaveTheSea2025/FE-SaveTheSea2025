import React from "react";
import { SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
    activeRegion: string;
    onRegionChange: (region: string) => void;
    onFilterClick: () => void;
}

const regions = ["동해", "서해", "남해", "제주"];

const RecordsFilterBar: React.FC<FilterBarProps> = ({
    activeRegion,
    onRegionChange,
    onFilterClick,
}) => {
    return (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-[#FDFDFB]">
            {/* 필터 버튼 */}
            <button
                onClick={onFilterClick}
                className="flex items-center gap-1 text-sky-800 border border-sky-800 px-3 py-[6px] rounded-full text-sm font-medium hover:bg-sky-50 transition"
            >
                <SlidersHorizontal size={16} />
                필터
            </button>

            {/* 구분선 */}
            <div className="w-px h-5 bg-gray-300" />

            {/* 지역 필터 */}
            <div className="flex gap-2">
                {regions.map((region) => (
                    <button
                        key={region}
                        onClick={() => onRegionChange(region)}
                        className={`px-3 py-[6px] rounded-full text-sm font-medium border ${activeRegion === region
                            ? "bg-sky-600 text-white border-sky-600"
                            : "bg-white text-sky-800 border-gray-300 hover:bg-sky-50"
                            }`}
                    >
                        {region}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecordsFilterBar;