/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

interface FilterModalProps {
    onClose: () => void;
    onApply: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, onApply }) => {
    // ✅ 날짜 도우미 함수 (오늘, 3개월 전)
    const getToday = () => new Date().toISOString().split("T")[0];
    const getThreeMonthsAgo = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d.toISOString().split("T")[0];
    };

    // ✅ 상태 관리
    // 1. 기간 (기본값: 오늘 ~ 3개월 전)
    const [startDate, setStartDate] = useState(getThreeMonthsAgo());
    const [endDate, setEndDate] = useState(getToday());

    // 2. 유저명 검색 (타입 + 키워드)
    const [userType, setUserType] = useState("ALL"); // ALL | PERSONAL | GROUP
    const [username, setUsername] = useState("");

    // 3. 활동명 검색 (타입 + 키워드)
    const [activityType, setActivityType] = useState("ALL"); // ALL | PERSONAL | GROUP
    const [activityName, setActivityName] = useState("");

    /* ✅ 필터 적용 */
    const handleApply = () => {
        const filters = {
            startDate,
            endDate,

            // 유저 검색 조건
            userType: userType === "ALL" ? null : userType, // 백엔드 처리에 맞게 null 또는 값 전달
            username,

            // 활동명 검색 조건
            activityType: activityType === "ALL" ? null : activityType,
            activityName,
        };
        onApply(filters);
        onClose();
    };

    /* ✅ 필터 초기화 */
    const handleReset = () => {
        setStartDate(getThreeMonthsAgo());
        setEndDate(getToday());

        setUserType("ALL");
        setUsername("");

        setActivityType("ALL");
        setActivityName("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[90vh] overflow-y-auto p-8">
                {/* 제목 */}
                <h2 className="text-center text-xl font-bold text-[#114C79] mb-8">
                    상세 필터
                </h2>

                {/* 1. 기간 설정 */}
                <div className="mb-8">
                    <p className="font-semibold text-[#114C79] mb-3 text-sm">활동 기간</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm w-full focus:outline-none focus:border-sky-500 transition"
                        />
                        <span className="text-gray-400">~</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm w-full focus:outline-none focus:border-sky-500 transition"
                        />
                    </div>
                </div>

                <hr className="border-gray-100 mb-8" />

                {/* 2. 검색 조건 */}
                <div className="space-y-6">

                    {/* 유저명 검색 */}
                    <div>
                        <p className="font-semibold text-[#114C79] mb-2 text-sm">작성자(유저명) 검색</p>
                        <div className="flex gap-2">
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm w-[100px] focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="ALL">전체</option>
                                <option value="PERSONAL">개인</option>
                                <option value="GROUP">단체</option>
                            </select>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="유저명을 입력하세요"
                                className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-sky-500 transition"
                            />
                        </div>
                    </div>

                    {/* 활동명 검색 */}
                    <div>
                        <p className="font-semibold text-[#114C79] mb-2 text-sm">활동명 검색</p>
                        <div className="flex gap-2">
                            <select
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                                className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm w-[100px] focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="ALL">전체</option>
                                <option value="PERSONAL">개인</option>
                                <option value="GROUP">단체</option>
                            </select>
                            <input
                                type="text"
                                value={activityName}
                                onChange={(e) => setActivityName(e.target.value)}
                                placeholder="활동 제목을 입력하세요"
                                className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-sky-500 transition"
                            />
                        </div>
                    </div>

                </div>

                {/* 하단 버튼 영역 */}
                <div className="flex justify-between items-center mt-10 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-500 text-sm hover:text-gray-800 transition flex items-center gap-1"
                    >
                        ↺ 초기화
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition text-sm font-medium shadow-md shadow-sky-200"
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