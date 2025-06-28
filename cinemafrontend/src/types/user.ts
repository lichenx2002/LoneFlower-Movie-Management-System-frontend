export interface User {
    userId: number;
    username: string | null;
    email: string | null;
    phone: string;
    balance: number;
    regTime: string;
    password?: string;
}

export interface LoginState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}