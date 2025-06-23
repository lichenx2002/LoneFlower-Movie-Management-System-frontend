import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, CLEAR_ERROR } from './type';
import { User } from '../../types/user';

export const loginRequest = () => ({
    type: LOGIN_REQUEST
});

//登录成功
export const loginSuccess = (user: User, token: string) => ({
    type: LOGIN_SUCCESS,
    payload: { user, token }
});

//登录失败
export const loginFailure = (error: string) => ({ //
    type: LOGIN_FAILURE,
    payload: error
});

//登出
export const logout = () => ({
    type: LOGOUT
});

//清除错误信息
export const clearError = () => ({
    type: CLEAR_ERROR
});