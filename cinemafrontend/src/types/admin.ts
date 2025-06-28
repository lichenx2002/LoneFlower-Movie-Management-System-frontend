export interface Admin {
  adminId: number;
  username: string | null;
  name: string | null;
  lastLogin: string | null;
}

export interface AdminLoginState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
} 