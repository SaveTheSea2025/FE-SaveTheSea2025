// src/components/auth/LoginForm.tsx

import React from 'react';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    // 폼 제출 핸들러 (더미)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("로그인 시도");
        // 실제 로그인 로직을 여기에 구현
    };

    return (
        <div className="bg-white p-10 md:p-14 shadow-lg rounded-xl max-w-lg w-full mx-auto mt-20">

            {/* 제목 */}
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-5">
                로그인
            </h2>
            <p className="text-gray-600 text-center mb-12">
                함께 바다를 지켜주셔서 감사합니다
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 이메일 아이디 입력 필드 */}
                <div>
                    <label className="text-gray-700 text-sm font-medium block mb-2">
                        이메일 아이디
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="example@ocean.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0270AD] focus:border-[#0270AD] transition duration-150"
                            required
                        />
                    </div>
                </div>

                {/* 비밀번호 입력 필드 */}
                <div>
                    <label className="text-gray-700 text-sm font-medium block mb-2">
                        비밀번호
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="비밀번호 입력"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0270AD] focus:border-[#0270AD] transition duration-150 "
                            required
                        />
                    </div>
                </div>

                {/* 로그인 버튼 */}
                <button
                    type="submit"
                    className="w-full bg-[#0369A1] text-white py-3 rounded-lg font-semibold hover:bg-[#0C4A6E] transition duration-200 shadow-md"
                >
                    로그인
                </button>
            </form>

            {/* 아이디/비밀번호 찾기 */}
            <div className="flex justify-center mt-5 text-sm text-gray-600">
                <a href="#" className="hover:text-[#0C4A6E] transition">아이디 찾기</a>
                <span className="mx-3 text-gray-400">|</span>
                <a href="#" className="hover:text-[#0C4A6E] transition">비밀번호 찾기</a>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8">
                <p className="text-center text-gray-500 text-sm mb-4">
                    아직 계정이 없으신가요?
                </p>
                {/* 회원가입 버튼 */}
                <button
                    type="button"
                    className="w-full border border-[#0C4A6E] text-[#0C4A6E] py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
                    onClick={() => navigate('/signup')}
                >
                    회원가입
                </button>
            </div>
        </div>
    );
};

export default LoginForm;