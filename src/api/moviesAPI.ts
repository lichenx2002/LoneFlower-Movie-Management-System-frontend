import { http } from '../utils/request';
import { Movies, PageResponse, PageParams, MovieSchedulesResponse } from "../types/movies";

export const moviesAPI = {
  // 获取所有电影
  getAllMovies: () => http.get<Movies[]>('/movie/all'),

  // 根据ID获取电影
  getMovieById: (id: number) => http.get<Movies>(`/movie/${id}`),

  // 获取上映中的电影
  getOnShelfMovies: () => http.get<Movies[]>('/movie/on-shelf'),

  // 获取即将上映的电影
  getComingSoonMovies: () => http.get<Movies[]>('/movie/coming-soon'),

  // 添加新电影
  addMovie: (movie: Omit<Movies, 'movieId'>) => http.post<Movies>('/movie', movie),

  // 更新电影信息
  updateMovie: (id: number, movie: Partial<Movies>) => http.put<Movies>(`/movie/${id}`, movie),

  // 删除电影
  deleteMovie: (id: number) => http.delete(`/movie/${id}`),

  // 分页查询电影列表
  getMovieList: (params: PageParams) => http.get<PageResponse<Movies>>('/movie/list', { params }),

  // 获取电影场次信息
  getMovieSchedules: (id: number) => http.get<MovieSchedulesResponse>(`/movie/${id}/schedules`),
} 