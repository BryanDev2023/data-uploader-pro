export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserTheme {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
}

export interface UserPreferences {
    theme: UserTheme;
}

export interface User {
    _id?: string;
    fullName: string;
    email: string;
    role: UserRole;
    preferences: UserPreferences;
}

export interface UpdateUserResponse extends Partial<User> {}
