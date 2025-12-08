// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense } from 'react'; // 
import { useAuth } from './context/AuthContext'; // 
import ProtectedRoute from './components/auth/ProtectedRoute'; //

// Lazy Loading Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const RecordsPage = React.lazy(() => import('./pages/RecordsPage'));
const RankingPage = React.lazy(() => import('./pages/RankingPage'));
import StatsPage from "./pages/StatsPage";
import MyPage from "./pages/MyPage";
import WritePage from "./pages/WritePage";
import LoginPage from "./pages/LoginPage";
import SignupTypePage from "./pages/SignupTypePage";
import PersonalSignupPage from "./pages/PersonalSignupPage";
import GroupSignupPage from "./pages/GroupSignupPage";
import { AuthProvider } from './context/AuthContext';


const AppRoutes = () => {
  const { user } = useAuth(); // ✅ user 상태를 가져옵니다.

  return (
    // ✅ Lazy Loading 컴포넌트를 위해 Suspense로 감싸줍니다.
    <Suspense fallback={<div className="text-center p-20">로딩 중...</div>}>
      <Routes>

        {/* 1. 공개 경로 (Public Routes): 누구나 접근 가능 */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/ranking" element={<RankingPage />} />

        {/* 2. 로그인 필요 경로 (Private Routes) */}
        {/* user가 존재할 때 (로그인 상태)만 접근 허용. 아니면 /login으로 리디렉션 */}
        <Route element={<ProtectedRoute isAllowed={!!user} redirectTo="/login" />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/write" element={<WritePage />} />
        </Route>

        {/* 3. 로그아웃 필요 경로 (Restricted Routes) */}
        {/* user가 없을 때 (로그아웃 상태)만 접근 허용. 아니면 /로 리디렉션 */}
        <Route element={<ProtectedRoute isAllowed={!user} redirectTo="/" />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupTypePage />} />
          <Route path="/signup/personal" element={<PersonalSignupPage />} />
          <Route path="/signup/group" element={<GroupSignupPage />} />
        </Route>

        {/* 4. Not Found 처리 (옵션) */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Suspense>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes /> {/* ✅ 라우팅을 별도 컴포넌트로 분리하여 useAuth 사용 */}
      </Router>
    </AuthProvider>
  )
}

export default App;