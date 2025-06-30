import  { ADMIN_LOGIN_REQUEST, ADMIN_LOGIN_SUCCESS, ADMIN_LOGIN_FAILURE, ADMIN_LOGOUT, ADMIN_CLEAR_ERROR } from './type';
import { Admin } from '../../types/admin';

export const adminLoginRequest = () => ({
  type: ADMIN_LOGIN_REQUEST
});

export const adminLoginSuccess = (admin: Admin, token: string) => ({
  type: ADMIN_LOGIN_SUCCESS,
  payload: { admin, token }
});

export const adminLoginFailure = (error: string) => ({
  type: ADMIN_LOGIN_FAILURE,
  payload: error
});

export const adminLogout = () => ({
  type: ADMIN_LOGOUT
});

export const adminClearError = () => ({
  type: ADMIN_CLEAR_ERROR
}); 