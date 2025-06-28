import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Cinema } from '../../../types/cinema';
import { cinemaAPI } from '../../../api/cinemaAPI';
import { debounce } from '../../../utils/performance';

const { Title } = Typography;
const { Search } = Input;

const CinemaManagement: React.FC = () => {
  const [allCinemas, setAllCinemas] = useState<Cinema[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
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
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [form] = Form.useForm();

  // 获取所有影院数据
  const fetchAllCinemas = async () => {
    setLoading(true);
    try {
      const response = await cinemaAPI.getAllCinemas();
      setAllCinemas(response);
      setFilteredCinemas(response);
      setPagination(prev => ({
        ...prev,
        total: response.length,
      }));
    } catch (error) {
      message.error('获取影院列表失败');
      console.error('获取影院列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCinemas();
  }, []);

  // 搜索过滤函数
  const performSearch = useCallback((value: string) => {
    const filtered = allCinemas.filter(cinema =>
      (cinema.name || '').toLowerCase().includes(value.toLowerCase()) ||
      (cinema.address || '').toLowerCase().includes(value.toLowerCase()) ||
      (cinema.phone || '').toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCinemas(filtered);
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: filtered.length
    }));
  }, [allCinemas]);

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
    return filteredCinemas.slice(startIndex, endIndex);
  };

  // 打开添加/编辑模态框
  const showModal = (cinema?: Cinema) => {
    setEditingCinema(cinema || null);
    setModalVisible(true);
    if (cinema) {
      form.setFieldsValue(cinema);
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCinema(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCinema) {
        await cinemaAPI.updateCinema(editingCinema.cinemaId, values);
        message.success('影院信息更新成功');
      } else {
        await cinemaAPI.createCinema(values);
        message.success('影院添加成功');
      }
      handleCancel();
      fetchAllCinemas();
    } catch (error) {
      message.error(editingCinema ? '更新失败' : '添加失败');
      console.error(error);
    }
  };

  // 删除影院
  const handleDelete = async (cinemaId: number) => {
    try {
      await cinemaAPI.deleteCinema(cinemaId);
      message.success('删除成功');
      fetchAllCinemas();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '影院ID',
      dataIndex: 'cinemaId',
      key: 'cinemaId',
      width: 80,
    },
    {
      title: '影院名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 220,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '简介',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 220,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: any, record: Cinema) => (
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
              title="确定要删除该影院吗？"
              onConfirm={() => handleDelete(record.cinemaId)}
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
        <Title level={2}>影院信息管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加影院
        </Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索影院名称、地址或电话"
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
        rowKey="cinemaId"
        loading={loading}
        pagination={{
          ...pagination,
          total: filteredCinemas.length,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
      <Modal
        title={editingCinema ? '编辑影院' : '添加影院'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={500}
        okText={editingCinema ? '更新' : '添加'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="影院名称"
            rules={[{ required: true, message: '请输入影院名称' }]}
          >
            <Input placeholder="请输入影院名称" />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: false }]}
          >
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: false }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="description"
            label="简介"
            rules={[{ required: false }]}
          >
            <Input.TextArea rows={3} placeholder="请输入简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CinemaManagement; 