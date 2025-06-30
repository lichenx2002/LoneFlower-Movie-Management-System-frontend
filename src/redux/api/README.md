# RTK Query API 使用指南

## 概述

这个项目使用 Redux Toolkit Query (RTK Query) 来管理电影相关的API请求。RTK Query 是一个强大的数据获取和缓存解决方案，它简化了异步数据获取的逻辑。

## 主要特性

### 1. 自动缓存
- 相同请求的数据会被自动缓存
- 多个组件使用相同数据时不会重复请求
- 缓存会在适当的时候自动失效和更新

### 2. 自动加载状态管理
- `isLoading`: 首次加载状态
- `isFetching`: 任何请求状态（包括刷新）
- `error`: 错误状态

### 3. 乐观更新
- 支持乐观更新，提升用户体验
- 自动处理成功/失败的回滚

### 4. 标签系统
- 使用 `providesTags` 和 `invalidatesTags` 管理缓存
- 当数据发生变化时，相关缓存会自动失效

## API 端点

### 查询 (Queries)
```typescript
// 获取所有电影
const { data, isLoading, error } = useGetAllMoviesQuery();

// 根据ID获取电影
const { data, isLoading, error } = useGetMovieByIdQuery(movieId);

// 获取上映中的电影
const { data, isLoading, error } = useGetOnShelfMoviesQuery();

// 获取即将上映的电影
const { data, isLoading, error } = useGetComingSoonMoviesQuery();

// 分页查询电影列表
const { data, isLoading, error } = useGetMovieListQuery({ current: 1, size: 10 });

// 获取电影场次信息
const { data, isLoading, error } = useGetMovieSchedulesQuery(movieId);
```

### 变更 (Mutations)
```typescript
// 添加电影
const [addMovie, { isLoading }] = useAddMovieMutation();
await addMovie(movieData).unwrap();

// 更新电影
const [updateMovie, { isLoading }] = useUpdateMovieMutation();
await updateMovie({ id: movieId, movie: updateData }).unwrap();

// 删除电影
const [deleteMovie, { isLoading }] = useDeleteMovieMutation();
await deleteMovie(movieId).unwrap();
```

## 使用示例

### 基础使用
```typescript
import { useGetAllMoviesQuery } from '../redux/api/moviesApi';

const MoviesList = () => {
  const { data: movies, isLoading, error } = useGetAllMoviesQuery();

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      {movies?.map(movie => (
        <div key={movie.movieId}>{movie.title}</div>
      ))}
    </div>
  );
};
```

### 带参数的查询
```typescript
import { useGetMovieByIdQuery } from '../redux/api/moviesApi';

const MovieDetail = ({ movieId }: { movieId: number }) => {
  const { data: movie, isLoading, error } = useGetMovieByIdQuery(movieId);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      <h1>{movie?.title}</h1>
      <p>{movie?.description}</p>
    </div>
  );
};
```

### 变更操作
```typescript
import { useAddMovieMutation } from '../redux/api/moviesApi';

const AddMovieForm = () => {
  const [addMovie, { isLoading }] = useAddMovieMutation();

  const handleSubmit = async (values: any) => {
    try {
      await addMovie(values).unwrap();
      message.success('添加成功！');
    } catch (error) {
      message.error('添加失败');
    }
  };

  return (
    <Form onFinish={handleSubmit}>
      {/* 表单内容 */}
      <Button type="primary" htmlType="submit" loading={isLoading}>
        添加电影
      </Button>
    </Form>
  );
};
```

## 缓存策略

### 标签系统
- `Movies`: 所有电影列表相关的缓存
- `Movie`: 单个电影相关的缓存

### 缓存失效
- 添加电影时，`Movies` 标签失效
- 更新电影时，`Movies` 和对应的 `Movie` 标签失效
- 删除电影时，`Movies` 标签失效

## 配置

### 基础配置
```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
```

### Store 配置
```typescript
export const store = configureStore({
  reducer: {
    // 其他 reducers...
    [moviesApi.reducerPath]: moviesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(moviesApi.middleware),
});
```

## 优势对比

### 传统方式 vs RTK Query

| 特性 | 传统 Redux Thunk | RTK Query |
|------|------------------|-----------|
| 缓存 | 手动管理 | 自动缓存 |
| 加载状态 | 手动管理 | 自动管理 |
| 重复请求 | 需要手动避免 | 自动去重 |
| 错误处理 | 手动处理 | 内置处理 |
| 代码量 | 大量样板代码 | 简洁明了 |
| 类型安全 | 需要额外配置 | 开箱即用 |

## 最佳实践

1. **使用自动生成的 hooks**: 直接使用 RTK Query 生成的 hooks，避免手动调用
2. **利用缓存**: 多个组件可以安全地使用相同的查询
3. **错误处理**: 使用 `unwrap()` 来处理异步错误
4. **乐观更新**: 在适当的情况下使用乐观更新提升用户体验
5. **标签管理**: 合理使用标签系统管理缓存失效

## 调试

### Redux DevTools
RTK Query 完全兼容 Redux DevTools，你可以在其中看到：
- 所有 API 请求的状态
- 缓存的数据
- 请求的时间线

### 网络面板
在浏览器的网络面板中，你可以看到：
- 实际的 HTTP 请求
- 请求的时机
- 缓存命中的情况 