import { http } from '../utils/request';
import { ScheduleDetail } from '../types/hall';
import { ScheduleResponse } from '../types/schedule';

export const seatAPI = {
  // 获取场次的座位信息
  getSeatsByScheduleId: (scheduleId: number) =>
    http.get<ScheduleDetail>(`/schedules/${scheduleId}/detail`),
}; 