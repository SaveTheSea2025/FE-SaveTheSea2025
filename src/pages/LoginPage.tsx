// src/pages/LoginPage.tsx

import LoginForm from "../components/auth/LoginForm";
import Header from "../components/common/Header"; // Header 컴포넌트의 경로를 가정

const LoginPage = () => {
    return (

        <div className="min-h-screen flex flex-col bg-[#F9F9F9] ">
            <Header forceScrolled={true} />

            <main className="flex-grow flex items-center justify-center pt-24 pb-24">
                <LoginForm />
            </main>


        </div>
    );
};

export default LoginPage;