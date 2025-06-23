import React, {createContext, useState, useContext, useCallback} from 'react';

interface AuthContextType {
    showLogin : boolean;
    showRegister: boolean;
    setShowLogin: (show: boolean) => void;
    setShowRegister: (show: boolean) => void;
    onLoginSuccess: (() => void) | null; // 新增登录成功回调
    setOnLoginSuccess: (callback: () => void) => void; // 新增设置回调方法
}

const AuthContext = createContext<AuthContextType>({
    showLogin: false,
    showRegister: false,
    setShowLogin: () => {},
    setShowRegister: () => {},
    onLoginSuccess: null,
    setOnLoginSuccess: () => {}

})

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [onLoginSuccess, setOnLoginSuccess] = useState<(() => void) | null>(null);

    const wrappedSetOnLoginSuccess = useCallback((callback: () => void) => {
        setOnLoginSuccess(() => callback);
    }, []);


    return (
        <AuthContext.Provider value={{ showLogin, showRegister, setShowLogin, setShowRegister,onLoginSuccess,
            setOnLoginSuccess: wrappedSetOnLoginSuccess }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthProvider;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};