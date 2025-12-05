// AwardCard.tsx

// 필요한 Lucide 아이콘들을 import 합니다.
import { Trash2, Users, Activity } from 'lucide-react';

// RankingPage.tsx에서 AwardCard로 전달하는 데이터의 구조에 맞게 타입을 정의합니다.
// (이 타입은 RankingPage의 getAwardsData 함수가 반환하는 객체의 값 타입과 일치해야 합니다.)
interface AwardCardData {
    userName: string;
    value: number;
    category: 'most_activity' | 'most_weight' | 'most_members';
}

interface AwardProps {
    data: AwardCardData;
}


const AwardCard = ({ data }: AwardProps) => {
    let iconBgGradient = "";
    let IconComponent: React.ElementType | null = null;
    let title = ""; // category 기반으로 제목 설정
    let unit = ""; // category 기반으로 단위 설정
    
    const iconColor = "text-white"; 

    // data.category 값을 기반으로 제목, 단위, 아이콘을 설정합니다.
    if (data.category === "most_activity") {
        // 최대 활동
        title = "최대 활동";
        unit = "회";
        iconBgGradient = "bg-gradient-to-tr from-yellow-400 to-orange-500";
        IconComponent = Activity;
    } else if (data.category === "most_weight") {
        // 최대 수거량 (무게)
        title = "최대 수거량";
        unit = "kg";
        iconBgGradient = "bg-gradient-to-tr from-blue-400 to-cyan-500";
        IconComponent = Trash2;
    } else { // most_members (최다 참여 인원)
        // 최다 참여 인원
        title = "최다 참여 인원";
        unit = "명";
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

            {/* 업적 타이틀 (category 기반으로 설정) */}
            <div className="text-gray-500 text-sm font-medium">{title}</div>

            {/* 달성 단체/개인 (userName 사용) */}
            <div className="font-bold text-xl mt-2 text-[#0270AD]">{data.userName}</div>

            {/* 값과 단위 (category 기반으로 설정) */}
            <div className="text-md text-gray-600 mt-2 font-medium">
                {data.value}
                {unit}
            </div>
        </div>
    );
};

export default AwardCard;