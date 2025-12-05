// RankTop3Card.tsx

import type { RankItem } from "../../types/ranking";

// SVG 파일을 URL로 import (Vite/Webpack 등의 기본 동작: string URL)
import FirstRankIcon from "../../assets/ranking/first.svg";
import SecondRankIcon from "../../assets/ranking/second.svg";
import ThirdRankIcon from "../../assets/ranking/third.svg";

interface RankCardProps {
    data: RankItem;
}

const RankTop3Card = ({ data }: RankCardProps) => {
    let cardStyle = "";
    let iconSrc = ""; // 이미지 src (string)

// Tailwind 초기값 (w-h 클래스로 SVG 컨테이너 크기 제어)
    let iconSize = "w-8 h-8";
    let nameSize = "text-lg";
    let weightSize = "text-4xl";
    let paddingY = "py-10";
    let width = "w-56";

    if (data.rank === 1) {
        cardStyle = "bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-xl shadow-yellow-300/40";
        iconSrc = FirstRankIcon;

        iconSize = "w-12 h-12";
        nameSize = "text-xl";
        weightSize = "text-5xl";
        paddingY = "py-14";
        width = "w-64";
    } else if (data.rank === 2) {
        cardStyle = "bg-gradient-to-br from-gray-50 to-gray-200 shadow-lg shadow-gray-300/40";
        iconSrc = SecondRankIcon;
    } else {
        cardStyle = "bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-300/40";
        iconSrc = ThirdRankIcon;
    }

    return (
        <div
            className={`rounded-xl p-6 text-center transition flex flex-col justify-center items-center ${width} ${paddingY} ${cardStyle}`}
        >
            {/* 랭킹 아이콘 */}
            <div className={`mb-2 ${iconSize}`}>
                <img
                    src={iconSrc}
                    alt="rank icon"
                    className="w-full h-full object-contain"
                />
            </div>

            {/* 이름 (data.name -> data.userName으로 수정) */}
            <div className={`font-semibold ${nameSize}`}>{data.userName}</div>

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