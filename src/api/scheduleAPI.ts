import { http } from '../utils/request';
import {
  ScheduleResponse,
  ScheduleEntity,
  SchedulePageParams,
  SchedulePageResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleDetail
} from '../types/schedule';

export const scheduleAPI = {
  // 前台接口
  getSchedulesByMovieId: (movieId: number) => http.get<ScheduleResponse>(`/schedules/movie/${movieId}`),
  getScheduleDetail: (scheduleId: number) => http.get<ScheduleDetail>(`/schedules/${scheduleId}/detail`),
  getScheduleSeats: (scheduleId: number) => http.get(`/schedules/${scheduleId}/seats`),
  lockSeats: (scheduleId: number, seatIds: number[], userId: number) =>
    http.post<boolean>(`/schedules/${scheduleId}/seats/lock?userId=${userId}`, seatIds),
  unlockSeats: (scheduleId: number, seatIds: number[]) =>
    http.post<boolean>(`/schedules/${scheduleId}/seats/unlock`, seatIds),
  checkSeatsAvailable: (scheduleId: number, seatIds: number[]) =>
    http.post<boolean>(`/schedules/${scheduleId}/seats/check`, seatIds),

  // 后台管理接口
  // 获取所有场次（分页）
  getScheduleList: (params: SchedulePageParams) =>
    http.get<SchedulePageResponse<ScheduleEntity>>('/schedule/list', { params }),

  // 根据ID获取场次详情
  getScheduleById: (id: number) =>
    http.get<ScheduleEntity>(`/schedule/${id}`),

  // 添加场次
  addSchedule: (schedule: CreateScheduleRequest) =>
    http.post<ScheduleEntity>('/schedule', schedule),

  // 更新场次
  updateSchedule: (id: number, schedule: UpdateScheduleRequest) =>
    http.put<ScheduleEntity>(`/schedule/${id}`, schedule),

  // 删除场次
  deleteSchedule: (id: number) =>
    http.delete(`/schedule/${id}`),

  // 获取所有场次（不分页）
  getAllSchedules: () =>
    http.get<ScheduleEntity[]>('/schedule/all'),
}; 