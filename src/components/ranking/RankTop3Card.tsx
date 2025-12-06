// RankTop3Card.tsx (수정된 코드)

import type { RankItem } from "../../types/ranking";

// SVG 파일을 URL로 import (Vite/Webpack 등의 기본 동작: string URL)
import FirstRankIcon from "../../assets/ranking/first.svg";
import SecondRankIcon from "../../assets/ranking/second.svg";
import ThirdRankIcon from "../../assets/ranking/third.svg";

interface RankCardProps {
    // data는 RankItem이거나 (데이터가 있을 때) null (데이터가 없을 때)
    data: RankItem | null;
    rank: 1 | 2 | 3; // 이 카드가 나타내는 순위 (새로 추가)
}

// 순위별 스타일 정의 (Tailwind 클래스)
const RANK_STYLES = {
    1: {
        cardStyle: "bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-xl shadow-yellow-300/40",
        iconSrc: FirstRankIcon,
        iconSize: "w-12 h-12",
        nameSize: "text-xl",
        weightSize: "text-5xl",
        paddingY: "py-14",
        width: "w-64",
        rankText: "1위",
    },
    2: {
        cardStyle: "bg-gradient-to-br from-gray-50 to-gray-200 shadow-lg shadow-gray-300/40",
        iconSrc: SecondRankIcon,
        iconSize: "w-8 h-8",
        nameSize: "text-lg",
        weightSize: "text-4xl",
        paddingY: "py-10",
        width: "w-56",
        rankText: "2위",
    },
    3: {
        cardStyle: "bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-300/40",
        iconSrc: ThirdRankIcon,
        iconSize: "w-8 h-8",
        nameSize: "text-lg",
        weightSize: "text-4xl",
        paddingY: "py-10",
        width: "w-56",
        rankText: "3위",
    },
};

const RankTop3Card = ({ data, rank }: RankCardProps) => {
    // rank prop을 사용하여 스타일을 결정
    const { cardStyle, iconSrc, iconSize, nameSize, weightSize, paddingY, width, rankText } = RANK_STYLES[rank];

    // 데이터가 없는 경우 (Empty State)
    if (!data) {
        // 데이터가 없을 때의 스타일
        const emptyCardStyle = rank === 1
            ? "bg-gray-100 shadow-md border-2 border-gray-300/50"
            : "bg-gray-50 shadow-sm border border-gray-200/50";

        return (
            <div
                className={`rounded-xl p-6 text-center transition flex flex-col justify-center items-center text-gray-400 ${width} ${paddingY} ${emptyCardStyle}`}
            >
                {/* 랭킹 아이콘 자리 */}
                <div className={`mb-2 ${iconSize}`}>
                    <img
                        src={iconSrc}
                        alt={`${rankText} icon`}
                        className="w-full h-full object-contain opacity-30" // 아이콘을 흐리게
                    />
                </div>

                {/* 이름 (순위 텍스트) */}
                <div className={`font-semibold ${nameSize}`}>{rankText}</div>

                {/* 데이터 없음 메시지 */}
                <div className={`font-bold mt-4 text-2xl`}>
                    없습니다
                </div>

                {/* 하단 설명 */}
                <div className="text-xs mt-2 text-gray-400">
                    아직 기록이 없어요
                </div>
            </div>
        );
    }

    // 데이터가 있는 경우
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

            {/* 이름 */}
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