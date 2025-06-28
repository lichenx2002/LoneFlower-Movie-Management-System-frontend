import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, message, Button, Form, Input, Space } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { userAuthAPI } from '../../api/userAPI';
import { User } from '../../types/user';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await userAuthAPI.getUserProfile(user.userId);
      setProfile(res);
    } catch (err) {
      message.error('获取个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  const handleEdit = () => {
    if (profile) {
      form.setFieldsValue({
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
      });
    }
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await userAuthAPI.updateProfileById(user!.userId, values.username, values.email, values.phone);
      message.success('修改成功');
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      // 校验失败或接口失败
      if (err && err.errorFields !== undefined) return; // antd表单校验失败
      message.error('修改失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', padding: 40 }}>未获取到个人信息</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <Card title="个人信息" bordered
        extra={!editing && <Button type="primary" onClick={handleEdit}>编辑</Button>}
      >
        {editing ? (
          <div style={{ maxWidth: 600, minWidth: 400, margin: '0 auto', padding: 24, background: '#fafbfc', borderRadius: 10 }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                username: profile.username,
                email: profile.email,
                phone: profile.phone,
              }}
            >
              <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]} style={{ marginBottom: 28 }}>
                <Input maxLength={20} />
              </Form.Item>
              <Form.Item label="邮箱" name="email" rules={[{ type: 'email', message: '请输入有效邮箱' }]} style={{ marginBottom: 28 }}>
                <Input maxLength={40} />
              </Form.Item>
              <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]} style={{ marginBottom: 32 }}>
                <Input maxLength={20} />
              </Form.Item>
              <Space>
                <Button type="primary" onClick={handleSave} loading={saving}>保存</Button>
                <Button onClick={handleCancel} disabled={saving}>取消</Button>
              </Space>
            </Form>
          </div>
        ) : (
          <Descriptions column={1}>
            <Descriptions.Item label="用户名">{profile.username || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{profile.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{profile.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{profile.regTime ? new Date(profile.regTime).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="余额">￥{profile.balance?.toFixed(2) ?? '0.00'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default Profile; 