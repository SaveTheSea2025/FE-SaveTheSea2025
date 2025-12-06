// src/components/auth/LoginForm.tsx

import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';   // 🔥 우리가 만든 API 함수

const LoginForm = () => {
    const navigate = useNavigate();

    // 🔥 입력값 상태
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [memberType] = useState<"PERSONAL" | "GROUP">("PERSONAL"); // 기본값 개인회원

    // 🔥 UI 상태
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // 🔥 로그인 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await login(email, password, memberType);

            if (res.code === 0) {
                alert("로그인 성공!");

                navigate("/");
            } else {
                setErrorMsg(res.message || "로그인에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("서버 오류가 발생했습니다.");
        }

        setLoading(false);
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

                {/* 이메일 */}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* 비밀번호 */}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* 🔥 서버 오류 메시지 */}
                {errorMsg && (
                    <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                )}

                {/* 로그인 버튼 */}
                <button
                    type="submit"
                    className="w-full bg-[#0369A1] text-white py-3 rounded-lg font-semibold hover:bg-[#0C4A6E] transition duration-200 shadow-md disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? "로그인 중..." : "로그인"}
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
