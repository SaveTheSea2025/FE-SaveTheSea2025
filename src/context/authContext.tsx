// authContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    accessToken: string | null;
    setUser: (user: any) => void;
    setAccessToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));

    useEffect(() => {
        if (accessToken) {
            // accessToken이 있으면 사용자 정보 가져오기
            getMyInfo();
        }
    }, [accessToken]);

    const getMyInfo = async () => {
        // API 호출 예시
        const response = await axios.get('/api/auth/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (response.data) {
            setUser(response.data); // 사용자 정보 업데이트
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, setUser, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};
