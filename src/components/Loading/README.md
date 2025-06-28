# Loading 组件使用指南

## 概述

Loading 组件是一个通用的加载状态显示组件，支持多种加载动画效果和配置选项。

## 基本用法

```tsx
import Loading from '../../components/Loading';

// 基本用法
<Loading />

// 自定义文本
<Loading text="正在加载数据..." />

// 全屏加载
<Loading fullScreen={true} />
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | 'spinner' \| 'dots' \| 'pulse' \| 'skeleton' | 'spinner' | 加载类型 |
| size | 'small' \| 'medium' \| 'large' | 'medium' | 加载大小 |
| text | string | '加载中...' | 加载文本 |
| showText | boolean | true | 是否显示文本 |
| className | string | '' | 自定义样式类名 |
| fullScreen | boolean | false | 是否全屏显示 |
| backgroundColor | string | 'rgba(255, 255, 255, 0.8)' | 背景色 |

## 加载类型

### 1. Spinner (默认)
旋转的圆形加载器
```tsx
<Loading type="spinner" />
```

### 2. Dots
跳动的点状加载器
```tsx
<Loading type="dots" />
```

### 3. Pulse
脉冲式加载器
```tsx
<Loading type="pulse" />
```

### 4. Skeleton
骨架屏加载器
```tsx
<Loading type="skeleton" />
```

## 使用场景

### 页面级加载
```tsx
if (loading) {
  return (
    <div className="page-container">
      <Loading 
        type="skeleton" 
        size="large" 
        text="正在加载页面数据..." 
      />
    </div>
  );
}
```

### 全屏加载
```tsx
<Loading 
  type="spinner" 
  size="large" 
  text="正在提交数据..." 
  fullScreen={true}
  backgroundColor="rgba(0, 0, 0, 0.5)"
/>
```

### 按钮加载状态
```tsx
<Button 
  loading={loading}
  onClick={handleSubmit}
>
  {loading ? <Loading type="dots" size="small" showText={false} /> : '提交'}
</Button>
```

## 与 Hooks 结合使用

### 使用 useAsync Hook
```tsx
import { useAsync } from '../../hooks';

const { state, execute } = useAsync(
  async () => {
    return await api.getData();
  },
  { immediate: true }
);

if (state.loading) {
  return <Loading type="skeleton" text="正在加载数据..." />;
}

if (state.error) {
  return <div>错误: {state.error.message}</div>;
}

return <div>{state.data}</div>;
```

### 使用 useLoading Hook
```tsx
import { useLoading } from '../../hooks';

const { loading, execute } = useLoading({
  delay: 300, // 300ms后显示loading
});

const handleSubmit = async () => {
  await execute(async () => {
    await api.submitData();
  });
};

return (
  <div>
    {loading && <Loading type="pulse" text="正在提交..." />}
    <button onClick={handleSubmit}>提交</button>
  </div>
);
```

## 全局加载状态

使用 LoadingProvider 管理全局加载状态：

```tsx
import { useGlobalLoading } from '../../components/LoadingProvider';

const { showGlobalLoading, hideGlobalLoading } = useGlobalLoading();

const handleGlobalAction = async () => {
  showGlobalLoading('正在处理...');
  try {
    await api.someAction();
  } finally {
    hideGlobalLoading();
  }
};
```

## 最佳实践

1. **选择合适的加载类型**：
   - 页面级加载：使用 `skeleton`
   - 操作反馈：使用 `spinner` 或 `pulse`
   - 按钮加载：使用 `dots`

2. **提供有意义的文本**：
   - 避免使用通用的"加载中..."
   - 具体说明正在进行的操作

3. **合理使用全屏加载**：
   - 只在重要操作时使用全屏加载
   - 避免频繁的全屏加载影响用户体验

4. **结合错误处理**：
   - 总是提供错误状态的处理
   - 提供重试机制

5. **性能优化**：
   - 使用 `delay` 参数避免快速加载时的闪烁
   - 合理使用 `useAsync` 和 `useLoading` hooks 