// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { getMyInfo, type User } from '../api/auth';

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    // loginSuccess: (userInfo: User, token: string) => void; // LoginForm에서 loadUser()를 사용하므로 간소화
    logout: () => void;
    loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    // ✅ accessToken 상태를 추가하고 localStorage에서 초기화
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [isLoading, setIsLoading] = useState(true);

    // 사용자 정보를 로딩하는 함수
    const loadUser = async () => {
        const token = localStorage.getItem('accessToken');
        setAccessToken(token); // ✅ 최신 토큰 상태 업데이트

        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const res = await getMyInfo();

            if (res.code === 0 && res.data) {
                setUser(res.data);
            } else {
                // 토큰은 있지만 정보 조회 실패 시 (만료된 토큰 등)
                localStorage.removeItem('accessToken');
                setUser(null);
                setAccessToken(null); // ✅ 상태 초기화
            }
        } catch (error) {
            console.error("Failed to load user info:", error);
            localStorage.removeItem('accessToken');
            setUser(null);
            setAccessToken(null); // ✅ 상태 초기화
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // 이 함수는 현재 로직에서는 사용되지 않지만, AuthContextType을 맞추기 위해 남겨둡니다.
    // 만약 login API가 사용자 정보를 직접 반환한다면 유용합니다.
    const loginSuccess = () => { /* no-op */ };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, isLoading, logout, loadUser, /* loginSuccess */ }}>
            {isLoading ? <div className="min-h-screen"></div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};