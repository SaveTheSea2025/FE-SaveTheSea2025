// RankListItem.tsx

import type { RankItem } from "../../types/ranking";

interface RankListProps {
    data: RankItem;
}

const RankListItem = ({ data }: RankListProps) => {
    return (
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm w-full flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-4">
                {/* 랭킹 번호 */}
                <div className="text-lg font-bold w-6 text-center text-[#0C4A6E]">
                    {data.rank}
                </div>

                {/* 로고 (더미) */}
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                    logo
                </div>

                {/* 이름 */}
                <div className="font-medium text-lg">{data.name}</div>
            </div>

            <div className="text-right text-gray-600 text-sm flex gap-6">
                {/* 수거량 */}
                <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-500">수거량</div>
                    <div className="font-semibold text-base">{data.totalWeight}kg</div>
                </div>

                {/* 활동 횟수 */}
                <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-500">활동</div>
                    <div className="font-semibold text-base">{data.activityCount}회</div>
                </div>
            </div>
        </div>
    );
};

export default RankListItem;