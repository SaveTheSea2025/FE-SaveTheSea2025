// src/pages/SignupTypePage.tsx

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 💡 [추가] 페이지 이동을 위한 useNavigate
import Header from '../components/common/Header';

// 가정된 이미지 경로 (실제 PNG 파일을 여기에 배치해야 합니다)
const ICON_PATHS = {
    DOLPHIN: '/src/assets/auth/dolphin-icon.png', // 개인 회원 (돌고래)
    OTTER: '/src/assets/auth/otter-icon.png',     // 단체 회원 (수달)
};

interface SelectionCardProps {
    title: string;
    imagePath: string;
    onClick: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ title, imagePath, onClick }) => (
    <div
        // 💡 [수정] 크기 조정 및 relative 추가: 이미지 절대 위치의 기준점이 됩니다.
        className="relative w-full md:w-[400px] h-[280px] bg-white rounded-[30px] shadow-lg hover:shadow-xl transition duration-300 cursor-pointer flex flex-col items-start border-2 border-transparent hover:border-[#52A1C3]"
        onClick={onClick}
    >
        {/* 💡 [수정] 제목: p-10 제거 후, Card의 상단 padding을 위해 Card 자체에 패딩을 적용해야 합니다. */}
        {/* Card 전체 패딩은 div 태그에 p-6이나 p-10으로 적용하는 것이 좋습니다. */}
        <h3 className="text-[40px] px-10 pt-10 font-extrabold text-[#0C4A6E] mb-4 leading-tight">
            {title}
        </h3>

        {/* 💡 [수정] 이미지 컨테이너: 절대 위치로 변경하고 오른쪽 하단에 고정 */}
        <div
            // absolute를 설정하여 카드 영역 전체를 기준으로 위치를 잡습니다.
            // right-0과 bottom-0으로 오른쪽 아래에 고정합니다.
            // z-10을 주어 텍스트 위에 겹치도록 합니다.
            className="absolute right-0 bottom-0 w-full h-full"
        >
            {/* PNG 이미지 경로 사용 */}
            <img
                src={imagePath}
                alt={`${title} 아이콘`}
                // 💡 [수정] 이미지 자체를 컨테이너 오른쪽 아래에 배치하고 크기를 조정합니다.
                // object-contain 대신 w-full, h-full을 사용하여 컨테이너 내에서 이미지 크기를 조정할 수 있지만,
                // 여기서는 right-0, bottom-0을 사용하여 부착하고, 이미지 크기를 직접 지정하거나 조정합니다.
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
                    title="개인회원"
                    imagePath={ICON_PATHS.DOLPHIN}
                    onClick={() => handleTypeSelect('personal')}
                />
                <SelectionCard
                    title="단체회원"
                    imagePath={ICON_PATHS.OTTER}
                    onClick={() => handleTypeSelect('group')}
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