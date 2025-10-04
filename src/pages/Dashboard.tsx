import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-6">메인 대시보드</h1>

            {/* 캘린더 이동 버튼 */}
            <button
                onClick={() => navigate("/calendar")}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
                캘린더로 가기
            </button>
        </div>
    )
}

export default Dashboard
