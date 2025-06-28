import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderSeatAPI } from '../../api/orderSeatAPI';
import { OrderSeatDetail } from '../../types/orderSeat';
import QRCodeComponent from '../../components/QRCode';
// @ts-ignore
import styles from './index.module.css';

const OrderDetail: React.FC = () => {
    const { orderId } = useParams();
    const [orderDetail, setOrderDetail] = useState<OrderSeatDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                if (!orderId) {
                    setError('缺少订单ID');
                    setLoading(false);
                    return;
                }

                const response = await orderSeatAPI.getOrderDetail(orderId);
                setOrderDetail(response);
            } catch (err) {
                setError('获取订单信息失败');
                console.error('Error fetching order details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

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

    if (loading) {
        return <div className={styles['loading']}>加载中...</div>;
    }

    if (error) {
        return <div className={styles['error']}>{error}</div>;
    }

    if (!orderDetail) {
        return <div className={styles['error']}>未找到订单信息</div>;
    }

    return (
        <div className={styles['order-detail']}>
            <h2>订单详情</h2>
            <div className={styles['order-info']}>
                <div className={styles['movie-info']}>
                    <h3>电影信息</h3>
                    <p>电影：{orderDetail.movieTitle}</p>
                    <p>场次：{new Date(orderDetail.startTime).toLocaleString()}</p>
                    <p>影厅：{orderDetail.hallName}</p>
                </div>
                <div className={styles['seat-info']}>
                    <h3>座位信息</h3>
                    {orderDetail.seats.map((seat, index) => (
                        <p key={index}>
                            {seat.rowLabel}排{seat.colNum}座
                        </p>
                    ))}
                </div>
                <div className={styles['price-info']}>
                    <h3>价格信息</h3>
                    <p>总价：¥{orderDetail.totalAmount}</p>
                    <p>状态：{orderDetail.status === 'PAID' ? '已支付' :
                        orderDetail.status === 'TAKEN' ? '已取票' :
                            orderDetail.status === 'UNPAID' ? '待支付' :
                                orderDetail.status === 'CANCELED' ? '已取消' :
                                    orderDetail.status === 'REFUNDED' ? '已退款' :
                                        orderDetail.status === 'PENDING' ? '待审核' : orderDetail.status}</p>
                    {orderDetail.paymentId && <p>支付单号：{orderDetail.paymentId}</p>}
                </div>
                <div className={styles['user-info']}>
                    <h3>用户信息</h3>
                    <p>用户名：{orderDetail.username || '未设置'}</p>
                    <p>手机号：{orderDetail.userPhone}</p>
                    <p>邮箱：{orderDetail.userEmail || '未设置'}</p>
                </div>
                {shouldShowQRCode(orderDetail) && (
                    <div className={styles['qr-section']}>
                        <h3>订单二维码</h3>
                        {isQRCodeActive(orderDetail) ? (
                            <div className={styles['qr-container']}>
                                <QRCodeComponent
                                    value={`${window.location.origin}/qr-verification/${orderDetail.orderId}`}
                                    size={200}
                                    showDownload={true}
                                />
                                <p className={styles['qr-order-id']}>订单号: {orderDetail.paymentId || orderDetail.orderId}</p>
                                <p className={styles['qr-hint']}>扫码可查看订单信息</p>
                            </div>
                        ) : (
                            <div className={styles['qr-container']}>
                                <QRCodeComponent
                                    value={`${window.location.origin}/qr-verification/${orderDetail.orderId}`}
                                    size={200}
                                    showDownload={true}
                                />
                                <p className={styles['qr-order-id']}>订单号: {orderDetail.paymentId || orderDetail.orderId}</p>
                                <p className={styles['qr-hint']}>
                                    {new Date(orderDetail.startTime) > new Date()
                                        ? '电影还没有开场，无法核验'
                                        : '二维码已过期，仅在电影开始前后两小时内有效'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;