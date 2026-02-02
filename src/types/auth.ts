import { User } from "./user";

export interface LoginResponse {
    user: User;
    token: string;
}

export interface LogoutResponse {
    message: string;
    data: {
        success: boolean;
    }
}

export interface ChangePasswordResponse {
    message: string;
    data: {
        updated: boolean;
    }
}
