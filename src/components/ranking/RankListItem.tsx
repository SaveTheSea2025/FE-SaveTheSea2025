import type { RankItem } from "../../types/ranking";

interface RankListProps {
    data: RankItem;
}

const RankListItem = ({ data }: RankListProps) => {
    return (
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm w-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="text-lg font-bold ">{data.rank}</div>

                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                    logo
                </div>

                <div className="font-medium">{data.name}</div>
            </div>

            <div className="text-right text-gray-500 text-sm">
                <div>수거량 {data.totalWeight}kg</div>
                <div>활동 {data.activityCount}회</div>
            </div>
        </div>
    );
};

export default RankListItem;
