// src/pages/GroupSignupPage.tsx
import React, { useState, useRef } from 'react'; // 💡 [추가] useState, useRef
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Users, Briefcase, MapPin, Camera } from 'lucide-react'; // 아이콘
import Header from '../components/Header';

const GroupSignupPage: React.FC = () => {
    const navigate = useNavigate();

    // 💡 [추가] 업로드된 이미지 URL을 저장하는 상태 (단체 로고)
    const [logoImage, setLogoImage] = useState<string | null>(null);

    // 💡 [추가] 파일 입력(input)을 참조하기 위한 ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("단체 회원가입 완료 시도. 로고:", logoImage);
        // 실제 가입 로직 및 서버 통신 구현 시 logoImage 데이터를 서버로 전송
    };

    // 💡 [추가] 파일 선택 이벤트 핸들러
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 파일을 읽어 임시 URL(Data URL)을 생성하여 미리보기로 사용
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 💡 [추가] 버튼 클릭 시 숨겨진 input을 클릭
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#F9F9F9]">
            <Header forceScrolled={true} />

            <main className="flex-grow w-full max-w-xl mx-auto py-20 mt-16">
                <div className="bg-white p-10 md:p-14 shadow-xl rounded-xl">

                    {/* 제목 */}
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-bold text-[#0C4A6E] mb-2">단체 회원가입</h1>
                        <p className="text-gray-600 text-sm">함께 바다를 지켜주셔서 감사합니다</p>
                    </div>

                    {/* 💡 [수정] 단체 로고/사진 등록 영역 */}
                    <div className="flex justify-center mb-12">
                        {/* 💡 [추가] 숨겨진 파일 입력 필드 */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />

                        {/* 💡 [수정] 사진 등록 버튼 */}
                        <button
                            type="button" // 폼 제출 방지
                            onClick={handleButtonClick}
                            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-gray-400 hover:border-[#0C4A6E] transition relative overflow-hidden ${logoImage ? 'border-4 border-[#0C4A6E]' : 'border-2 border-gray-300'
                                }`}
                        >
                            {logoImage ? (
                                // 💡 업로드된 이미지가 있으면 표시
                                <img
                                    src={logoImage}
                                    alt="로고 미리보기"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                // 💡 이미지가 없으면 기본 아이콘 표시
                                <>
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span className="text-xs">로고/사진 등록</span>
                                </>
                            )}
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. 단체 이메일 아이디 */}
                        <div>
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                단체 이메일 아이디*
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="group@ocean.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C4A6E] focus:border-[#0C4A6E] transition placeholder-gray-500 bg-gray-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* 2. 비밀번호 */}
                        <div>
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                비밀번호*
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="비밀번호 입력"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C4A6E] focus:border-[#0C4A6E] transition placeholder-gray-500 bg-gray-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* 3. 단체/기관명 */}
                        <div>
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                단체/기관명*
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="단체/기관 이름 입력"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C4A6E] focus:border-[#0C4A6E] transition placeholder-gray-500 bg-gray-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* 4. 대표자 이름 */}
                        <div>
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                대표자 이름*
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="대표자 실명 입력"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C4A6E] focus:border-[#0C4A6E] transition placeholder-gray-500 bg-gray-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* 5. 주요 활동 지역 */}
                        <div>
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                주요 활동 지역*
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0C4A6E] focus:border-[#0C4A6E] transition bg-gray-50 text-gray-500"
                                    defaultValue=""
                                    required
                                >
                                    <option value="" disabled>지역 선택</option>
                                    <option value="east">동해</option>
                                    <option value="west">서해</option>
                                    <option value="south">남해</option>
                                    <option value="jeju">제주</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* 가입 완료 버튼 */}
                        <button
                            type="submit"
                            className="w-full bg-[#0369A1] text-white py-3 rounded-lg font-semibold hover:bg-[#0C4A6E] transition duration-200 shadow-md mt-8"
                        >
                            가입 완료
                        </button>
                    </form>

                    {/* 하단 링크 */}
                    <div className="flex justify-center gap-4 mt-6 text-sm">
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition">
                            ← 이전으로
                        </button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-[#0C4A6E] transition">
                            로그인 하러가기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GroupSignupPage;