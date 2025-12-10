import React from "react";
import { Calendar, MapPin, Users, Trash2 } from "lucide-react";

interface RecordCardProps {
    username: string;       // 작성자 이름
    profileUrl: string;     // 프로필 이미지 URL
    activityName: string;   // 활동명 (제목)

    date: string;           // 날짜 및 시간
    location: string;       // 장소 (시/도 시/군/구)
    people: number;         // 참여 인원
    weight: string;         // 수거량
    thumbnail: string;      // 대표사진 (썸네일)
    onClick?: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({
    username,
    profileUrl,
    activityName,
    date,
    location,
    people,
    weight,
    thumbnail,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className="flex bg-white border border-gray-100 rounded-[12px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md active:scale-[0.99]"
            style={{
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
        >
            {/* ✅ 왼쪽: 활동 썸네일 이미지 */}
            <div className="p-3 pr-0 flex-shrink-0">
                <div className="w-[100px] h-[100px] rounded-[8px] bg-gray-200 overflow-hidden relative">
                    <img
                        src={thumbnail}
                        alt="활동 사진"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* ✅ 오른쪽: 정보 영역 */}
            <div className="flex flex-col justify-between flex-1 p-3 min-w-0">

                {/* 1. 상단: 프로필 + 유저네임 */}
                <div className="flex items-center gap-2 mb-1">
                    <img
                        src={profileUrl}
                        alt="프로필"
                        className="w-5 h-5 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-xs text-gray-500 font-medium truncate">
                        {username}
                    </span>
                </div>

                {/* 2. 중단: 활동명 (제목) */}
                <h3 className="font-bold text-[#114C79] text-[15px] leading-tight mb-2 truncate">
                    {activityName}
                </h3>

                {/* 3. 하단 정보 */}
                <div className="flex flex-col gap-[2px] text-xs text-gray-600">

                    {/* 날짜 */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar size={12} className="text-sky-600 flex-shrink-0" />
                        <span className="truncate">{date}</span>
                    </div>

                    {/* 장소 */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={12} className="text-sky-600 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>

                    {/* ✅ 참여자 & 수거량 (한 줄 배치 / 순서 변경 / 디자인 통일) */}
                    <div className="flex items-center gap-3 mt-1">
                        {/* 참여자 (먼저 표시) */}
                        <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-sky-600 flex-shrink-0" />
                            <span>{people}명</span>
                        </div>

                        {/* 수거량 */}
                        <div className="flex items-center gap-1.5">
                            <Trash2 size={12} className="text-sky-600 flex-shrink-0" />
                            <span>{weight}kg</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RecordCard;