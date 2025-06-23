export interface Schedule {
  loverPrice: number;
  hallId: number;
  vipPrice: number;
  hallType: 'LARGE' | 'MEDIUM' | 'SMALL';
  startTime: string;
  endTime: string;
  hallName: string;
  scheduleId: number;
  basePrice: number;
}

export interface ScheduleResponse {
  schedules: {
    [date: string]: Schedule[];
  };
}

export interface Seat {
  ssId: number;
  rowLabel: string;
  colNum: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'LOCKED';
  price: number;
}

export interface ScheduleDetail {
  movie: {
    title: string;
  };
  schedule: {
    startTime: string;
    endTime: string;
  };
  hall: {
    name: string;
  };
  seats: Seat[];
}

// 场次管理相关类型定义
export interface ScheduleEntity {
  scheduleId: number;
  movieId: number;
  hallId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  vipPrice: number;
  loverPrice: number;
  movie?: {
    title: string;
    posterUrl: string;
  };
  hall?: {
    hallName: string;
    hallType: string;
  };
}

// 分页查询参数
export interface SchedulePageParams {
  current?: number;
  size?: number;
  movieId?: number;
  hallId?: number;
  startDate?: string;
  endDate?: string;
}

// 分页响应类型
export interface SchedulePageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  optimizeCountSql?: boolean;
  searchCount?: boolean;
  countId?: string;
  maxLimit?: number;
}

// 创建场次请求
export interface CreateScheduleRequest {
  movieId: number;
  hallId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  vipPrice: number;
  loverPrice: number;
}

// 更新场次请求
export interface UpdateScheduleRequest {
  movieId?: number;
  hallId?: number;
  startTime?: string;
  endTime?: string;
  basePrice?: number;
  vipPrice?: number;
  loverPrice?: number;
} 