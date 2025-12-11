/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Trash2, Clock, Flag } from "lucide-react";

declare global {
    interface Window {
        kakao: any;
    }
}

// API 응답에 맞춰 타입 정의 (activeName 등 확인)
type DetailData = {
    id: number;
    username: string; // 단체명 (예: 속초 청년봉사단)
    activityName: string; // 활동명 (예: 속초 해변 정화활동)
    groups: boolean;
    memberCount: number;
    activityDescription: string;
    startDate: string;
    endDate: string;
    totalActivityTime: string; // "4시간 0분" 형태의 문자열

    startAddress: string;
    endAddress: string;

    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;

    specialNote: string;
    thumbnail: string;
    totalWeight: number;
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
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [detail, setDetail] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reason, setReason] = useState("");

    // 1. 상세 정보 가져오기 (토큰 헤더 추가됨)
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);

                // 토큰 가져오기 및 헤더 설정
                const token = localStorage.getItem("accessToken");
                const headers: HeadersInit = {
                    "Content-Type": "application/json",
                };
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const res = await fetch(`${BASE_URL}/api/activity-records/${recordId}`, {
                    method: "GET",
                    headers: headers, // 헤더 포함 전송
                });

                if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);
                const json = await res.json();

                // json.data 안에 실제 데이터가 있으므로 세팅
                setDetail(json.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [BASE_URL, recordId]);

    // 2. 지도 로드 (기존 로직 유지)
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

                // 출발 마커
                new window.kakao.maps.Marker({
                    map,
                    title: "출발 지점",
                    position: new window.kakao.maps.LatLng(
                        detail.startLatitude,
                        detail.startLongitude
                    ),
                });

                // 도착 마커
                new window.kakao.maps.Marker({
                    map,
                    title: "도착 지점",
                    position: new window.kakao.maps.LatLng(
                        detail.endLatitude,
                        detail.endLongitude
                    ),
                });

                // 경로 선 그리기
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
            const mapContainer = document.getElementById("detailMap");
            if (mapContainer) mapContainer.replaceChildren();
        };
    }, [detail]);

    // 3. 신고하기 로직 
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

    const formatMinutes = (value: string) => {
        if (value.includes("시간") || value.includes("분")) return value;

        const minutes = parseInt(value, 10);
        if (isNaN(minutes)) return value;

        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        if (h > 0 && m > 0) return `${h}시간 ${m}분`;
        if (h > 0) return `${h}시간`;
        return `${m}분`;
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
        detail.totalWeight !== undefined && !isNaN(Number(detail.totalWeight))
            ? Number(detail.totalWeight)
            : totalWeight && !isNaN(Number(totalWeight))
                ? Number(totalWeight)
                : 0;

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
                    alt={detail.activityName}
                    className="w-full h-52 object-cover rounded-t-2xl"
                />

                <div className="p-6">
                    {/* 단체명 (작게 표시) */}
                    <div className="text-sm text-sky-600 font-medium mb-1">
                        {detail.username}
                    </div>

                    {/* 활동명 (메인 제목) */}
                    <h2 className="text-xl font-bold text-[#114C79] mb-3 leading-tight">
                        {detail.activityName}
                    </h2>

                    {/* 날짜 */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <CalendarDays size={16} className="text-sky-700" />
                        <span>
                            {detail.startDate.split("T")[0]} ~ {detail.endDate.split("T")[0]}
                        </span>
                    </div>

                    {/* 주소 */}
                    <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
                        <MapPin size={16} className="text-sky-700 mt-0.5 flex-shrink-0" />
                        <span>
                            {detail.startAddress} → {detail.endAddress}
                        </span>
                    </div>

                    {/* 3단 그리드: 참여자/수거량/시간 */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#E5FCFF" }}>
                            <Users size={18} className="mx-auto mb-1" style={{ color: "#0598AB" }} />
                            <p className="text-lg font-semibold">{detail.memberCount}</p>
                            <p className="text-xs text-gray-600">참여자</p>
                        </div>

                        <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#E6FFF3" }}>
                            <Trash2 size={18} className="mx-auto mb-1" style={{ color: "#0AAF64" }} />
                            <p className="text-lg font-semibold" style={{ color: "#393939" }}>
                                {displayWeight.toLocaleString()}kg
                            </p>
                            <p className="text-xs" style={{ color: "#656565" }}>총 수거량</p>
                        </div>

                        <div className="rounded-xl py-3 text-center" style={{ backgroundColor: "#FFFAE6" }}>
                            <Clock size={18} className="mx-auto mb-1" style={{ color: "#FFA550" }} />
                            <p className="text-lg font-semibold">{formatMinutes(detail.totalActivityTime)}</p>
                            <p className="text-xs text-gray-600">소요시간</p>
                        </div>
                    </div>

                    {/* 활동 설명 */}
                    <h3 className="text-base font-semibold text-[#114C79] mb-2">활동 설명</h3>
                    <div className="bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl p-3 leading-relaxed mb-6 whitespace-pre-wrap">
                        {detail.activityDescription}
                    </div>

                    {/* 폐기물 분류 */}
                    {detail.wasteList && detail.wasteList.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-base font-semibold text-[#114C79] mb-2">수거된 폐기물</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {detail.wasteList.map((item, idx) => {
                                    const colors = ["#E5F4FF", "#E6FFF3", "#FFF8E6", "#F5E6FF", "#FFE6E6"];
                                    const bg = colors[idx % colors.length];

                                    const typeLabel: Record<string, string> = {
                                        BUOY: "부표", PLASTIC: "플라스틱", FISH_TRAP: "통발",
                                        GLASS: "유리", METAL: "금속", ETC: "기타",
                                        PAPER: "박스/종이", MEDICINE: "약품", SYRINGE: "주사기", CAN: "캔",
                                    };

                                    return (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center rounded-lg px-3 py-2 border border-black/5"
                                            style={{ backgroundColor: bg }}
                                        >
                                            <span className="text-sm font-medium text-gray-700">
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
                    {detail.specialNote && (
                        <>
                            <h3 className="text-base font-semibold text-[#114C79] mb-2">특이사항</h3>
                            <div className="bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl p-3 leading-relaxed mb-6">
                                {detail.specialNote}
                            </div>
                        </>
                    )}

                    {/* 사진 */}
                    {detail.photoUrls?.length > 0 && (
                        <>
                            <h3 className="text-base font-semibold text-[#114C79] mb-2">현장 사진</h3>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {detail.photoUrls.map((url, idx) => (
                                    <img key={idx} src={url} className="rounded-xl object-cover w-full h-32 border border-gray-100" />
                                ))}
                            </div>
                        </>
                    )}

                    {/* 지도 */}
                    <h3 className="text-base font-semibold text-[#114C79] mb-3">이동 경로</h3>
                    <div id="detailMap" className="w-full h-56 rounded-xl border border-gray-200"></div>
                </div>

                {/* 신고 버튼 영역 */}
                <div className="pb-6 flex justify-end pr-8 relative">
                    {isReportOpen && (
                        <div className="absolute bottom-full mb-4 right-6 z-50">
                            <div className="bg-white w-80 p-5 rounded-xl shadow-2xl border border-gray-100 ring-1 ring-black/5">
                                <h2 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-1">
                                    🚨 신고하기
                                </h2>
                                <textarea
                                    placeholder="신고 사유를 입력해주세요."
                                    className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => setIsReportOpen(false)}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={submitReport}
                                        className="px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 transition"
                                        disabled={!reason.trim()}
                                    >
                                        제출
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsReportOpen(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-red-500 hover:bg-red-600 text-white transition-transform active:scale-95"
                    >
                        <Flag size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordDetailPanel;