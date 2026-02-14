import React, {createContext, type ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {jwtDecode} from 'jwt-decode';
import type {DecodedToken} from '../types/user';
import {setupInterceptors} from "../services/api.ts";

interface AuthContextType {
    token: string | null;
    user: DecodedToken | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    hasRole: (role: string) => boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const normalizeDecodedUser = (decoded: DecodedToken): DecodedToken => ({
        ...decoded,
        roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    });

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                const decodedUser = normalizeDecodedUser(jwtDecode<DecodedToken>(storedToken));
                if (decodedUser.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser(decodedUser);
                } else {
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                }
            }
        } catch (error) {
            console.error("Failed to initialize auth state:", error);
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (newToken: string) => {
        try {
            const decodedUser = normalizeDecodedUser(jwtDecode<DecodedToken>(newToken));
            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            setUser(decodedUser);
        } catch (error) {
            console.error("Failed to decode token on login:", error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        setupInterceptors(logout);
    }, []);

    const isAuthenticated = !!token;
    const hasRole = (role: string) => !!user?.roles?.includes(role);
    const isAdmin = hasRole('ROLE_ADMIN');

    const value = useMemo(() => ({
        token,
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        hasRole,
        login,
        logout,
    }), [token, user, isLoading, isAdmin]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
