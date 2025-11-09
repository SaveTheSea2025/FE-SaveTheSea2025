/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface FilterModalProps {
    onClose: () => void;
    onApply: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, onApply }) => {
    const [periodType, setPeriodType] = useState("분기");
    const [selectedQuarter, setSelectedQuarter] = useState("1분기");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [groupType, setGroupType] = useState("단체");
    const [groupName, setGroupName] = useState("");

    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [beach, setBeach] = useState("");

    const [beachData, setBeachData] = useState<any[]>([]);
    const SERVICE_KEY = import.meta.env.VITE_MOF_KEY;

    /* ✅ 해양수산부 해수욕장 API 불러오기 */
    useEffect(() => {
        const fetchBeaches = async () => {
            try {
                const url = `https://api.odcloud.kr/api/15056087/v1/uddi:3bcca607-8b03-4760-b1df-abc5d4ef2a36?page=1&perPage=2000&serviceKey=${SERVICE_KEY}`;
                const res = await fetch(url);
                const json = await res.json();

                if (!json.data) throw new Error("데이터 없음 또는 인증 오류");
                setBeachData(json.data);
                console.log("✅ 해수욕장 데이터:", json.data.slice(0, 5));
            } catch (err) {
                console.error("🌊 해수욕장 API 로드 실패:", err);
            }
        };
        fetchBeaches();
    }, [SERVICE_KEY]);

    /* ✅ 필터링 로직: 시도 → 시군구 → 해변 */
    const provinces = Array.from(
        new Set(beachData.map((b) => b["지자체"]))
    ).filter(Boolean);

    const cities = province
        ? Array.from(
            new Set(
                beachData
                    .filter((b) => b["지자체"] === province)
                    .map((b) => b["관리청"])
            )
        ).filter(Boolean)
        : [];

    const beaches = city
        ? beachData.filter(
            (b) => b["지자체"] === province && b["관리청"] === city
        )
        : province
            ? beachData.filter((b) => b["지자체"] === province)
            : [];

    /* ✅ 필터 적용 */
    const handleApply = () => {
        const filters = {
            periodType,
            selectedQuarter,
            startDate,
            endDate,
            groupType,
            groupName,
            province,
            city,
            beach,
        };
        onApply(filters);
        onClose();
    };

    /* ✅ 필터 초기화 */
    const handleReset = () => {
        setPeriodType("분기");
        setSelectedQuarter("1분기");
        setStartDate("");
        setEndDate("");
        setGroupType("단체");
        setGroupName("");
        setProvince("");
        setCity("");
        setBeach("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[90vh] overflow-y-auto p-8">
                {/* 제목 */}
                <h2 className="text-center text-xl font-semibold text-[#114C79] mb-6">
                    필터
                </h2>

                {/* ✅ 기간 */}
                <div className="mb-6">
                    <p className="font-semibold text-[#114C79] mb-2 text-sm">기간</p>
                    <div className="flex items-center gap-3">
                        <select
                            value={periodType}
                            onChange={(e) => setPeriodType(e.target.value)}
                            className="bg-gray-100 px-3 py-2 rounded-lg text-sm w-[120px] focus:outline-none"
                        >
                            <option value="분기">분기</option>
                            <option value="직접입력">직접입력</option>
                        </select>

                        <span className="text-gray-400">|</span>

                        {periodType === "분기" ? (
                            <select
                                value={selectedQuarter}
                                onChange={(e) => setSelectedQuarter(e.target.value)}
                                className="bg-gray-100 px-3 py-2 rounded-lg text-sm w-[160px]"
                            >
                                <option>1분기</option>
                                <option>2분기</option>
                                <option>3분기</option>
                                <option>4분기</option>
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-gray-100 px-3 py-2 rounded-lg text-sm w-[140px]"
                                />
                                <span className="text-gray-500">~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-gray-100 px-3 py-2 rounded-lg text-sm w-[140px]"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <hr className="my-4" />

                {/* ✅ 활동명 */}
                <div className="mb-6">
                    <p className="font-semibold text-[#114C79] mb-2 text-sm">활동명</p>
                    <div className="flex gap-2 items-center">
                        <select
                            value={groupType}
                            onChange={(e) => setGroupType(e.target.value)}
                            className="bg-gray-100 px-3 py-2 rounded-lg text-sm"
                        >
                            <option>단체</option>
                            <option>개인</option>
                        </select>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="단체명을 입력해주세요"
                            className="bg-gray-100 px-3 py-2 rounded-lg text-sm flex-1"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                        * 띄어쓰기 없이 입력해주세요.
                    </p>
                </div>

                <hr className="my-4" />

                {/* ✅ 위치 */}
                <div>
                    <p className="font-semibold text-[#114C79] mb-2 text-sm">위치</p>
                    <div className="flex flex-col gap-2">
                        <select
                            value={province}
                            onChange={(e) => {
                                setProvince(e.target.value);
                                setCity("");
                                setBeach("");
                            }}
                            className="bg-gray-100 px-3 py-2 rounded-lg text-sm"
                        >
                            <option value="">시/도 선택</option>
                            {provinces.map((p) => (
                                <option key={p}>{p}</option>
                            ))}
                        </select>

                        {province && (
                            <select
                                value={city}
                                onChange={(e) => {
                                    setCity(e.target.value);
                                    setBeach("");
                                }}
                                className="bg-gray-100 px-3 py-2 rounded-lg text-sm"
                            >
                                <option value="">시/군/구 선택</option>
                                {cities.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        )}

                        {(province || city) && (
                            <select
                                value={beach}
                                onChange={(e) => setBeach(e.target.value)}
                                className="bg-gray-100 px-3 py-2 rounded-lg text-sm"
                            >
                                <option value="">해수욕장 선택</option>
                                {beaches.map((b, idx) => (
                                    <option key={idx}>
                                        {b["해수욕장명"] || b["해수욕장"] || `(${b["관리청"]})`}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* ✅ 버튼 영역 */}
                <div className="flex justify-between items-center mt-8">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
                    >
                        필터 초기화
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                        >
                            적용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
