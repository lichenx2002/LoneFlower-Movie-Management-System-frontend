import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../../redux/adminAuth/thunks';
import { RootState } from '../../redux/store';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { hashSHA256 } from '../../utils/hash';

const { Title } = Typography;

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const loading = useSelector((state: RootState) => state.adminAuth.loading);

  const onFinish = async (values: { loginId: string; password: string }) => {
    setError('');
    try {
      const hashedPassword = await hashSHA256(values.password);
      await dispatch<any>(adminLogin(values.loginId, hashedPassword));
      navigate('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message || '登录失败，请检查账号密码');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f7ff 100%)',
      }}
    >
      <div
        style={{
          width: 380,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          padding: '40px 32px 32px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          src="/logo192.png"
          alt="logo"
          style={{ width: 64, height: 64, marginBottom: 16, borderRadius: 12 }}
        />
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, color: '#2d3a4b' }}>
          孤芳电影后台登录
        </Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" style={{ width: '100%' }}>
          <Form.Item
            label="用户名"
            name="loginId"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="用户名"
              autoComplete="username"
              size="large"
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="密码"
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>
          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ borderRadius: 8 }}>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 18, textAlign: 'right', width: '100%' }}>
          {/*<Link to="/admin/register" style={{ color: '#1890ff' }}>没有账号？去注册</Link>*/}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 