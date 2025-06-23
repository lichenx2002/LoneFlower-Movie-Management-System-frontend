import { http } from '../utils/request';
import { Cinema } from '../types/cinema';

export const cinemaAPI = {
  // 获取所有影院
  getAllCinemas: () => http.get<Cinema[]>('/cinema/all'),
  // 分页查询影院
  getCinemaList: (current: number, size: number, name?: string) =>
    http.get('/cinema/list', { params: { current, size, name } }),
  // 获取影院详情
  getCinemaById: (id: number) => http.get<Cinema>(`/cinema/${id}`),
  // 创建影院
  createCinema: (cinema: Partial<Cinema>) => http.post('/cinema', cinema),
  // 更新影院
  updateCinema: (id: number, cinema: Partial<Cinema>) => http.put(`/cinema/${id}`, cinema),
  // 删除影院
  deleteCinema: (id: number) => http.delete(`/cinema/${id}`),
}; 