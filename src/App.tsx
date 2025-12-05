import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
//import Dashboard from "./pages/Dashboard";
//import RecordsPage from "./pages/RecordsPage";
//import RankingPage from "./pages/RankingPage";
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const RecordsPage  = React.lazy(() => import('./pages/RecordsPage'));
const RankingPage = React.lazy(() => import('./pages/RankingPage'));
import StatsPage from "./pages/StatsPage";
import MyPage from "./pages/MyPage";
import WritePage from "./pages/WritePage";
import LoginPage from "./pages/LoginPage";
import SignupTypePage from "./pages/SignupTypePage";
import PersonalSignupPage from "./pages/PersonalSignupPage";
import GroupSignupPage from "./pages/GroupSignupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupTypePage />} />
        <Route path="/signup/personal" element={<PersonalSignupPage />} />
        <Route path="/signup/group" element={<GroupSignupPage />} />
      </Routes>
    </Router>
  )
}

export default App
