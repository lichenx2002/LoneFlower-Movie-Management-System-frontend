import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { User } from '../../../types/user';
import { userAPI } from '../../../api/userAPI';
import { debounce } from '../../../utils/performance';

const { Title } = Typography;
const { Search } = Input;

const UserManagement: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 获取所有用户数据
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setAllUsers(response);
      setFilteredUsers(response);
      setPagination(prev => ({
        ...prev,
        total: response.length,
      }));
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 搜索过滤函数
  const performSearch = useCallback((value: string) => {
    const filtered = allUsers.filter(user =>
      (user.username || '').toLowerCase().includes(value.toLowerCase()) ||
      (user.phone || '').toLowerCase().includes(value.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: filtered.length
    }));
  }, [allUsers]);

  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      performSearch(value);
    }, 300),
    [performSearch]
  );

  // 前端搜索过滤
  const handleSearch = (value: string) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  // 处理分页变化（前端分页）
  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };

  // 获取当前页的数据
  const getCurrentPageData = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  // 打开编辑模态框
  const showModal = (user?: User) => {
    setEditingUser(user || null);
    setModalVisible(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userAPI.adminUpdateUser(editingUser.userId, values);
        message.success('用户信息更新成功');
      }
      handleCancel();
      fetchAllUsers();
    } catch (error) {
      message.error('更新失败');
      console.error(error);
    }
  };

  // 删除用户
  const handleDelete = async (userId: number) => {
    try {
      await userAPI.deleteUser(userId);
      message.success('删除成功');
      fetchAllUsers();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 160,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 100,
      render: (balance: number) => `¥${balance}`,
    },
    {
      title: '注册时间',
      dataIndex: 'regTime',
      key: 'regTime',
      width: 180,
      render: (regTime: string) => new Date(regTime).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: any, record: User) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除该用户吗？"
              onConfirm={() => handleDelete(record.userId)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>用户信息管理</Title>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索用户名、手机号或邮箱"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchText}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={getCurrentPageData()}
        rowKey="userId"
        loading={loading}
        pagination={{
          ...pagination,
          total: filteredUsers.length,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={500}
        okText={editingUser ? '更新' : '添加'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: false, type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="balance"
            label="余额"
            rules={[{ required: true, message: '请输入余额' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="password"
            label="新密码（如需修改）"
            rules={[]}
          >
            <Input.Password placeholder="如需修改请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 