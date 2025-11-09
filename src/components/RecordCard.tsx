import React from "react";
import { Calendar, MapPin, Users, Trash2 } from "lucide-react";

interface RecordCardProps {
    title: string;       // 단체명
    date: string;        // 날짜 및 시간
    location: string;    // 장소
    people: number;      // 참여 인원
    weight: string;      // 수거량
    mainImage: string;   // 대표사진 URL
    logoImage: string;   // 단체 로고 URL
}

const RecordCard: React.FC<RecordCardProps> = ({
    title,
    date,
    location,
    people,
    weight,
    mainImage,
    logoImage,
}) => {
    return (
        <div
            className="flex bg-white border border-gray-100 hover:shadow-lg transition rounded-[10px] overflow-hidden"
            style={{
                boxShadow:
                    "0px 7px 3px rgba(0, 0, 0, 0.01), 0px 4px 2px rgba(0, 0, 0, 0.03), 0px 2px 2px rgba(0, 0, 0, 0.06), 0px 0px 1px rgba(0, 0, 0, 0.07)",
            }}
        >
            {/* ✅ 왼쪽 대표 이미지 (균등 여백) */}
            <div className="p-3 flex-shrink-0">
                <div className="w-[120px] h-[120px] rounded-[6px] bg-gray-200 overflow-hidden">
                    <img
                        src={mainImage}
                        alt="대표사진"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* ✅ 오른쪽 정보 영역 */}
            <div className="flex flex-col justify-center flex-1 pr-4 py-3">
                {/* 상단: 로고 + 단체명 */}
                <div className="flex items-center gap-2 mb-2">
                    <img
                        src={logoImage}
                        alt="단체 로고"
                        className="w-6 h-6 rounded-full bg-gray-300 object-cover"
                    />
                    <h3 className="font-semibold text-sky-700 text-sm">{title}</h3>
                </div>

                {/* 세부 정보 */}
                <div className="flex flex-col gap-[2px] text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-sky-700" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-sky-700" />
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-sky-700" />
                        <span>{people}명</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Trash2 size={14} className="text-sky-700" />
                        <span>{weight}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordCard;
