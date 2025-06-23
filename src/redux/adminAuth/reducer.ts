import {
  ADMIN_LOGIN_REQUEST,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAILURE,
  ADMIN_LOGOUT,
  ADMIN_CLEAR_ERROR
} from './type';
import { AdminLoginState } from '../../types/admin';

const initialState: AdminLoginState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const adminAuthReducer = (state: AdminLoginState = initialState, action: any): AdminLoginState => {
  switch (action.type) {
    case ADMIN_LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case ADMIN_LOGIN_SUCCESS:
      return {
        ...state,
        admin: action.payload.admin,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case ADMIN_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case ADMIN_LOGOUT:
      return initialState;
    case ADMIN_CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export default adminAuthReducer; 