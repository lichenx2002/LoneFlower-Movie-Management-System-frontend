import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {orderAPI} from '../../api/orderAPI';
import {orderSeatAPI} from '../../api/orderSeatAPI';
import {OrderSeatDetail} from '../../types/orderSeat';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
// @ts-ignore
import styles from './index.module.css';

const OrderConfirm: React.FC = () => {
  const navigate = useNavigate();
  const { userId, orderId } = useParams();
  // const [orders, setOrders] = useState<OrderSeatDetail[]>([]);
  const [orderDetail, setOrderDetail] = useState<OrderSeatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        if (!userId || !orderId) {
          setError('缺少必要的订单信息');
          setLoading(false);
          return;
        }

        // 验证当前用户是否是订单所属用户
        if (user?.userId !== Number(userId)) {
          setError('无权访问此订单');
          setLoading(false);
          return;
        }

        // 获取订单详情
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
  }, [user, orderId, userId]);

  const handlePayment = async () => {
    if (!orderDetail) return;

    setLoading(true);
    try {
      await orderAPI.payOrder({ orderId: orderDetail.orderId });
      // 支付成功后跳转到订单列表页面
      navigate('/orders');
    } catch (err) {
      setError('支付失败，请重试');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // const handleCancelOrder = async (orderId: number, event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   try {
  //     await orderAPI.cancelOrder(orderId);
  //     const response = await orderAPI.getUserOrders(user!.userId);
  //     setOrders(response);
  //   } catch (err) {
  //     setError('取消订单失败');
  //     console.error('Error canceling order:', err);
  //   }
  // };

  if (loading) {
    return <div className={styles['loading']}>加载中...</div>;
  }

  if (error) {
    return <div className={styles['error']}>{error}</div>;
  }

  if (!orderDetail) {
    return <div className={styles['error']}>未找到订单信息</div>;
  }

  // @ts-ignore
  // const {orderId: orderId1} = orders;

  return (
    <div className={styles['order-confirm']}>
      <h2>订单确认</h2>
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
        </div>
      </div>
      <div className={styles['order-actions']}>
        <button
          className={styles['pay-button']}
          onClick={handlePayment}
          disabled={loading || orderDetail.status === 'PAID'}
        >
          {orderDetail.status === 'PAID' ? '已支付' : '确认支付'}
        </button>
        {/*<button*/}
        {/*    className={styles['cancel-button']}*/}
        {/*    onClick={(e) => handleCancelOrder(orderId1, e)}*/}
        {/*>*/}
        {/*  取消订单*/}
        {/*</button>*/}
      </div>
    </div>
  );
};

export default OrderConfirm; 