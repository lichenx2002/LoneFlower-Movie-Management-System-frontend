import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Select,
  Rate,
  Tag
} from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { commentAPI } from '../../../api/commentAPI';
import { Comment } from '../../../types/comment';
import { debounce } from '../../../utils/performance';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const CommentManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchMovieId, setSearchMovieId] = useState<number | undefined>(undefined);
  const [searchUserId, setSearchUserId] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取评论列表
  const fetchComments = async (params = {}) => {
    setLoading(true);
    try {
      const response: any = await commentAPI.getCommentList({
        current: pagination.current,
        size: pagination.pageSize,
        content: searchText,
        movieId: searchMovieId,
        userId: searchUserId,
        ...params,
      });

      // 直接处理Page对象（StatusHandler已经解析了JSON）
      if (response && response.records) {
        setComments(response.records);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
        }));
      } else {
        console.error('响应数据格式异常:', response);
        setComments([]);
      }
    } catch (error) {
      message.error('获取评论列表失败');
      console.error('获取评论列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 防抖搜索
  const debouncedSearch = debounce((value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchComments({ content: value, current: 1 });
  }, 500);

  // 删除评论
  const handleDelete = async (commentId: number) => {
    try {
      await commentAPI.deleteComment(commentId);
      message.success('删除成功');
      fetchComments();
    } catch (error) {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const columns = [
    {
      title: '评论ID',
      dataIndex: 'commentId',
      key: 'commentId',
      width: 80,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: '电影ID',
      dataIndex: 'movieId',
      key: 'movieId',
      width: 80,
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <div style={{ maxWidth: 300, wordBreak: 'break-all' }}>
          {content}
        </div>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (rating: number) => (
        <div>
          <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} />
          <span style={{ marginLeft: 8 }}>{rating}分</span>
        </div>
      ),
    },
    {
      title: '评论时间',
      dataIndex: 'LocalDateTime',
      key: 'LocalDateTime',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Comment) => (
        <Space size="small">
          <Popconfirm
            title="确定要删除这条评论吗？"
            onConfirm={() => handleDelete(record.commentId)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>评论管理</Title>
      </div>

      {/* 搜索栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索评论内容"
          allowClear
          style={{ width: 300 }}
          onChange={(e) => debouncedSearch(e.target.value)}
          onSearch={debouncedSearch}
        />
        <Input
          placeholder="电影ID"
          allowClear
          style={{ width: 120 }}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            setSearchMovieId(value);
            setPagination(prev => ({ ...prev, current: 1 }));
            fetchComments({ movieId: value, current: 1 });
          }}
        />
        <Input
          placeholder="用户ID"
          allowClear
          style={{ width: 120 }}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            setSearchUserId(value);
            setPagination(prev => ({ ...prev, current: 1 }));
            fetchComments({ userId: value, current: 1 });
          }}
        />
      </div>

      {/* 评论表格 */}
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="commentId"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            fetchComments({ current: page, size: pageSize || 10 });
          },
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default CommentManagement; 