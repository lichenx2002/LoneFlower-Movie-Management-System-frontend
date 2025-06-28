import { http } from '../utils/request';
import { OrderDetail, CreateOrderRequest, PayOrderRequest, } from '../types/order';
import { OrderSeatDetail } from '../types/orderSeat';

export interface Order {
  orderId: number;
  movieTitle: string;
  hallName: string;
  startTime: string;
  totalAmount: number;
  status: 'UNPAID' | 'PAID' | 'CANCELED' | 'REFUNDED';
  orderTime: string;
}

export const orderAPI = {
  // 创建订单
  createOrder: async (data: CreateOrderRequest): Promise<OrderDetail> => {
    return http.post<OrderDetail>('/orders', data);
  },

  // 支付订单
  payOrder: async (data: PayOrderRequest): Promise<void> => {
    return http.post(`/orders/${data.orderId}/pay`);
  },

  // 获取订单详情
  getOrderDetail: async (orderId: string): Promise<OrderDetail> => {
    return http.get<OrderDetail>(`/orders/${orderId}`);
  },

  // 获取用户订单列表
  getUserOrders: async (userId: number): Promise<OrderSeatDetail[]> => {
    return http.get<OrderSeatDetail[]>(`/orders/user/${userId}`);
  },

  // 取消订单
  cancelOrder: async (orderId: number): Promise<void> => {
    return http.post(`/orders/${orderId}/cancel`);
  },

  // 退款订单
  refundOrder: async (orderId: number): Promise<void> => {
    return http.post(`/orders/${orderId}/refund`);
  },

  // 申请退票
  applyRefund: async (orderId: number): Promise<void> => {
    return http.post(`/orders/${orderId}/apply-refund`);
  },

  // 审核退票申请
  reviewRefund: async (orderId: number, approved: boolean): Promise<void> => {
    return http.post(`/orders/${orderId}/review-refund?approved=${approved}`);
  },

  // 取票（二维码扫描）
  takeTicket: async (orderId: number): Promise<void> => {
    return http.post(`/orders/${orderId}/take-ticket`);
  },

  // 管理员专用API
  // 分页查询所有订单
  getOrderList: (params: any) => http.get('/orders/list', { params }),
}; 