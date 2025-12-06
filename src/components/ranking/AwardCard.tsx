// AwardCard.tsx 

import { Trash2, Users, Activity } from 'lucide-react';

interface AwardCardData {
    userName: string;
    value: number;
    category: 'most_activity' | 'most_weight' | 'most_members';
}

interface AwardProps {
    data: AwardCardData;
    isPersonalTab: boolean;
}

const AwardCard = ({ data }: AwardProps) => {
    let iconBgGradient = "";
    let IconComponent: React.ElementType | null = null;
    let title = "";
    let unit = "";

    const iconColor = "text-white";

    if (data.category === "most_activity") {
        title = "최대 활동";
        unit = "회";
        iconBgGradient = "bg-gradient-to-tr from-yellow-400 to-orange-500";
        IconComponent = Activity;
    } else if (data.category === "most_weight") {
        title = "최대 수거량";
        unit = "kg";
        iconBgGradient = "bg-gradient-to-tr from-blue-400 to-cyan-500";
        IconComponent = Trash2;
    } else {
        title = "최다 참여 인원";
        unit = "명";
        iconBgGradient = "bg-gradient-to-tr from-green-400 to-lime-500";
        IconComponent = Users;
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-8 text-center h-full">
            <div
                className={`w-14 h-14 mx-auto rounded-full ${iconBgGradient} flex items-center justify-center text-2xl mb-4 ${iconColor} shadow-md`}
            >
                {IconComponent && <IconComponent size={28} strokeWidth={2.5} />}
            </div>

            <div className="text-gray-500 text-sm font-medium">{title}</div>
            <div className="font-bold text-xl mt-2 text-[#0270AD]">{data.userName}</div>
            <div className="text-md text-gray-600 mt-2 font-medium">
                {data.value}
                {unit}
            </div>
        </div>
    );
};

export default AwardCard;