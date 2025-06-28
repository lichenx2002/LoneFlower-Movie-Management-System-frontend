import React, { useState, useEffect } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Progress,
  List,
  Avatar,
  Divider
} from 'antd';
import {
  UserOutlined,
  FileOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  CommentOutlined,
  HomeOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { moviesAPI } from '../../../api/moviesAPI';
import { orderAPI } from '../../../api/orderAPI';
import { commentAPI } from '../../../api/commentAPI';
import { hallAPI } from '../../../api/hallAPI';

const { Title, Text } = Typography;

interface DashboardStats {
  totalMovies: number;
  totalOrders: number;
  totalComments: number;
  totalHalls: number;
  totalRevenue: number;
  pendingOrders: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMovies: 0,
    totalOrders: 0,
    totalComments: 0,
    totalHalls: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      // 并发获取所有数据
      const [movies, halls, orderRes, commentRes]: [any[], any[], any, any] = await Promise.all([
        moviesAPI.getAllMovies(),
        hallAPI.getAllHalls(),
        orderAPI.getOrderList({ current: 1, size: 10000 }),
        commentAPI.getCommentList({ current: 1, size: 10000 })
      ]);
      // 订单数据兼容records
      const orders = orderRes.records || [];
      const comments = commentRes.records || [];
      // 统计
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'UNPAID').length;
      // 最近订单按orderTime倒序取前3
      const sortedOrders = [...orders].sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
      setRecentOrders(sortedOrders.slice(0, 3));
      // 最近评论按LocalDateTime倒序取前3
      const sortedComments = [...comments].sort((a, b) => new Date(b.LocalDateTime).getTime() - new Date(a.LocalDateTime).getTime());
      setRecentComments(sortedComments.slice(0, 3));
      setStats({
        totalMovies: movies.length,
        totalOrders: orders.length,
        totalComments: comments.length,
        totalHalls: halls.length,
        totalRevenue,
        pendingOrders
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 状态颜色映射
  const statusColorMap: Record<string, string> = {
    'PAID': 'green',
    'UNPAID': 'orange',
    'CANCELED': 'red',
    'REFUNDED': 'blue',
    'PENDING': 'purple',
  };

  // 状态文本映射
  const statusTextMap: Record<string, string> = {
    'PAID': '已支付',
    'UNPAID': '待支付',
    'CANCELED': '已取消',
    'REFUNDED': '已退款',
    'PENDING': '待审核退票',
  };

  // 最近订单列定义
  const orderColumns = [
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '电影名称',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => `¥${amount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status] || 'default'}>
          {statusTextMap[status] || status}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      width: 150,
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>仪表板</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总电影数"
              value={stats.totalMovies}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress percent={stats.totalMovies ? Math.min(100, Math.round(stats.totalMovies * 5)) : 0} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={stats.totalOrders ? Math.min(100, Math.round(stats.totalOrders / 2)) : 0} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={stats.totalComments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={stats.totalComments ? Math.min(100, Math.round(stats.totalComments)) : 0} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总影厅数"
              value={stats.totalHalls}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <Progress percent={stats.totalHalls ? Math.min(100, Math.round(stats.totalHalls * 10)) : 0} size="small" showInfo={false} />
          </Card>
        </Col>
      </Row>

      {/* 收入和待处理订单 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="收入统计" extra={<DollarOutlined />}>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix="¥"
              valueStyle={{ color: '#3f8600', fontSize: 24 }}
            />
            {/* 这里可以扩展月收入等统计 */}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="待处理订单" extra={<CalendarOutlined />}>
            <Statistic
              title="待支付订单"
              value={stats.pendingOrders}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
            />
            {/* 这里可以扩展今日新增、即将超时等统计 */}
          </Card>
        </Col>
      </Row>

      {/* 最近数据 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近订单" extra={<ShoppingCartOutlined />}>
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              rowKey="orderId"
              pagination={false}
              size="small"
              scroll={{ x: 500 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近评论" extra={<CommentOutlined />}>
            <List
              itemLayout="horizontal"
              dataSource={recentComments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div>
                        <Text strong>{item.movieName || item.movieTitle || `电影ID:${item.movieId}`}</Text>
                        <Tag color="gold" style={{ marginLeft: 8 }}>
                          {item.rating}分
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text>{item.content}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(item.LocalDateTime || item.commentTime).toLocaleString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 