// RankTop3Card.tsx

import type { RankItem } from "../../types/ranking";

interface RankCardProps {
    data: RankItem;
}

const RankTop3Card = ({ data }: RankCardProps) => {
    let cardStyle = ""; // 그라데이션 배경 및 그림자 설정
    let rankIcon = "";
    let iconSize = "text-xl";
    let nameSize = "text-lg";
    let weightSize = "text-4xl";
    let paddingY = "py-10";
    let width = "w-56";

    if (data.rank === 1) {
        // 1위: 골드/옐로우 계열의 부드러운 그라데이션
        cardStyle = "bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-xl shadow-yellow-300/40";
        rankIcon = "🏆";
        iconSize = "text-4xl";
        nameSize = "text-xl";
        weightSize = "text-5xl";
        paddingY = "py-14";
        width = "w-64";
    } else if (data.rank === 2) {
        // 2위: 실버/그레이 계열의 부드러운 그라데이션
        cardStyle = "bg-gradient-to-br from-gray-50 to-gray-200 shadow-lg shadow-gray-300/40";
        rankIcon = "🥈";
    } else {
        // 3위: 브론즈/오렌지 계열의 부드러운 그라데이션
        cardStyle = "bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-300/40";
        rankIcon = "🥉";
    }

    return (
        <div
            // 기존의 'border'와 단색 'bg'를 제거하고 'cardStyle'의 그라데이션과 그림자를 적용
            className={`rounded-xl p-6 text-center transition flex flex-col justify-center items-center ${width} ${paddingY} ${cardStyle}`}
        >
            {/* 랭킹 아이콘 */}
            <div className={`mb-2 ${iconSize}`}>{rankIcon}</div>

            {/* 이름 */}
            <div className={`font-semibold ${nameSize}`}>{data.name}</div>

            {/* 무게 */}
            <div className={`font-bold mt-4 ${weightSize}`}>
                {data.totalWeight}kg
            </div>

            {/* 활동 횟수 */}
            <div className="text-sm mt-2 text-gray-600">
                {data.activityCount}회 활동
            </div>
        </div>
    );
};

export default RankTop3Card;