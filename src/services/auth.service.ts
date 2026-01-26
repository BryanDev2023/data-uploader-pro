import { ChangePasswordResponse, LoginResponse, LogoutResponse } from "@/models/interfaces/auth.interface";
import api from "./api.service";
import { User } from "@/models/interfaces/user.interface";

const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post('/auth/signin', { email, password });
        return response.data;
    },
    register: async (email: string, password: string, fullName?: string): Promise<User> => {
        const payload = {
            email,
            password,
            role: 'admin',
            ...(fullName ? { fullName } : {})
        };
        const response = await api.post('/auth/signup', payload);
        return response.data;
    },
    logout: async (): Promise<LogoutResponse> => {
        const response = await api.post('/auth/signout');
        return response;
    },
    aboutMe: async (): Promise<User> => {
        const response = await api.get('/auth/about-me');
        return response.data;
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> => {
        const response = await api.post('/auth/change-password/', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
} as const;

export default authService;
