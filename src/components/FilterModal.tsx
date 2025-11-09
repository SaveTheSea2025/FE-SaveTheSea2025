import React from "react";

interface FilterModalProps {
    onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg relative">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
                >
                    ×
                </button>

                <h2 className="text-lg font-semibold text-center text-sky-700 mb-4">
                    필터
                </h2>

                {/* 기간 */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">기간</p>
                    <div className="flex items-center gap-2">
                        <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
                            <option>분기</option>
                            <option>월간</option>
                            <option>연간</option>
                        </select>
                        <input
                            type="date"
                            className="border rounded-md px-2 py-1 text-sm text-gray-600"
                        />
                        <span>~</span>
                        <input
                            type="date"
                            className="border rounded-md px-2 py-1 text-sm text-gray-600"
                        />
                    </div>
                </div>

                {/* 활동명 */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">활동명</p>
                    <div className="flex items-center gap-2">
                        <select className="border rounded-md px-2 py-1 text-sm text-gray-600">
                            <option>단체</option>
                            <option>개인</option>
                        </select>
                        <input
                            type="text"
                            placeholder="단체명을 입력해주세요."
                            className="flex-1 border rounded-md px-2 py-1 text-sm text-gray-600"
                        />
                    </div>
                </div>

                {/* 위치 */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">위치</p>
                    <textarea
                        className="w-full border rounded-md px-2 py-1 text-sm text-gray-600 min-h-[80px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
