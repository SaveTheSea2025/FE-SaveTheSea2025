import type { MonthlyAwardItem } from "../../types/ranking";

interface AwardProps {
    data: MonthlyAwardItem;
}

const AwardCard = ({ data }: AwardProps) => {
    return (
        <div className="bg-white shadow-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-yellow-100 flex items-center justify-center text-xl mb-2">
                🏆
            </div>

            <div className="text-gray-500 text-sm">{data.title}</div>

            <div className="font-bold text-lg mt-2">{data.name}</div>

            <div className="text-sm text-gray-500 mt-1">
                {data.value}
                {data.unit}
            </div>
        </div>
    );
};

export default AwardCard;
