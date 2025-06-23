import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  DatePicker,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { ScheduleEntity, SchedulePageParams, CreateScheduleRequest, UpdateScheduleRequest } from '../../../types/schedule';
import { scheduleAPI } from '../../../api/scheduleAPI';
import { moviesAPI } from '../../../api/moviesAPI';
import { hallAPI } from '../../../api/hallAPI';
import { debounce } from '../../../utils/performance';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ScheduleManagement: React.FC = () => {
  const [allSchedules, setAllSchedules] = useState<ScheduleEntity[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleEntity[]>([]);
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
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntity | null>(null);
  const [form] = Form.useForm();
  const [movies, setMovies] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);

  // 获取所有场次数据
  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const response = await scheduleAPI.getAllSchedules();
      setAllSchedules(response);
      setFilteredSchedules(response);
      setPagination(prev => ({
        ...prev,
        total: response.length,
      }));
    } catch (error) {
      message.error('获取场次列表失败');
      console.error('获取场次列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取电影列表
  const fetchMovies = async () => {
    try {
      const response = await moviesAPI.getOnShelfMovies();
      setMovies(response);
    } catch (error) {
      console.error('获取电影列表失败:', error);
    }
  };

  // 获取影厅列表
  const fetchHalls = async () => {
    try {
      const response: any = await hallAPI.getAllHalls();
      // 根据API响应结构处理数据
      if (response.data && Array.isArray(response.data)) {
        setHalls(response.data);
      } else if (Array.isArray(response)) {
        setHalls(response);
      } else {
        setHalls([]);
      }
    } catch (error) {
      console.error('获取影厅列表失败:', error);
      setHalls([]);
    }
  };

  useEffect(() => {
    fetchAllSchedules();
    fetchMovies();
    fetchHalls();
  }, []);

  // 搜索过滤函数
  const performSearch = useCallback((value: string) => {
    const filtered = allSchedules.filter(schedule => {
      const movie = movies.find(m => m.movieId === schedule.movieId);
      const hall = halls.find(h => h.hallId === schedule.hallId);

      return (
        (movie && movie.title.toLowerCase().includes(value.toLowerCase())) ||
        (hall && hall.name.toLowerCase().includes(value.toLowerCase())) ||
        schedule.scheduleId.toString().includes(value)
      );
    });
    setFilteredSchedules(filtered);
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: filtered.length
    }));
  }, [allSchedules, movies, halls]);

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
    return filteredSchedules.slice(startIndex, endIndex);
  };

  // 打开添加/编辑模态框
  const showModal = (schedule?: ScheduleEntity) => {
    setEditingSchedule(schedule || null);
    setModalVisible(true);
    if (schedule) {
      form.setFieldsValue({
        ...schedule,
        startTime: dayjs(schedule.startTime),
        endTime: dayjs(schedule.endTime),
      });
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingSchedule(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const scheduleData = {
        ...values,
        startTime: values.startTime.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
      };

      if (editingSchedule) {
        // 编辑场次
        await scheduleAPI.updateSchedule(editingSchedule.scheduleId, scheduleData);
        message.success('场次信息更新成功');
      } else {
        // 添加场次
        await scheduleAPI.addSchedule(scheduleData);
        message.success('场次添加成功');
      }

      handleCancel();
      fetchAllSchedules(); // 重新获取所有数据
    } catch (error: any) {
      if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error(editingSchedule ? '更新失败' : '添加失败');
      }
      console.error(error);
    }
  };

  // 删除场次
  const handleDelete = async (scheduleId: number) => {
    try {
      await scheduleAPI.deleteSchedule(scheduleId);
      message.success('删除成功');
      fetchAllSchedules(); // 重新获取所有数据
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    return dayjs(timeStr).format('YYYY-MM-DD HH:mm');
  };

  // 表格列定义
  const columns = [
    {
      title: '场次ID',
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      width: 80,
    },
    {
      title: '电影',
      dataIndex: 'movieId',
      key: 'movieId',
      render: (movieId: number) => {
        const movie = movies.find(m => m.movieId === movieId);
        return movie ? movie.title : `电影ID: ${movieId}`;
      },
    },
    {
      title: '影厅',
      dataIndex: 'hallId',
      key: 'hallId',
      render: (hallId: number) => {
        const hall = halls.find(h => h.hallId === hallId);
        return hall ? hall.name : `影厅ID: ${hallId}`;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (startTime: string) => formatTime(startTime),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (endTime: string) => formatTime(endTime),
    },
    {
      title: '基础价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: 'VIP价格',
      dataIndex: 'vipPrice',
      key: 'vipPrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '情侣价格',
      dataIndex: 'loverPrice',
      key: 'loverPrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ScheduleEntity) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/schedules/${record.scheduleId}/detail`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个场次吗？"
              description="删除场次将同时删除相关的座位信息"
              onConfirm={() => handleDelete(record.scheduleId)}
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
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>场次信息管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加场次
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索电影名称、影厅名称或场次ID"
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
        rowKey="scheduleId"
        loading={loading}
        pagination={{
          ...pagination,
          total: filteredSchedules.length,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingSchedule ? '编辑场次' : '添加场次'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        okText={editingSchedule ? '更新' : '添加'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            basePrice: 0,
            vipPrice: 0,
            loverPrice: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="movieId"
                label="选择电影"
                rules={[{ required: true, message: '请选择电影' }]}
              >
                <Select placeholder="请选择电影" showSearch optionFilterProp="children">
                  {movies.map(movie => (
                    <Option key={movie.movieId} value={movie.movieId}>
                      {movie.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hallId"
                label="选择影厅"
                rules={[{ required: true, message: '请选择影厅' }]}
              >
                <Select placeholder="请选择影厅" showSearch optionFilterProp="children">
                  {halls.map(hall => (
                    <Option key={hall.hallId} value={hall.hallId}>
                      {hall.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="选择开始时间"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="选择结束时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="basePrice"
                label="基础价格"
                rules={[{ required: true, message: '请输入基础价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="基础价格"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vipPrice"
                label="VIP价格"
                rules={[{ required: true, message: '请输入VIP价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="VIP价格"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="loverPrice"
                label="情侣价格"
                rules={[{ required: true, message: '请输入情侣价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="情侣价格"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleManagement; 