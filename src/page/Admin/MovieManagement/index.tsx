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
  Image,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Movies, MovieStatus, MovieStatusDescription, PageResponse, PageParams } from '../../../types/movies';
import { moviesAPI } from '../../../api/moviesAPI';
import { debounce } from '../../../utils/performance';
import { getProxiedImageUrl, getFallbackImageUrl } from '../../../utils/imageProxy';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

const MovieManagement: React.FC = () => {
  const [allMovies, setAllMovies] = useState<Movies[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movies[]>([]);
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
  const [editingMovie, setEditingMovie] = useState<Movies | null>(null);
  const [form] = Form.useForm();

  // 获取所有电影数据
  const fetchAllMovies = async () => {
    setLoading(true);
    try {
      const response = await moviesAPI.getAllMovies();
      setAllMovies(response);
      setFilteredMovies(response);
      setPagination(prev => ({
        ...prev,
        total: response.length,
      }));
    } catch (error) {
      message.error('获取电影列表失败');
      console.error('获取电影列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMovies();
  }, []);

  // 搜索过滤函数
  const performSearch = useCallback((value: string) => {
    const filtered = allMovies.filter(movie =>
      movie.title.toLowerCase().includes(value.toLowerCase()) ||
      movie.englishTitle.toLowerCase().includes(value.toLowerCase()) ||
      movie.director.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredMovies(filtered);
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: filtered.length
    }));
  }, [allMovies]);

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
    return filteredMovies.slice(startIndex, endIndex);
  };

  // 处理图片URL
  const getImageUrl = (originalUrl: string) => {
    if (!originalUrl) return getFallbackImageUrl();

    // 如果是豆瓣图片，使用代理
    if (originalUrl.includes('doubanio.com')) {
      return getProxiedImageUrl(originalUrl);
    }

    return originalUrl;
  };

  // 打开添加/编辑模态框
  const showModal = (movie?: Movies) => {
    setEditingMovie(movie || null);
    setModalVisible(true);
    if (movie) {
      form.setFieldsValue(movie);
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingMovie(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingMovie) {
        // 编辑电影
        await moviesAPI.updateMovie(editingMovie.movieId, values);
        message.success('电影信息更新成功');
      } else {
        // 添加电影
        await moviesAPI.addMovie(values);
        message.success('电影添加成功');
      }

      handleCancel();
      fetchAllMovies(); // 重新获取所有数据
    } catch (error) {
      message.error(editingMovie ? '更新失败' : '添加失败');
      console.error(error);
    }
  };

  // 删除电影
  const handleDelete = async (movieId: number) => {
    try {
      await moviesAPI.deleteMovie(movieId);
      message.success('删除成功');
      fetchAllMovies(); // 重新获取所有数据
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '海报',
      dataIndex: 'posterUrl',
      key: 'posterUrl',
      width: 80,
      render: (posterUrl: string) => (
        <Image
          width={60}
          height={80}
          src={getImageUrl(posterUrl)}
          fallback={getFallbackImageUrl()}
          style={{ objectFit: 'cover' }}
          preview={{
            mask: '点击预览',
            maskClassName: 'custom-mask'
          }}
        />
      ),
    },
    {
      title: '电影名称',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Movies) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.englishTitle}</div>
        </div>
      ),
    },
    {
      title: '导演',
      dataIndex: 'director',
      key: 'director',
    },
    {
      title: '类型',
      dataIndex: 'genres',
      key: 'genres',
      render: (genres: string) => (
        <div>
          {genres.split(',').map((genre, index) => (
            <Tag key={index} color="blue">{genre.trim()}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}分钟`,
    },
    {
      title: '评分',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (rating: number) => (
        <span style={{ color: rating >= 8 ? '#52c41a' : rating >= 6 ? '#faad14' : '#f5222d' }}>
          {rating.toFixed(1)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: MovieStatus) => {
        const color = status === MovieStatus.ON_SHELF ? 'green' :
          status === MovieStatus.COMING_SOON ? 'blue' : 'red';
        return <Tag color={color}>{MovieStatusDescription[status]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Movies) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/MovieDetail/${record.movieId}`, '_blank')}
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
              title="确定要删除这部电影吗？"
              onConfirm={() => handleDelete(record.movieId)}
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
        <Title level={2}>电影信息管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加电影
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索电影名称、英文名或导演"
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
        rowKey="movieId"
        loading={loading}
        pagination={{
          ...pagination,
          total: filteredMovies.length,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingMovie ? '编辑电影' : '添加电影'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        okText={editingMovie ? '更新' : '添加'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: MovieStatus.COMING_SOON,
            avgRating: 0,
            boxOffice: 0,
            wantToWatch: 0,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="title"
              label="电影名称"
              rules={[{ required: true, message: '请输入电影名称' }]}
            >
              <Input placeholder="请输入电影名称" />
            </Form.Item>

            <Form.Item
              name="englishTitle"
              label="英文名称"
              rules={[{ required: true, message: '请输入英文名称' }]}
            >
              <Input placeholder="请输入英文名称" />
            </Form.Item>

            <Form.Item
              name="director"
              label="导演"
              rules={[{ required: true, message: '请输入导演' }]}
            >
              <Input placeholder="请输入导演" />
            </Form.Item>

            <Form.Item
              name="genres"
              label="类型"
              rules={[{ required: true, message: '请输入电影类型' }]}
            >
              <Input placeholder="请输入类型，用逗号分隔" />
            </Form.Item>

            <Form.Item
              name="actors"
              label="演员"
              rules={[{ required: true, message: '请输入演员' }]}
            >
              <Input placeholder="请输入演员，用逗号分隔" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="时长(分钟)"
              rules={[{ required: true, message: '请输入时长' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="releaseDate"
              label="上映日期"
              rules={[{ required: true, message: '请选择上映日期' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="releaseLocation"
              label="上映地区"
              rules={[{ required: true, message: '请输入上映地区' }]}
            >
              <Input placeholder="请输入上映地区" />
            </Form.Item>

            <Form.Item
              name="posterUrl"
              label="海报URL"
              rules={[{ required: true, message: '请输入海报URL' }]}
            >
              <Input placeholder="请输入海报图片URL" />
            </Form.Item>

            <Form.Item
              name="trailerUrl"
              label="预告片URL"
            >
              <Input placeholder="请输入预告片URL" />
            </Form.Item>

            <Form.Item
              name="avgRating"
              label="评分"
              rules={[{ required: true, message: '请输入评分' }]}
            >
              <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="boxOffice"
              label="票房(万元)"
              rules={[{ required: true, message: '请输入票房' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="wantToWatch"
              label="想看人数"
              rules={[{ required: true, message: '请输入想看人数' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value={MovieStatus.ON_SHELF}>上映</Option>
                <Option value={MovieStatus.COMING_SOON}>即将上映</Option>
                <Option value={MovieStatus.OFF_SHELF}>下架</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="剧情简介"
            rules={[{ required: true, message: '请输入剧情简介' }]}
          >
            <TextArea rows={4} placeholder="请输入剧情简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MovieManagement; 