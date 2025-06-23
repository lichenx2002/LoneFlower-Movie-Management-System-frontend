import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderSeatAPI } from '../../api/orderSeatAPI';
import { OrderSeatDetail } from '../../types/orderSeat';
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
                    <p>状态：{orderDetail.status === 'PAID' ? '已支付' : '未支付'}</p>
                    {orderDetail.paymentId && <p>支付单号：{orderDetail.paymentId}</p>}
                </div>
                <div className={styles['user-info']}>
                    <h3>用户信息</h3>
                    <p>用户名：{orderDetail.username || '未设置'}</p>
                    <p>手机号：{orderDetail.userPhone}</p>
                    <p>邮箱：{orderDetail.userEmail || '未设置'}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;