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

                {/* 로고 (더미 -> profileUrl 이미지로 대체) */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-200">
                    {/* data.profileUrl이 있을 경우 이미지를 표시하고, 없을 경우 기본 로고 또는 이니셜 표시 */}
                    {data.profileUrl ? (
                        <img 
                            src={data.profileUrl} 
                            alt={`${data.userName} 프로필`} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        // profileUrl이 없을 경우, 회색 배경에 사용자 이름의 첫 글자를 표시합니다.
                        <div className="text-xs text-gray-600">
                            {/* userName이 있을 경우 첫 글자를, 없으면 '?'를 표시 */}
                            {data.userName ? data.userName[0] : '?'}
                        </div>
                    )}
                </div>

                {/* 이름 (data.name -> data.userName으로 수정) */}
                <div className="font-medium text-lg">{data.userName}</div>
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