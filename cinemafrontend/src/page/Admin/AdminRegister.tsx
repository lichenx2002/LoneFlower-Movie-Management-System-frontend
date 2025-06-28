import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAuthAPI } from '../../api/adminAPI';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { hashSHA256 } from '../../utils/hash';

const { Title } = Typography;

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string; name?: string }) => {
    setError('');
    setLoading(true);
    try {
      const hashedPassword = await hashSHA256(values.password);
      await adminAuthAPI.register(values.username, hashedPassword, values.name);
      navigate('/admin/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
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
          管理员注册
        </Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" style={{ width: '100%' }}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" autoComplete="username" size="large" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" autoComplete="new-password" size="large" />
          </Form.Item>
          <Form.Item
            label="真实姓名（可选）"
            name="name"
          >
            <Input placeholder="真实姓名" size="large" />
          </Form.Item>
          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ borderRadius: 8 }}>
              注册
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 18, textAlign: 'right', width: '100%' }}>
          <Link to="/admin/login" style={{ color: '#1890ff' }}>已有账号？去登录</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister; 