import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../api/orderAPI';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { OrderSeatDetail } from '../../types/orderSeat';
import { useAuth } from '../../context/AuthContext';
// @ts-ignore
import styles from './index.module.css';
import type { PopconfirmProps } from 'antd';
import { Button, Input, Tag, Table, Select, message, Popconfirm } from "antd";
import './order-seat-scrollbar.css'

const { Option } = Select;

const statusTextMap: Record<string, string> = {
    UNPAID: '待支付',
    PAID: '已支付',
    CANCELED: '已取消',
    REFUNDED: '已退款',
};

const statusColorMap: Record<string, string> = {
    UNPAID: 'orange',
    PAID: 'green',
    CANCELED: 'red',
    REFUNDED: 'default',
};

const Orders: React.FC = () => {
    const { setShowLogin } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderSeatDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    const [paymentIdFilter, setPaymentIdFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!user?.userId) {
                    setError('请先登录');
                    setLoading(false);
                    return;
                }

                const response = await orderAPI.getUserOrders(user.userId);
                setOrders(response);
            } catch (err) {
                setError('获取订单列表失败');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };


        fetchOrders();

    }, [user]);


    const confirm: PopconfirmProps['onConfirm'] = (e) => {
        console.log(e);
        message.success('Click on Yes');
    };

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        console.log(e);
        message.error('Click on No');
    };

    const columns = [
        { title: '订单号', dataIndex: 'paymentId', key: 'paymentId', width: 120 },
        { title: '电影名称', dataIndex: 'movieTitle', key: 'movieTitle', width: 150 },
        {
            title: '电影图片',
            dataIndex: 'moviePoster',
            key: 'moviePoster',
            width: 80,
            render: (url: string) => <img src={url} alt="poster" style={{ width: 30, height: 40, objectFit: 'cover' }} />,
        },
        { title: '影厅名称', dataIndex: 'hallName', key: 'hallName', width: 100 },
        {
            title: '座位',
            dataIndex: 'seats',
            key: 'seats',
            width: 80,
            render: (seats: any[]) => (
                <div
                    className="order-seat-scroll"
                    style={{
                        maxWidth: 120,
                        width: '100%',
                        minWidth: 0,
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {seats.map((seat, idx) => (
                        <span
                            key={seat.ssId || idx}
                            style={{
                                display: 'inline-block',
                                background: '#f3f6fa',
                                color: '#3a4664',
                                borderRadius: 12,
                                padding: '2px 10px',
                                marginRight: 8,
                                fontSize: 13,
                                boxShadow: '0 1px 2px rgba(60,80,120,0.04)',
                                border: '1px solid #e3e8f0',
                                lineHeight: 1.7,
                            }}
                        >
                            {seat.rowLabel}排{seat.colNum}座
                        </span>
                    ))}
                </div>
            ),
        },
        { title: '放映时间', dataIndex: 'startTime', key: 'startTime', width: 160, render: (t: string) => new Date(t).toLocaleString() },
        { title: '总费用', dataIndex: 'totalAmount', key: 'totalAmount', width: 80, render: (v: number) => `¥${v}` },
        { title: '电影票数量', dataIndex: 'seats', key: 'seats', width: 100, render: (seats: any[]) => seats.length },
        {
            title: '订单状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{statusTextMap[status] || status}</Tag>,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (text: string, record: OrderSeatDetail) => (
                <div>
                    {record.status === 'UNPAID' && (
                        <>
                            <Button
                                type="primary"
                                onClick={(e) => handleOrderClick(record)}
                                style={{ marginRight: 8 }}
                            >
                                去支付
                            </Button>
                            <Button
                                danger
                                onClick={(e) => handleCancelOrder(record.orderId, e)}
                            >
                                取消订单
                            </Button>
                        </>
                    )}
                    {record.status === 'PAID' && (
                        <>
                        <Popconfirm
                            title="确定要退款吗?"
                            onConfirm={ e => handleRefundOrder(record.orderId, e!)}
                            onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                danger
                            >
                                退款
                            </Button>
                        </Popconfirm>
                        </>
                    )}
                </div>
            ),
        },
    ];
    // 筛选逻辑
    const filteredOrders = orders.filter(order => {
        return (
            (!paymentIdFilter || String(order.paymentId).includes(paymentIdFilter)) &&
            (!statusFilter || order.status === statusFilter)
        );
    });

    const handleOrderClick = (order: OrderSeatDetail) => {
        if (order.status === 'UNPAID') {
            navigate(`/orders/confirm/${user?.userId}/${order.orderId}`);
        } else {
            navigate(`/orders/${order.orderId}`);
        }
    };

    const handleCancelOrder = async (orderId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await orderAPI.cancelOrder(orderId);
            const response = await orderAPI.getUserOrders(user!.userId);
            setOrders(response);
        } catch (err) {
            setError('取消订单失败');
            console.error('Error canceling order:', err);
        }
    };

    const handleRefundOrder = async (orderId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await orderAPI.refundOrder(orderId);
            const response = await orderAPI.getUserOrders(user!.userId);
            setOrders(response);
        } catch (err) {
            setError('退款订单失败');
            console.error('Error refunding order:', err);
        }
    };

    if (loading) {
        return (
            <div className={styles['orders-page']}>
                <div className={styles['loading-container']}>
                    <div className={styles['loading-spinner']}></div>
                    <div>加载订单中...</div>
                </div>
            </div>
        );
    }


    if (!user?.userId) {
        return (
            <div className={styles['orders-page']}>
                <div className={styles['error-container']}>
                    <div className={styles['error-icon']}>!</div>
                    <div>请先登录查看订单</div>
                    <Button
                        type="primary"
                        onClick={() => {
                            setShowLogin(true);
                        }}
                        style={{ marginTop: 16 }}
                    >
                        去登录
                    </Button>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className={styles['orders-page']}>
                <div className={styles['error-container']}>
                    <div className={styles['error-icon']}>!</div>
                    <div>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['orders-page']}>
            <div className={styles['orders-header']}>
                <h1>我的订单</h1>
                <div className={styles['orders-count']}>共 {orders.length} 个订单</div>
            </div>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
                <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="请输入订单号查询"
                        value={paymentIdFilter}
                        onChange={e => setPaymentIdFilter(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="订单状态"
                        allowClear
                        value={statusFilter}
                        onChange={v => setStatusFilter(v)}
                        style={{ width: 120 }}
                    >
                        <Option value="UNPAID">待支付</Option>
                        <Option value="PAID">已支付</Option>
                        <Option value="CANCELED">已取消</Option>
                        <Option value="REFUNDED">已退款</Option>
                        <Option value="TO_BE_TAKEN">待取票</Option>
                        <Option value="TAKEN">已取票</Option>
                    </Select>
                    <Button onClick={() => { setPaymentIdFilter(''); setStatusFilter(undefined); }}>重置</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="orderId"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    bordered
                />
            </div>

        </div>
    );
};

export default Orders;