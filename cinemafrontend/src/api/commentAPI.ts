import { http } from '../utils/request';
import { Comment } from '../types/comment';

export const commentAPI = {
    // 获取电影评论
    getMovieComments: (movieId: number) => http.get<Comment[]>(`/comment/all?movieId=${movieId}`),
    // 添加电影评论
    addMovieComment: (userId: number, movieId: number, content: string, rating: number) =>
        http.post<Comment>(`/comment/add`, { userId, movieId, content, rating }),
    // 删除电影评论
    deleteMovieComment: (commentId: number) => http.delete(`/comment/${commentId}`),

    // 管理员专用API
    // 分页查询所有评论
    getCommentList: (params: any) => http.get('/comment/list', { params }),
    // 删除评论（管理员）
    deleteComment: (commentId: number) => http.delete(`/comment/${commentId}`),
};