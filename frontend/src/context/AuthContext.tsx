/* eslint-disable react-refresh/only-export-components */
import React, {createContext, type ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {jwtDecode} from 'jwt-decode';
import type {AuthUser, DecodedToken} from '../types/user';
import {getCurrentUser, logoutUser, refreshAccessToken, setupInterceptors} from '../services/api.ts';

export interface AuthContextType {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    hasRole: (role: string) => boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_STORAGE_KEY = 'authToken';

const decodeToken = (token: string): DecodedToken | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return {
            ...decoded,
            roles: Array.isArray(decoded.roles) ? decoded.roles : [],
        };
    } catch {
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded) {
        return true;
    }
    return decoded.exp * 1000 <= Date.now();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const clearAuthState = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const applyAccessToken = useCallback((nextToken: string) => {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, nextToken);
        setToken(nextToken);
    }, []);

    const loadCurrentUser = useCallback(async (): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return true;
        } catch {
            return false;
        }
    }, []);

    const tryRefreshSession = useCallback(async (): Promise<boolean> => {
        try {
            const refreshed = await refreshAccessToken();
            applyAccessToken(refreshed.token);
            return await loadCurrentUser();
        } catch {
            return false;
        }
    }, [applyAccessToken, loadCurrentUser]);

    useEffect(() => {
        const teardownInterceptors = setupInterceptors({
            getAccessToken: () => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
            setAccessToken: (nextToken: string) => {
                applyAccessToken(nextToken);
            },
            onUnauthorized: () => {
                clearAuthState();
            },
        });

        return teardownInterceptors;
    }, [applyAccessToken, clearAuthState]);

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

            if (storedToken && !isTokenExpired(storedToken)) {
                applyAccessToken(storedToken);
                const loaded = await loadCurrentUser();
                if (loaded) {
                    if (mounted) {
                        setIsLoading(false);
                    }
                    return;
                }
            }

            const refreshed = await tryRefreshSession();
            if (!refreshed) {
                clearAuthState();
            }

            if (mounted) {
                setIsLoading(false);
            }
        };

        void bootstrap();

        return () => {
            mounted = false;
        };
    }, [applyAccessToken, clearAuthState, loadCurrentUser, tryRefreshSession]);

    const login = useCallback(async (newToken: string) => {
        applyAccessToken(newToken);

        const loaded = await loadCurrentUser();
        if (loaded) {
            return;
        }

        const decoded = decodeToken(newToken);
        if (!decoded) {
            clearAuthState();
            throw new Error('Failed to decode token after login');
        }

        setUser({
            id: '',
            email: decoded.sub,
            roles: decoded.roles,
        });
    }, [applyAccessToken, clearAuthState, loadCurrentUser]);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch {
            // No-op: local cleanup must happen even if backend session is already invalid.
        } finally {
            clearAuthState();
        }
    }, [clearAuthState]);

    const isAuthenticated = !!token;
    const hasRole = useCallback((role: string) => !!user?.roles?.includes(role), [user]);
    const isAdmin = hasRole('ROLE_ADMIN');

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated,
            isLoading,
            isAdmin,
            hasRole,
            login,
            logout,
        }),
        [token, user, isAuthenticated, isLoading, isAdmin, hasRole, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
