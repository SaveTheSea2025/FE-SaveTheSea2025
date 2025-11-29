import type { RankItem } from "../../types/ranking";

interface RankCardProps {
    data: RankItem;
}

const RankTop3Card = ({ data }: RankCardProps) => {
    const bg =
        data.rank === 1
            ? "bg-yellow-50 border-yellow-300"
            : data.rank === 2
                ? "bg-gray-100 border-gray-300"
                : "bg-orange-50 border-orange-300";

    return (
        <div
            className={`w-56 rounded-xl shadow-lg p-6 text-center border ${bg} transition`}
        >
            <div className="text-4xl mb-2">🏅</div>
            <div className="text-lg font-semibold">{data.name}</div>
            <div className="text-3xl font-bold mt-4">{data.totalWeight}kg</div>
            <div className="text-sm mt-2 text-gray-600">
                {data.activityCount}회 활동
            </div>
        </div>
    );
};

export default RankTop3Card;
