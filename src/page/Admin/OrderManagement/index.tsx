import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  Space,
  message,
  Input,
  Select,
  Tag
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { orderAPI } from '../../../api/orderAPI';
import { OrderSeatDetail } from '../../../types/orderSeat';
import { debounce } from '../../../utils/performance';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// 自定义滚动条样式
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    height: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderSeatDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 状态颜色映射
  const statusColorMap: Record<string, string> = {
    'UNPAID': 'orange',
    'PAID': 'green',
    'CANCELED': 'red',
    'REFUNDED': 'blue',
    'TO_BE_TAKEN': 'purple',
    'TAKEN': 'cyan',
  };

  // 状态文本映射
  const statusTextMap: Record<string, string> = {
    'UNPAID': '待支付',
    'PAID': '已支付',
    'CANCELED': '已取消',
    'REFUNDED': '已退款',
    'TO_BE_TAKEN': '待取票',
    'TAKEN': '已取票',
  };

  // 获取订单列表
  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      const response: any = await orderAPI.getOrderList({
        current: pagination.current,
        size: pagination.pageSize,
        orderId: searchOrderId,
        status: searchStatus,
        ...params,
      });

      // 直接处理Page对象（StatusHandler已经解析了JSON）
      if (response && response.records) {
        setOrders(response.records);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
        }));
      } else {
        console.error('响应数据格式异常:', response);
        setOrders([]);
      }
    } catch (error) {
      message.error('获取订单列表失败');
      console.error('获取订单列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 防抖搜索
  const debouncedSearch = debounce((value: string) => {
    setSearchOrderId(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOrders({ orderId: value, current: 1 });
  }, 500);

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: '电影名称',
      dataIndex: 'movieName',
      key: 'movieName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '影厅名称',
      dataIndex: 'hallName',
      key: 'hallName',
      width: 120,
    },
    {
      title: '放映时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '座位信息',
      dataIndex: 'seats',
      key: 'seats',
      width: 200,
      render: (seats: any[]) => (
        <div style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          height: '32px',
          display: 'flex',
          alignItems: 'center'
        }}
          className="custom-scrollbar"
        >
          <div style={{ display: 'inline-flex', gap: '4px' }}>
            {seats && seats.map((seat, index) => (
              <Tag key={index} style={{ flexShrink: 0 }}>
                {seat.rowLabel}排{seat.colNum}座
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => `¥${amount}`,
    },
    {
      title: '订单状态',
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
      title: '订单时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <style>{scrollbarStyles}</style>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>订单管理</Title>
      </div>

      {/* 搜索栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索订单ID"
          allowClear
          style={{ width: 200 }}
          onChange={(e) => debouncedSearch(e.target.value)}
          onSearch={debouncedSearch}
        />
        <Select
          placeholder="订单状态"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => {
            setSearchStatus(value);
            setPagination(prev => ({ ...prev, current: 1 }));
            fetchOrders({ status: value, current: 1 });
          }}
        >
          {Object.entries(statusTextMap).map(([value, label]) => (
            <Option key={value} value={value}>{label}</Option>
          ))}
        </Select>
      </div>

      {/* 订单表格 */}
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            fetchOrders({ current: page, size: pageSize || 10 });
          },
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default OrderManagement; 