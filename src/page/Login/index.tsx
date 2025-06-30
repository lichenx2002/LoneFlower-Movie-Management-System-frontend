import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/userAuth/thunks';
import { RootState, AppDispatch } from '../../redux/store';
// @ts-ignore
import styles from './index.module.css';
import { message } from 'antd';

interface LoginProps {
    onClose: () => void;
    onToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onToRegister }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const dispatch = useDispatch<AppDispatch>();
    const authError = useSelector((state: RootState) => state.auth.error);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await dispatch(login(loginId, password));
            message.success('登录成功');
            onClose();
            // 登录成功后不需要返回任何内容
        } catch (err) {
            setError(err instanceof Error ? err.message : '登录失败');
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        // 登录ID验证（可以是手机号、邮箱或用户名）
        if (!loginId.trim()) {
            setError('请输入登录账号');
            return false;
        }

        // 密码验证
        if (password.length < 6) {
            setError('密码长度至少为6位');
            return false;
        }

        return true;
    };

    return (
        <div className={styles['auth-container']}>
            <div className={styles['auth-box']}>
                <button className={styles['auth-close-btn']} onClick={onClose}>×</button>
                <h2 className={styles['auth-title']}>用户登录</h2>
                <form onSubmit={handleLogin} className={styles['auth-form']}>
                    <div className={styles['form-group']}>
                        <input
                            type="text"
                            value={loginId}
                            onChange={e => setLoginId(e.target.value)}
                            placeholder="请输入手机号/邮箱/用户名"
                            disabled={loading}
                            className={styles['auth-input']}
                        />
                    </div>
                    <div className={styles['form-group']}>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            disabled={loading}
                            className={styles['auth-input']}
                        />
                    </div>
                    {(error || authError) && (
                        <div className={styles['auth-error']}>
                            {error || authError}
                        </div>
                    )}
                    <div className={styles['auth-footer']}>
                        <span className={styles['auth-footer-text']}>还没有账号？</span>
                        <button
                            type="button"
                            onClick={onToRegister}
                            className={styles['auth-link-btn']}
                        >
                            立即注册
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles['auth-submit-btn']}
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;