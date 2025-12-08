// src/components/auth/LoginForm.tsx

import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
    const navigate = useNavigate();
    const { loadUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // memberType 탭 상태
    const [memberType, setMemberType] = useState<"PERSONAL" | "GROUP">("GROUP");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // -------------------------
    // 로그인 핸들러
    // -------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await login(email, password, memberType);

            if (res.code === 0) {
                alert("로그인 성공!");

                // 로그인 후 사용자 정보 로드
                await loadUser();

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
            <p className="text-gray-600 text-center mb-10">
                함께 바다를 지켜주셔서 감사합니다
            </p>

            {/* MemberType Tab 선택 영역 (스타일 개선됨) */}
            <div className="flex items-center justify-center mb-8 w-full max-w-xs mx-auto">
                <button
                    type="button"
                    className={`
                        flex-1 py-2 text-sm font-semibold transition duration-200 
                        rounded-l-xl border border-r-0 
                        ${memberType === "GROUP"
                            ? "bg-[#0369A1] text-white border-[#0369A1]" // 선택됨: 진한 파란색
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" // 비선택: 흰색
                        }
                    `}
                    // 💡 클릭 시 "GROUP"으로 설정
                    onClick={() => setMemberType("GROUP")}
                >
                    단체 회원
                </button>

                <button
                    type="button"
                    className={`
                        flex-1 py-2 text-sm font-semibold transition duration-200 
                        rounded-r-xl border 
                        ${memberType === "PERSONAL"
                            ? "bg-[#0369A1] text-white border-[#0369A1]" // 선택됨: 진한 파란색
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" // 비선택: 흰색
                        }`}
                    // 💡 클릭 시 "PERSONAL"로 설정
                    onClick={() => setMemberType("PERSONAL")}
                >
                    개인 회원
                </button>
            </div>

            {/* ----------------------------- */}
            {/* 로그인 FORM */}
            {/* ----------------------------- */}
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
                            className=" w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 transition duration-150 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#0270AD] "
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
                            className=" w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder:opacity-50 transition duration-150 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#0270AD] "
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* 서버 오류 메시지 */}
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

            {/* 하단 링크 */}
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
                    className="w-full border border-[#0C4A6E] text-[#0C4A6E] py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                    onClick={() => navigate('/signup')}
                >
                    회원가입
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
