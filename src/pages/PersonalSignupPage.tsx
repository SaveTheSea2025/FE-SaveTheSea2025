// src/pages/PersonalSignupPage.tsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, MapPin, Camera, CheckCircle } from "lucide-react";
import Header from "../components/Header";

import { sendEmailCode, verifyEmailCode, signup } from "../api/auth";

const PersonalSignupPage: React.FC = () => {
  const navigate = useNavigate();

  // 이미지 업로드
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 입력값
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [region, setRegion] = useState("");

  // 이메일 인증 상태
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState("");

  // 인증번호
  const [code, setCode] = useState("");

  // 타이머
  const [timer, setTimer] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 타이머 감소
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // 사진 업로드 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // -------------------------
  // 이메일 인증 요청
  // -------------------------
  const handleSendCode = async () => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    setSending(true);
    setEmailError("");

    try {
      const res = await sendEmailCode(email);

      if (res.code === 0) {
        alert("인증번호가 이메일로 발송되었습니다.");
        setTimer(180); // 3분
      } else {
        setEmailError(res.errorMessage || "이메일 전송 실패");
      }
    } catch {
      setEmailError("이미 가입된 이메일일 수 있습니다.");
    }

    setSending(false);
  };

  // -------------------------
  // 인증번호 확인
  // -------------------------
  const handleVerify = async () => {
    if (!code) {
      setEmailError("인증번호를 입력해주세요.");
      return;
    }

    setVerifying(true);
    setEmailError("");

    try {
      const res = await verifyEmailCode(email, code);

      if (res.code === 0) {
        alert("이메일 인증 완료!");
        setEmailVerified(true);
        setTimer(0);
      } else {
        setEmailError("인증번호가 틀렸습니다.");
      }
    } catch {
      setEmailError("인증 실패, 다시 시도해주세요.");
    }

    setVerifying(false);
  };

  // -------------------------
  // 회원가입 제출
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      alert("이메일 인증을 완료해야 합니다.");
      return;
    }

    const data = {
      email,
      password,
      userName,
      region: region.toUpperCase(),
      memberType: "PERSONAL",
    };

    const res = await signup(data, profileFile ? [profileFile] : undefined);

    if (res.code === 0) {
      alert("회원가입 성공!");
      navigate("/login");
    } else {
      alert(res.message || "회원가입 실패");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#F9F9F9]">
      <Header forceScrolled={true} />

      <main className="flex-grow w-full max-w-xl mx-auto py-20 mt-16">
        <div className="bg-white p-10 md:p-14 shadow-xl rounded-xl">

          {/* 제목 */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-[#0C4A6E] mb-2">개인 회원가입</h1>
            <p className="text-gray-600 text-sm">함께 바다를 지켜주셔서 감사합니다</p>
          </div>

          {/* 프로필 이미지 */}
          <div className="flex justify-center mb-12">
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageChange} />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-gray-400 hover:border-[#0C4A6E] overflow-hidden ${
                profileImage ? "border-4 border-[#0C4A6E]" : "border-2 border-gray-300"
              }`}
            >
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">사진 등록</span>
                </>
              )}
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 이메일 */}
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-2">
                이메일 아이디*
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="example@ocean.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled={emailVerified}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 인증 요청 버튼 */}
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sending}
                  className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  {sending ? "발송 중..." : "인증번호 보내기"}
                </button>
              )}

              {/* 타이머 */}
              {timer > 0 && (
                <p className="text-blue-600 text-sm mt-1">남은 시간: {formatTime(timer)}</p>
              )}

              {emailVerified && (
                <p className="text-green-600 text-sm flex items-center gap-1 mt-2">
                  <CheckCircle size={16} /> 인증 완료
                </p>
              )}

              {/* 인증번호 입력칸 */}
              {timer > 0 && !emailVerified && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="인증번호 입력"
                    className="flex-1 pl-3 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    onChange={(e) => setCode(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying}
                    className="px-4 bg-green-600 text-white rounded-lg"
                  >
                    {verifying ? "확인..." : "확인"}
                  </button>
                </div>
              )}

              {/* 이메일 오류 */}
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-2">비밀번호*</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-2">이름*</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="실명 입력"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 지역 */}
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-2">주요 활동 지역*</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  defaultValue=""
                  onChange={(e) => setRegion(e.target.value)}
                  required
                >
                  <option value="" disabled>지역 선택</option>
                  <option value="EAST">동해</option>
                  <option value="WEST">서해</option>
                  <option value="SOUTH">남해</option>
                  <option value="JEJU">제주</option>
                </select>
              </div>
            </div>

            {/* 제출 버튼 */}
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
            <button onClick={() => navigate("/login")} className="text-gray-500 hover:text-[#0C4A6E] transition">
              로그인 하러가기
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PersonalSignupPage;
