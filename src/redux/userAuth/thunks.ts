import { loginRequest, loginSuccess, loginFailure } from './action';
import { AppDispatch } from '../store';
import { userAuthAPI } from '../../api/userAPI';

export const login = (loginId: string, password: string) => {
    return async (dispatch: AppDispatch) => {
        try {
            dispatch(loginRequest());

            const response = await userAuthAPI.login(loginId, password);

            dispatch(loginSuccess(response.user, response.token));

            // Store the token in localStorage for persistence
            localStorage.setItem('token', response.token);

            return response;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || '登录失败，请检查账号密码';
            dispatch(loginFailure(errorMessage));
            throw error;
        }
    };
};

export const logout = () => {
    return (dispatch: AppDispatch) => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };
};