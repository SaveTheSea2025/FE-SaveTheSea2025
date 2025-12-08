// src/components/auth/ProtectedRoute.tsx
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    /** true: 사용자에게 접근 허용, false: 접근 거부 */
    isAllowed: boolean;
    /** 접근이 거부될 경우 리디렉션할 경로 */
    redirectTo?: string;
}

const ProtectedRoute = ({
    isAllowed,
    redirectTo = "/login"
}: ProtectedRouteProps) => {
    const { isLoading } = useAuth();

    // 1. 초기 사용자 정보 로딩 중인 경우
    // AuthProvider에서 이미 로딩 중일 때 빈 화면을 처리하고 있으므로, 
    // 여기서는 로딩이 끝난 후 권한 체크만 집중합니다.
    if (isLoading) {
        return null;
    }

    // 2. 접근 권한이 없는 경우, 지정된 경로로 리디렉션
    if (!isAllowed) {
        // replace를 사용하여 뒤로 가기 버튼으로 다시 접근 거부 페이지로 돌아오는 것을 방지
        return <Navigate to={redirectTo} replace />;
    }

    // 3. 접근 권한이 있는 경우, 중첩된 라우트의 요소(Outlet)를 렌더링
    return <Outlet />;
};

export default ProtectedRoute;