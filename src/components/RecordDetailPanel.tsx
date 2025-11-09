/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Trash2, Clock } from "lucide-react";

type DetailData = {
    id: number;
    name: string;
    activeName: string;
    groups: boolean;
    memberCount: number;
    activityDescription: string;
    startDate: string;
    totalWeight: number | string;
    endDate: string;
    totalActivityTime: string;
    startAddress: string;
    endAddress: string;
    latitude: number;
    longitude: number;
    specialNote: string;
    thumbnail: string;
    photoUrls: string[];
    wasteList?: {
        wasteType: string;
        wasteWeight: number;
        wasteVolume: number;
    }[];
};

type Props = {
    recordId: number;
    totalWeight?: number; // ✅ 리스트에서 전달받을 수거량
    onClose: () => void;
};

const RecordDetailPanel: React.FC<Props> = ({ recordId, totalWeight, onClose }) => {
    const BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://be-savethesea2025.onrender.com";

    const [detail, setDetail] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ✅ 상세 데이터 불러오기 */
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/api/activity-records/${recordId}`);
                if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);
                const json = await res.json();
                setDetail(json.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [BASE_URL, recordId]);

    if (loading)
        return (
            <div className="absolute top-0 right-[400px] w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mt-[88px] mr-3 text-center text-gray-500">
                🌊 로딩 중...
            </div>
        );

    if (error)
        return (
            <div className="absolute top-0 right-[400px] w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mt-[88px] mr-3 text-center text-red-500">
                ❌ {error}
            </div>
        );

    if (!detail) return null;

    // ✅ 수거량 계산 로직 (API 값 > props 값)
    const displayWeight =
        detail.totalWeight && !isNaN(Number(detail.totalWeight))
            ? Number(detail.totalWeight)
            : totalWeight && !isNaN(Number(totalWeight))
                ? Number(totalWeight)
                : null;

    return (
        <div
            className="absolute top-0 right-[400px] w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 
           overflow-y-auto z-40 transition-all duration-300"
            style={{
                marginTop: "88px",
                marginRight: "12px",
                height: "calc(100vh - 96px)",
            }}
        >
            {/* 닫기 버튼 */}
            <button
                onClick={onClose}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
            >
                ×
            </button>

            {/* 대표 이미지 */}
            <img
                src={detail.thumbnail}
                alt={detail.activeName}
                className="w-full h-52 object-cover rounded-t-2xl"
            />

            {/* 내용 */}
            <div className="p-6">
                <h2 className="text-xl font-semibold text-[#114C79] mb-1">
                    {detail.activeName}
                </h2>
                <div className="flex items-center gap-2 text-sky-800 text-sm mb-1">
                    <CalendarDays size={16} />
                    <span>
                        {detail.startDate.split("T")[0]} ~ {detail.endDate.split("T")[0]} (
                        {detail.totalActivityTime})
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sky-800 text-sm mb-4">
                    <MapPin size={16} />
                    <span>
                        {detail.startAddress} → {detail.endAddress}
                    </span>
                </div>

                {/* 참여자 / 수거량 / 소요시간 */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {/* 참여자 */}
                    <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#E5FCFF" }}>
                        <Users size={18} className="mx-auto mb-1" style={{ color: "#0598AB" }} />
                        <p className="text-lg font-semibold" style={{ color: "#393939" }}>
                            {detail.memberCount}
                        </p>
                        <p className="text-xs" style={{ color: "#656565" }}>
                            참여자
                        </p>
                    </div>

                    {/* 수거량 */}
                    <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#E6FFF3" }}>
                        <Trash2 size={18} className="mx-auto mb-1" style={{ color: "#0AAF64" }} />
                        <p className="text-lg font-semibold" style={{ color: "#393939" }}>
                            {displayWeight !== null
                                ? `${displayWeight.toLocaleString()}kg`
                                : "데이터 없음"}
                        </p>
                        <p className="text-xs" style={{ color: "#656565" }}>
                            총 수거량
                        </p>
                    </div>

                    {/* 소요시간 */}
                    <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#FFFAE6" }}>
                        <Clock size={18} className="mx-auto mb-1" style={{ color: "#FFA550" }} />
                        <p className="text-lg font-semibold" style={{ color: "#393939" }}>
                            {detail.totalActivityTime}
                        </p>
                        <p className="text-xs" style={{ color: "#656565" }}>
                            소요시간
                        </p>
                    </div>
                </div>


                {/* 활동 설명 */}
                <h3 className="text-base font-semibold text-[#114C79] mb-2">
                    활동 설명
                </h3>
                <div className="bg-gray-100 text-gray-700 text-sm rounded-xl p-3 leading-relaxed mb-6">
                    {detail.activityDescription || "설명 데이터가 없습니다."}
                </div>
                {/* 폐기물 분류 */}
                {detail.wasteList && detail.wasteList.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-[#114C79] mb-2">
                            폐기물 분류
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {detail.wasteList.map((item, idx) => {
                                const colors = ["#E5F4FF", "#E6FFF3", "#FFF8E6", "#F5E6FF", "#FFE6E6"];
                                const bg = colors[idx % colors.length];

                                // wasteType 이름 보기 좋게 변환
                                const typeLabel: Record<string, string> = {
                                    BUOY: "부표",
                                    PLASTIC: "플라스틱",
                                    FISH_TRAP: "통발",
                                    GLASS: "유리",
                                    METAL: "금속",
                                    ETC: "기타",
                                };
                                const label = typeLabel[item.wasteType] || item.wasteType;

                                return (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center rounded-full px-4 py-2 border"
                                        style={{
                                            backgroundColor: bg,
                                            borderColor: "rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <span className="text-sm font-medium text-[#114C79]">{label}</span>
                                        <span className="text-sm font-bold text-[#114C79]">
                                            {item.wasteWeight}kg
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 특이사항 */}
                <h3 className="text-base font-semibold text-[#114C79] mb-2">
                    특이사항
                </h3>
                <div className="bg-gray-100 text-gray-700 text-sm rounded-xl p-3 leading-relaxed">
                    {detail.specialNote || "특이사항 없음"}
                </div>

                {/* 추가 이미지 */}
                {detail.photoUrls?.length > 0 && (
                    <>
                        <h3 className="text-base font-semibold text-[#114C79] mb-2 mt-6">
                            현장 사진
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {detail.photoUrls.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`photo-${idx}`}
                                    className="rounded-xl object-cover w-full h-32"
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecordDetailPanel;
