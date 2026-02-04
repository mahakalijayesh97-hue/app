import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, deleteItem } from '../services/storage';
import api from '../services/api';
import { router } from 'expo-router';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
    register: (token: string, userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await getItem('auth_token');
            if (token) {
                const response = await api.get('/user');
                setUser(response.data);
            }
        } catch (error) {
            await deleteItem('auth_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string, userData: any) => {
        await setItem('auth_token', token);
        setUser(userData);
        router.replace('/(tabs)');
    };

    const register = async (token: string, userData: any) => {
        await setItem('auth_token', token);
        setUser(userData);
        router.replace('/(tabs)');
    }

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error(e);
        }
        await deleteItem('auth_token');
        setUser(null);
        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
