import { adminLoginRequest, adminLoginSuccess, adminLoginFailure } from './action';
import { AppDispatch } from '../store';
import { adminAuthAPI } from '../../api/adminAPI';

export const adminLogin = (loginId: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(adminLoginRequest());

      const response = await adminAuthAPI.login(loginId, password);

      dispatch(adminLoginSuccess(response.admin, response.token));

      // Store the token in localStorage for persistence
      localStorage.setItem('adminToken', response.token);

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '管理员登录失败，请检查账号密码';
      dispatch(adminLoginFailure(errorMessage));
      throw error;
    }
  };
};

export const adminLogout = () => {
  return (dispatch: AppDispatch) => {
    localStorage.removeItem('adminToken');
    dispatch({ type: 'ADMIN_LOGOUT' });
  };
}; 