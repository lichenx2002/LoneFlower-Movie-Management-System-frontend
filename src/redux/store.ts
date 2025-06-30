import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import type { ThunkDispatch } from 'redux-thunk';
import authReducer from './userAuth/reducer';
import adminAuthReducer from "./adminAuth/reducer";

const rootReducer = combineReducers({
    auth: authReducer,
    adminAuth: adminAuthReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, unknown, any>;

const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);

export default store;