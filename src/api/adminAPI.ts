import { http } from '../utils/request';
import { Admin } from '../types/admin';

interface AdminLoginResponse {
  admin: Admin;
  token: string;
}

export const adminAuthAPI = {
  login: (loginId: string, password: string) =>
    http.post<AdminLoginResponse>('/admin/login', { loginId, password }),
  register: (username: string, password: string, name?: string) =>
    http.post('/admin/register', { username, password, name }),
} 