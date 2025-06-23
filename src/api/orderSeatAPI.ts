import { http } from '../utils/request';
import { OrderSeatDetail } from '../types/orderSeat';


export const orderSeatAPI = {
  getOrderDetail: (orderId: string) => {
    return http.get<OrderSeatDetail>(`/order-seat/${orderId}/detail`);
  }
}; 