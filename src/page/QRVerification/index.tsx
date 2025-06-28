import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Spin, Result } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { orderAPI } from '../../api/orderAPI';
// @ts-ignore
import styles from './index.module.css';

const QRVerification: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const takeTicket = async () => {
      if (!orderId) {
        setError('无效的订单号');
        setLoading(false);
        return;
      }

      try {
        const orderIdNum = parseInt(orderId);
        if (isNaN(orderIdNum)) {
          setError('订单号格式错误');
          setLoading(false);
          return;
        }

        await orderAPI.takeTicket(orderIdNum);
        setSuccess(true);
        message.success('取票成功！');
      } catch (err: any) {
        setError(err.message || '取票失败');
        message.error('取票失败：' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    };

    takeTicket();
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <div className={styles.loading}>
            <Spin size="large" />
            <p>正在处理取票请求...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="取票成功"
            subTitle="订单状态已更新为已取票"
            extra={[
              <Button type="primary" key="home" onClick={() => navigate('/')}>
                返回首页
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Result
          status="error"
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          title="取票失败"
          subTitle={error || '未知错误'}
          extra={[
            <Button key="back" onClick={() => navigate('/')}>
              返回首页
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default QRVerification; 