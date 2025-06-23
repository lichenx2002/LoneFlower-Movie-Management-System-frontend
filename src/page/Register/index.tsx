import React, { useState } from 'react';
import { userAuthAPI } from '../../api/userAPI';
import { useNavigate } from "react-router-dom";
// @ts-ignore
import styles from './index.module.css';

interface RegisterProps {
    onClose: () => void;
    onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onClose, onRegisterSuccess }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await userAuthAPI.register(phone, password);
            onRegisterSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : '注册失败');
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        // 手机号验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setError('请输入有效的手机号');
            return false;
        }
        // 密码验证
        if (password.length < 6) {
            setError('密码长度至少为6位');
            return false;
        }
        // 确认密码
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return false;
        }

        return true;
    };

    return (
        <div className={styles['auth-container']}>
            <div className={styles['auth-box']}>
                <button className={styles['auth-close-btn']} onClick={onClose}>×</button>
                <h2 className={styles['auth-title']}>用户注册</h2>
                <form onSubmit={handleRegister} className={styles['auth-form']}>
                    <div className={styles['form-group']}>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="请输入手机号"
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
                    <div className={styles['form-group']}>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="请确认密码"
                            disabled={loading}
                            className={styles['auth-input']}
                        />
                    </div>
                    {error && <div className={styles['auth-error']}>{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles['auth-submit-btn']}
                    >
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;