# useCallback 快速指导方案

## 🎯 什么是 useCallback？

`useCallback` 是 React 的一个 Hook，用于**缓存函数**，避免在每次渲染时重新创建函数，从而优化性能。

## 📝 基本语法

```typescript
const memoizedCallback = useCallback(
  () => {
    // 你的函数逻辑
  },
  [dependencies] // 依赖数组
);
```

## 🔍 什么时候使用？

### ✅ 应该使用 useCallback 的场景：

1. **函数作为 props 传递给子组件**
2. **函数作为 useEffect 的依赖**
3. **函数被其他 Hook 使用（如 useMemo）**
4. **子组件使用 React.memo 优化**

### ❌ 不需要使用 useCallback 的场景：

1. **函数只在当前组件内部使用**
2. **函数逻辑简单，创建成本低**
3. **没有性能问题**

## 🚀 实际示例

### 1. 基础用法

```typescript
import React, { useCallback, useState } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 缓存函数，只有当 count 变化时才重新创建
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // 空依赖数组，函数永远不会重新创建

  // 缓存函数，当 text 变化时重新创建
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []); // 空依赖数组，因为 setText 是稳定的

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>增加</button>
      <input value={text} onChange={(e) => handleTextChange(e.target.value)} />
    </div>
  );
};
```

### 2. 传递函数给子组件

```typescript
// 父组件
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  // 缓存函数，避免子组件不必要的重新渲染
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent onButtonClick={handleClick} />
    </div>
  );
};

// 子组件（使用 React.memo 优化）
const ChildComponent = React.memo(({ onButtonClick }: { onButtonClick: () => void }) => {
  console.log('ChildComponent 渲染了');
  return <button onClick={onButtonClick}>点击我</button>;
});
```

### 3. 在 useEffect 中使用

```typescript
const MyComponent = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');

  // 缓存函数，避免 useEffect 无限循环
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/data?filter=${filter}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }, [filter]); // 当 filter 变化时重新创建函数

  useEffect(() => {
    fetchData();
  }, [fetchData]); // 使用缓存的函数作为依赖

  return (
    <div>
      <input 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
        placeholder="输入过滤条件"
      />
      <ul>
        {data.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
};
```

### 4. 带参数的函数

```typescript
const MyComponent = () => {
  const [items, setItems] = useState([]);

  // 缓存带参数的函数
  const handleItemClick = useCallback((itemId: number) => {
    console.log('点击了项目:', itemId);
    // 处理点击逻辑
  }, []); // 空依赖数组，因为函数逻辑不依赖任何状态

  // 缓存带多个参数的函数
  const handleItemUpdate = useCallback((itemId: number, newValue: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, value: newValue } : item
      )
    );
  }, []); // 空依赖数组，因为 setItems 是稳定的

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <span onClick={() => handleItemClick(item.id)}>{item.name}</span>
          <button onClick={() => handleItemUpdate(item.id, '新值')}>
            更新
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🎯 依赖数组详解

### 空依赖数组 `[]`
```typescript
const handleClick = useCallback(() => {
  // 函数逻辑
}, []); // 函数永远不会重新创建
```

### 有依赖的数组 `[dep1, dep2]`
```typescript
const handleClick = useCallback(() => {
  console.log(count, text); // 使用状态
}, [count, text]); // 当 count 或 text 变化时重新创建
```

### 常见错误
```typescript
// ❌ 错误：忘记添加依赖
const handleClick = useCallback(() => {
  console.log(count); // 使用了 count
}, []); // 但没有在依赖数组中

// ✅ 正确
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // 添加了依赖
```

## 🔧 在你的项目中的应用

### 电影列表组件优化

```typescript
const MoviesList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // 缓存获取电影的函数
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moviesAPI.getAllMovies();
      setMovies(data);
    } catch (error) {
      console.error('获取电影失败:', error);
    } finally {
      setLoading(false);
    }
  }, []); // 空依赖数组，因为不依赖任何状态

  // 缓存删除电影的函数
  const handleDeleteMovie = useCallback(async (movieId: number) => {
    try {
      await moviesAPI.deleteMovie(movieId);
      // 重新获取电影列表
      fetchMovies();
    } catch (error) {
      console.error('删除电影失败:', error);
    }
  }, [fetchMovies]); // 依赖 fetchMovies

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return (
    <div>
      {movies.map(movie => (
        <MovieCard 
          key={movie.movieId} 
          movie={movie}
          onDelete={handleDeleteMovie} // 传递缓存的函数
        />
      ))}
    </div>
  );
};
```

## ⚡ 性能优化技巧

### 1. 结合 React.memo
```typescript
const ExpensiveComponent = React.memo(({ onAction }: { onAction: () => void }) => {
  // 复杂的渲染逻辑
  return <div>...</div>;
});

const ParentComponent = () => {
  const handleAction = useCallback(() => {
    // 处理逻辑
  }, []);

  return <ExpensiveComponent onAction={handleAction} />;
};
```

### 2. 避免过度优化
```typescript
// ❌ 过度优化：简单的内联函数不需要 useCallback
const SimpleComponent = () => {
  const handleClick = useCallback(() => {
    console.log('点击');
  }, []); // 不必要的优化

  return <button onClick={handleClick}>点击</button>;
};

// ✅ 简单直接
const SimpleComponent = () => {
  return <button onClick={() => console.log('点击')}>点击</button>;
};
```

## 🎯 最佳实践

1. **只在需要时使用** - 不要为了使用而使用
2. **正确设置依赖** - 确保依赖数组包含所有使用的变量
3. **结合 React.memo** - 与子组件优化配合使用
4. **避免过度优化** - 简单函数不需要缓存
5. **测试性能** - 使用 React DevTools 检查是否真的优化了

## 🔍 调试技巧

### 检查函数是否重新创建
```typescript
const MyComponent = () => {
  const handleClick = useCallback(() => {
    console.log('函数执行');
  }, []);

  console.log('组件渲染，函数地址:', handleClick); // 检查函数地址是否变化

  return <button onClick={handleClick}>点击</button>;
};
```

### 使用 React DevTools
- 安装 React DevTools
- 查看组件重新渲染的原因
- 检查 props 变化

## 📚 总结

`useCallback` 是 React 性能优化的重要工具，但需要正确使用：

- ✅ **适用场景**：函数作为 props、useEffect 依赖、子组件优化
- ❌ **避免场景**：简单函数、没有性能问题
- 🎯 **关键点**：正确设置依赖数组
- 🔧 **配合使用**：React.memo、useMemo

记住：**过早优化是万恶之源**，先确保有性能问题再使用 useCallback！ 