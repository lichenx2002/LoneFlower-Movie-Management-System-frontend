// api/authAPI.ts
import { http } from '../utils/request';
import { User } from '../types/user';

interface LoginResponse {
    user: User;
    token: string;
}

export const userAuthAPI = {
    login: (loginId: string, password: string) =>
        http.post<LoginResponse>('/user/login', { loginId, password }),
    register: (phone: string, password: string) =>
        http.post('/user/register', { phone, password }),
    updateProfile: (username: string, email: string, phone: string) =>
        http.put('/user/update-profile', { username, email, phone }),
    getUserProfile: (userId: number) => http.get<User>(`/user/${userId}`),
    updateProfileById: (userId: number, username: string, email: string, phone: string) =>
        http.put(`/user/update/${userId}`, { username, email, phone }),
}

export const userAPI = {
    // 获取所有用户
    getAllUsers: () => http.get<User[]>("/user/all"),
    // 删除用户
    deleteUser: (userId: number) => http.delete(`/user/${userId}`),
    // 管理员更新用户信息（可改密码）
    adminUpdateUser: (userId: number, data: Partial<User> & { password?: string }) =>
        http.put(`/user/admin-update/${userId}`, data),
};