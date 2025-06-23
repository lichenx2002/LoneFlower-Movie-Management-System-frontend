export interface Movies {
    movieId: number;
    title: string;
    englishTitle: string;
    director: string;
    genres: string; // 逗号分隔的字符串，如"科幻,灾难,冒险"
    actors: string; // 逗号分隔的字符串
    duration: number; // 以分钟为单位
    releaseDate: string; // ISO 8601 格式的日期字符串
    releaseLocation: string;
    posterUrl: string; // 海报图片的 URL
    trailerUrl: string;
    description: string; // 电影简介
    avgRating: number; // 平均评分
    boxOffice: number;
    wantToWatch: number;
    status: MovieStatus; // 新增状态字段
}

export enum MovieStatus {
    ON_SHELF = 'ON_SHELF',
    OFF_SHELF = 'OFF_SHELF',
    COMING_SOON = 'COMING_SOON'
}

export const MovieStatusDescription: Record<MovieStatus, string> = {
    [MovieStatus.ON_SHELF]: '上映',
    [MovieStatus.OFF_SHELF]: '下架',
    [MovieStatus.COMING_SOON]: '即将上映'
};

// API相关类型定义 - 匹配MyBatis-Plus的Page对象格式
export interface PageResponse<T> {
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

export interface PageParams {
    current?: number;
    size?: number;
    title?: string;
}

export interface MovieSchedulesResponse {
    movie: Movies;
    schedules: any[]; // 这里可以根据实际的场次类型定义
}