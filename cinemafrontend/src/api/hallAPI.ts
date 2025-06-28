import { http } from '../utils/request';
import { Hall } from '../types/hall';

export const hallAPI = {
  // 创建影厅及座位模板
  createHallWithSeats: (data: any) => http.post('/hall/with-seats', data),

  // 获取所有影厅
  getAllHalls: (): Promise<Hall[]> => http.get<Hall[]>('/hall/all'),

  // 根据ID获取影厅
  getHallById: (id: number) => http.get(`/hall/${id}`),

  // 添加影厅
  addHall: (hall: any) => http.post('/hall', hall),

  // 更新影厅
  updateHall: (id: number, hall: any) => http.put(`/hall/${id}`, hall),

  // 删除影厅
  deleteHall: (id: number) => http.delete(`/hall/${id}`),

  // 分页查询影厅列表
  getHallList: (params: any) => http.get('/hall/list', { params }),

  // 一键设置影厅座位类别
  bulkSetSeatType: (hallId: number, seatType: string) =>
    http.put(`/hall/${hallId}/seats/bulk-set-type?seatType=${seatType}`),
}; 