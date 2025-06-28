export interface OrderDetail {
  orderId: number;
  userId: number;
  scheduleId: number;
  movieName: string;
  hallName: string;
  showTime: string;
  seats: {
    row: number;
    col: number;
  }[];
  totalAmount: number;
  orderTime: string;
  status: 'UNPAID' | 'PAID' | 'CANCELED' | 'REFUNDED' | 'PENDING';
}

export interface CreateOrderRequest {
  userId: number;
  ssIds: number[];
  totalAmount: number;
}

export interface PayOrderRequest {
  orderId: number;
}