import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../api/orderAPI';
import { orderSeatAPI } from '../../api/orderSeatAPI';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { OrderSeatDetail } from '../../types/orderSeat';
import { useAuth } from '../../context/AuthContext';
import QRCodeComponent from '../../components/QRCode';
// @ts-ignore
import styles from './index.module.css';
import type { PopconfirmProps } from 'antd';
import { Button, Input, Tag, Table, Select, message, Popconfirm, Modal } from "antd";
import './order-seat-scrollbar.css'

const { Option } = Select;

const statusMap: { [key: string]: string } = {
    UNPAID: '待支付',
    PAID: '已支付',
    CANCELED: '已取消',
    REFUNDED: '已退款',
    PENDING: '待审核',
    TAKEN: '已取票',
};

const statusColorMap: { [key: string]: string } = {
    UNPAID: 'orange',
    PAID: 'green',
    CANCELED: 'red',
    REFUNDED: 'pink',
    PENDING: 'blue',
    TAKEN: 'purple',
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

    // 模态框状态
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderSeatDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // 检查电影是否已经开始
    const isMovieStarted = (startTime: string): boolean => {
        const start = new Date(startTime);
        const now = new Date();
        console.log('startTime:', startTime);
        console.log('解析后的开始时间:', start);
        console.log('当前时间:', now);
        console.log('比较结果:', now >= start);
        return now >= start;
    };

    // 检查是否应该显示查看详情按钮
    const shouldShowDetailButton = (record: OrderSeatDetail): boolean => {
        return record.status === 'PAID' || record.status === 'TAKEN';
    };

    // 检查是否应该显示二维码
    const shouldShowQRCode = (order: OrderSeatDetail): boolean => {
        // 所有已支付订单都显示二维码
        return order.status === 'PAID';
    };

    // 检查二维码是否有效（可以扫码获取信息）
    const isQRCodeActive = (order: OrderSeatDetail): boolean => {
        // 订单状态必须是已支付
        if (order.status !== 'PAID') {
            return false;
        }

        // 检查电影开始时间
        const startTime = new Date(order.startTime);
        const now = new Date();
        const oneHourBeforeStart = new Date(startTime.getTime() - 60 * 60 * 1000); // 开始时间前一小时

        // 只有在电影开始前一小时到开始后一小时内才激活二维码
        const oneHourAfterStart = new Date(startTime.getTime() + 60 * 60 * 1000);
        return now >= oneHourBeforeStart && now <= oneHourAfterStart;
    };

    // 显示订单详情模态框
    const showOrderDetail = async (order: OrderSeatDetail) => {
        setDetailLoading(true);
        try {
            const orderDetail = await orderSeatAPI.getOrderDetail(order.orderId.toString());
            setSelectedOrder(orderDetail);
            setDetailModalVisible(true);
        } catch (err) {
            message.error('获取订单详情失败');
            console.error('Error fetching order detail:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!user?.userId) {
                    setError(null); // 清除之前的错误
                    setLoading(false);
                    return;
                }

                setLoading(true);
                setError(null); // 清除之前的错误
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
    }, [user?.userId]); // 只监听userId的变化


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
            render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{statusMap[status] || status}</Tag>,
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (text: string, record: OrderSeatDetail) => (
                <div>
                    {record.status === 'UNPAID' && (
                        <>
                            <Button
                                type="link"
                                onClick={(e) => handleOrderClick(record)}
                                style={{ marginRight: 8 }}
                            >
                                去支付
                            </Button>
                            <Popconfirm
                                title="确定要取消订单吗?"
                                description="取消后将无法恢复"
                                onConfirm={(e) => handleCancelOrder(record.orderId, e as any)}
                                onCancel={cancel}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button type="link" danger>
                                    取消订单
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                    {shouldShowDetailButton(record) && (
                        <Button
                            type="link"
                            onClick={(e) => showOrderDetail(record)}
                            style={{ marginRight: 8 }}
                        >
                            查看详情
                        </Button>
                    )}
                    {shouldShowRefundButton(record) && (
                        <Popconfirm
                            title="确定要退款吗?"
                            description="退款后将无法恢复"
                            onConfirm={(e) => handleRefundOrder(record.orderId, e as any)}
                            onCancel={cancel}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button type="link" danger>
                                申请退款
                            </Button>
                        </Popconfirm>
                    )}
                    {record.status === 'PAID' && isMovieStarted(record.startTime) && (
                        <span style={{ color: '#999', fontSize: '12px' }}>
                            电影已开始，无法退票
                        </span>
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
            await orderAPI.applyRefund(orderId);
            message.success('退票申请已提交，请等待审核');
            const response = await orderAPI.getUserOrders(user!.userId);
            setOrders(response);
        } catch (err) {
            setError('申请退票失败');
            console.error('Error applying refund:', err);
        }
    };

    const shouldShowRefundButton = (record: OrderSeatDetail): boolean => {
        return record.status === 'PAID' && !isMovieStarted(record.startTime);
    };

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
                        <Option value="PENDING">待审核</Option>
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

            {/* 订单详情模态框 */}
            <Modal
                title="订单详情"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
                confirmLoading={detailLoading}
            >
                {selectedOrder && (
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #dee2e6' }}>电影信息</h3>
                                <p style={{ margin: '8px 0', color: '#666' }}>电影：{selectedOrder.movieTitle}</p>
                                <p style={{ margin: '8px 0', color: '#666' }}>场次：{new Date(selectedOrder.startTime).toLocaleString()}</p>
                                <p style={{ margin: '8px 0', color: '#666' }}>影厅：{selectedOrder.hallName}</p>
                            </div>

                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #dee2e6' }}>座位信息</h3>
                                {selectedOrder.seats.map((seat, index) => (
                                    <p key={index} style={{ margin: '8px 0', color: '#666' }}>
                                        {seat.rowLabel}排{seat.colNum}座
                                    </p>
                                ))}
                            </div>

                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #dee2e6' }}>价格信息</h3>
                                <p style={{ margin: '8px 0', color: '#666' }}>总价：¥{selectedOrder.totalAmount}</p>
                                <p style={{ margin: '8px 0', color: '#666' }}>状态：{selectedOrder.status === 'PAID' ? '已支付' : '未支付'}</p>
                                {selectedOrder.paymentId && <p style={{ margin: '8px 0', color: '#666' }}>支付单号：{selectedOrder.paymentId}</p>}
                            </div>

                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #dee2e6' }}>用户信息</h3>
                                <p style={{ margin: '8px 0', color: '#666' }}>用户名：{selectedOrder.username || '未设置'}</p>
                                <p style={{ margin: '8px 0', color: '#666' }}>手机号：{selectedOrder.userPhone}</p>
                                <p style={{ margin: '8px 0', color: '#666' }}>邮箱：{selectedOrder.userEmail || '未设置'}</p>
                            </div>

                            {shouldShowQRCode(selectedOrder) && (
                                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', gridColumn: 'span 2' }}>
                                    <h3 style={{ color: '#333', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #dee2e6' }}>订单二维码</h3>
                                    {isQRCodeActive(selectedOrder) ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e3e8f0' }}>
                                            <QRCodeComponent
                                                value={`${window.location.origin}/qr-verification/${selectedOrder.orderId}`}
                                                size={200}
                                                showDownload={true}
                                            />
                                            <p style={{ margin: '16px 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>订单号: {selectedOrder.paymentId || selectedOrder.orderId}</p>
                                            <p style={{ margin: '0', fontSize: '14px', color: '#666', textAlign: 'center' }}>扫码可查看订单信息</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e3e8f0' }}>
                                            <QRCodeComponent
                                                value={`${window.location.origin}/qr-verification/${selectedOrder.orderId}`}
                                                size={200}
                                                showDownload={true}
                                            />
                                            <p style={{ margin: '16px 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>订单号: {selectedOrder.paymentId || selectedOrder.orderId}</p>
                                            <p style={{ margin: '0', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                                                {new Date(selectedOrder.startTime) > new Date()
                                                    ? '电影还没有开场，无法核验'
                                                    : '二维码已过期，仅在电影开始前后两小时内有效'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default Orders;