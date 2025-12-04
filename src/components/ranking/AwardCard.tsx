// AwardCard.tsx

// 필요한 Lucide 아이콘들을 import 합니다.
import { Trash2, Users, Activity } from 'lucide-react';
import type { MonthlyAwardItem } from "../../types/ranking";

interface AwardProps {
    data: MonthlyAwardItem;
}

const AwardCard = ({ data }: AwardProps) => {
    let iconBgGradient = "";
    let IconComponent: React.ElementType | null = null;
    const iconColor = "text-white"; // 아이콘 색상은 흰색으로 통일

    // 데이터 제목에 따라 그라데이션 배경과 Lucide 아이콘 컴포넌트를 조건부로 설정합니다.
    if (data.title === "최대 활동") {
        // 활동: 활기찬 느낌의 노란색/주황색 그라데이션
        iconBgGradient = "bg-gradient-to-tr from-yellow-400 to-orange-500";
        IconComponent = Activity;
    } else if (data.title === "최대 수거량") {
        // 수거량: 바다/환경 느낌의 파란색/청록색 그라데이션
        iconBgGradient = "bg-gradient-to-tr from-blue-400 to-cyan-500";
        IconComponent = Trash2;
    } else { // 최다 참여 인원
        // 인원: 협동/성장 느낌의 녹색/라임색 그라데이션
        iconBgGradient = "bg-gradient-to-tr from-green-400 to-lime-500";
        IconComponent = Users;
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-8 text-center h-full">
            {/* 아이콘 컨테이너: 그라데이션 배경 적용 */}
            <div
                className={`w-14 h-14 mx-auto rounded-full ${iconBgGradient} flex items-center justify-center text-2xl mb-4 ${iconColor} shadow-md`}
            >
                {/* Lucide 아이콘 렌더링 */}
                {IconComponent && <IconComponent size={28} strokeWidth={2.5} />}
            </div>

            {/* 업적 타이틀 */}
            <div className="text-gray-500 text-sm font-medium">{data.title}</div>

            {/* 달성 단체/개인 */}
            <div className="font-bold text-xl mt-2 text-[#0270AD]">{data.name}</div>

            {/* 값과 단위 */}
            <div className="text-md text-gray-600 mt-2 font-medium">
                {data.value}
                {data.unit}
            </div>
        </div>
    );
};

export default AwardCard;