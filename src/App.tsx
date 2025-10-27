import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import RecordsPage from "./pages/RecordsPage";
import StatsPage from "./pages/StatsPage";
import RankingPage from "./pages/RankingPage";
import MyPage from "./pages/MyPage";
import WritePage from "./pages/WritePage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/write" element={<WritePage />} />
      </Routes>
    </Router>
  )
}

export default App
