/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Trash2, Clock, Flag } from "lucide-react";

declare global {
    interface Window {
        kakao: any;
    }
}

type DetailData = {
    id: number;
    name: string;
    totalWeight: number;
    activeName: string;
    groups: boolean;
    memberCount: number;
    activityDescription: string;
    startDate: string;
    endDate: string;
    totalActivityTime: string;

    startAddress: string;
    endAddress: string;

    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;

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
    totalWeight?: number;
    onClose: () => void;
};

const RecordDetailPanel: React.FC<Props> = ({ recordId, totalWeight, onClose }) => {
    const BASE_URL =
        import.meta.env.VITE_API_BASE_URL;

    const [detail, setDetail] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reason, setReason] = useState("");

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

    useEffect(() => {
        if (!detail) return;

        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById("detailMap");
                if (!container) return;

                const options = {
                    center: new window.kakao.maps.LatLng(
                        detail.startLatitude,
                        detail.startLongitude
                    ),
                    level: 5,
                };

                const map = new window.kakao.maps.Map(container, options);

                new window.kakao.maps.Marker({
                    map,
                    title: "출발 지점",
                    position: new window.kakao.maps.LatLng(
                        detail.startLatitude,
                        detail.startLongitude
                    ),
                });

                new window.kakao.maps.Marker({
                    map,
                    title: "도착 지점",
                    position: new window.kakao.maps.LatLng(
                        detail.endLatitude,
                        detail.endLongitude
                    ),
                });

                const polyline = new window.kakao.maps.Polyline({
                    map,
                    path: [
                        new window.kakao.maps.LatLng(
                            detail.startLatitude,
                            detail.startLongitude
                        ),
                        new window.kakao.maps.LatLng(
                            detail.endLatitude,
                            detail.endLongitude
                        ),
                    ],
                    strokeWeight: 4,
                    strokeColor: "#1E90FF",
                    strokeOpacity: 0.9,
                });

                polyline.setMap(map);
            });
        };

        document.body.appendChild(script);

        return () => {
            document.getElementById("detailMap")?.replaceChildren();
        };
    }, [detail]);

    const submitReport = async () => {
        if (!reason.trim()) {
            alert("신고 사유를 입력해주세요.");
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(`${BASE_URL}/api/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    recordId,
                    reason,
                }),
            });

            const json = await res.json();

            if (json.code === 0) {
                alert("신고가 접수 되었습니다.");
                setIsReportOpen(false);
                setReason("");
            } else {
                alert(json.errorMessage || "신고 실패");
            }
        } catch (err) {
            alert("서버 오류가 발생했습니다.");
        }
    };

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

    const displayWeight =
        detail.totalWeight && !isNaN(Number(detail.totalWeight))
            ? Number(detail.totalWeight)
            : totalWeight && !isNaN(Number(totalWeight))
                ? Number(totalWeight)
                : null;

    return (
        <div className="relative">
            <div
                className="absolute top-0 right-[400px] w-[380px] bg-white custom-scroll rounded-2xl shadow-xl border border-gray-200 overflow-y-auto z-40 transition-all duration-300"
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

                <div className="p-6">
                    {/* 제목 */}
                    <h2 className="text-xl font-semibold text-[#114C79] mb-1">
                        {detail.activeName}
                    </h2>

                    {/* 날짜 */}
                    <div className="flex items-center gap-2 text-sky-800 text-sm mb-1">
                        <CalendarDays size={16} />
                        <span>
                            {detail.startDate.split("T")[0]} ~ {detail.endDate.split("T")[0]} (
                            {detail.totalActivityTime})
                        </span>
                    </div>

                    {/* 주소 */}
                    <div className="flex items-center gap-2 text-sky-800 text-sm mb-4">
                        <MapPin size={16} />
                        <span>
                            {detail.startAddress} → {detail.endAddress}
                        </span>
                    </div>

                    {/* 참여자/수거량/시간 */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#E5FCFF" }}>
                            <Users size={18} className="mx-auto mb-1" style={{ color: "#0598AB" }} />
                            <p className="text-lg font-semibold">{detail.memberCount}</p>
                            <p className="text-xs text-gray-600">참여자</p>
                        </div>

                        <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#E6FFF3" }}>
                            <Trash2 size={18} className="mx-auto mb-1" style={{ color: "#0AAF64" }} />
                            <p className="text-lg font-semibold" style={{ color: "#393939" }}>
                                {displayWeight !== null ? `${displayWeight.toLocaleString()}kg` : "데이터 없음"}
                            </p>
                            <p className="text-xs" style={{ color: "#656565" }}>총 수거량</p>
                        </div>

                        <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#FFFAE6" }}>
                            <Clock size={18} className="mx-auto mb-1" style={{ color: "#FFA550" }} />
                            <p className="text-lg font-semibold">{detail.totalActivityTime}</p>
                            <p className="text-xs text-gray-600">소요시간</p>
                        </div>
                    </div>

                    {/* 활동 설명 */}
                    <h3 className="text-base font-semibold text-[#114C79] mb-2">활동 동기 및 설명</h3>
                    <div className="bg-gray-100 text-gray-700 text-sm rounded-xl p-3 leading-relaxed mb-6">
                        {detail.activityDescription}
                    </div>

                    {/* 폐기물 분류 */}
                    {detail.wasteList && detail.wasteList.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-base font-semibold text-[#114C79] mb-2">폐기물 분류</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {detail.wasteList.map((item, idx) => {
                                    const colors = ["#E5F4FF", "#E6FFF3", "#FFF8E6", "#F5E6FF", "#FFE6E6"];
                                    const bg = colors[idx % colors.length];

                                    const typeLabel: Record<string, string> = {
                                        BUOY: "부표",
                                        PLASTIC: "플라스틱",
                                        FISH_TRAP: "통발",
                                        GLASS: "유리",
                                        METAL: "금속",
                                        ETC: "기타",
                                        PAPER: "박스",
                                        MEDICINE: "약품",
                                        SYRINGE: "주사기",
                                        CAN: "캔",
                                    };

                                    return (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center rounded-full px-4 py-2 border"
                                            style={{ backgroundColor: bg, borderColor: "rgba(0,0,0,0.05)" }}
                                        >
                                            <span className="text-sm font-medium text-[#114C79]">
                                                {typeLabel[item.wasteType] || item.wasteType}
                                            </span>
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
                    <h3 className="text-base font-semibold text-[#114C79] mb-2">특이사항 및 느낀점</h3>
                    <div className="bg-gray-100 text-gray-700 text-sm rounded-xl p-3 leading-relaxed">
                        {detail.specialNote || "없음"}
                    </div>

                    {/* 사진 */}
                    {detail.photoUrls?.length > 0 && (
                        <>
                            <h3 className="text-base font-semibold text-[#114C79] mb-2 mt-6">
                                현장 사진
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {detail.photoUrls.map((url, idx) => (
                                    <img key={idx} src={url} className="rounded-xl object-cover w-full h-32" />
                                ))}
                            </div>
                        </>
                    )}

                    {/* 지도 */}
                    <h3 className="text-base font-semibold text-[#114C79] mb-3 mt-6">활동 경로 지도</h3>
                    <div id="detailMap" className="w-full h-64 rounded-xl"></div>
                </div>

                {/* 신고 버튼 + 신고 모달 컨테이너 (relative 컨테이너 유지) */}
                <div className="pb-6 flex justify-end pr-8 relative">
                    {isReportOpen && (
                        // [위치 유지] absolute bottom-full mb-4 right-6을 사용해 버튼 위에 팝업
                        <div className="absolute bottom-full mb-4 right-6 z-50">
                            {/* 모달 디자인 개선 */}
                            <div className="bg-white w-80 p-6 rounded-xl shadow-2xl border border-gray-100">
                                <h2 className="text-xl font-bold text-red-600 mb-4">🚨 신고하기</h2>

                                <textarea
                                    placeholder="신고 사유를 구체적으로 입력해주세요."
                                    // 디자인 개선: 더 큰 패딩, 둥근 모서리, 포커스 시 링 효과
                                    className="w-full h-28 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-150"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    aria-label="신고 사유 입력"
                                />

                                <div className="flex justify-end gap-3 mt-4">
                                    {/* 취소 버튼 */}
                                    <button
                                        onClick={() => setIsReportOpen(false)}
                                        // 디자인 개선: 깔끔한 회색 배경, 호버 효과
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
                                    >
                                        취소
                                    </button>

                                    {/* 제출 버튼 */}
                                    <button
                                        onClick={submitReport}
                                        // 디자인 개선: 호버 효과, 사유 미입력 시 비활성화 스타일
                                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition duration-150 hover:bg-red-700 disabled:opacity-50"
                                        style={{ backgroundColor: "#FF3B30" }}
                                        disabled={!reason.trim()} // 사유가 비어있으면 비활성화
                                    >
                                        신고 제출
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 신고 버튼 */}
                    <button
                        onClick={() => setIsReportOpen(true)}
                        // 디자인 개선: 크기 및 호버 시 그림자 변화
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        style={{ backgroundColor: "#FF3B30" }}
                        aria-label="신고하기 버튼"
                    >
                        <Flag size={20} color="white" />
                    </button>
                </div>

            </div>
        </div>
    );

};

export default RecordDetailPanel;
