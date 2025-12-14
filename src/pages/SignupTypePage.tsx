// src/pages/SignupTypePage.tsx

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 💡 [추가] 페이지 이동을 위한 useNavigate
import Header from '../components/common/Header';

import dolphinIcon from "@/assets/auth/dolphin-icon.webp";
import otterIcon from "@/assets/auth/otter-icon.webp";

const ICON_PATHS = {
    DOLPHIN: dolphinIcon,
    OTTER: otterIcon,
};

interface SelectionCardProps {
    title: string;
    imagePath: string;
    onClick: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ title, imagePath, onClick }) => (
    <div
        className="relative w-full md:w-[400px] h-[280px] bg-white rounded-[30px] shadow-lg hover:shadow-xl transition duration-300 cursor-pointer flex flex-col items-start border-2 border-transparent hover:border-[#52A1C3]"
        onClick={onClick}
    >
        <h3 className="text-[40px] px-10 pt-10 font-extrabold text-[#0C4A6E] mb-4 leading-tight">
            {title}
        </h3>
        <div
            className="absolute right-0 bottom-0 w-full h-full"
        >
            <img
                src={imagePath}
                alt={`${title} 아이콘`}
                className="absolute right-0 bottom-0 max-w-[70%] max-h-[70%] object-contain"
            />
        </div>
    </div>
);


const SignupTypePage: React.FC = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/login');
    };

    const handleTypeSelect = (type: 'personal' | 'group') => {
        navigate(`/signup/${type}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center pb-16 bg-gray-50">

            <Header forceScrolled={true} />

            <div className="text-center mb-16 mt-40">
                <h1 className="text-3xl font-bold text-[#0C4A6E] mb-3">회원가입</h1>
                <p className="text-gray-600">가입하시려는 계정의 유형을 선택해주세요.</p>
            </div>

            {/* 유형 선택 카드 컨테이너 */}
            <div className="flex flex-col md:flex-row gap-8 max-w-3xl mx-auto">
                <SelectionCard
                    title="단체회원"
                    imagePath={ICON_PATHS.OTTER}
                    onClick={() => handleTypeSelect('group')}
                />
                <SelectionCard
                    title="개인회원"
                    imagePath={ICON_PATHS.DOLPHIN}
                    onClick={() => handleTypeSelect('personal')}
                />
            </div>

            {/* 로그인 화면으로 돌아가기 */}
            <button
                onClick={handleBackClick}
                className="mt-20 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition duration-200"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>로그인 화면으로 돌아가기</span>
            </button>
        </div>
    );
};

export default SignupTypePage;