import { useState, useCallback, useEffect } from 'react';

export interface AsyncState<T> {
  /** 数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 是否已经执行过 */
  executed: boolean;
}

export interface UseAsyncOptions<T> {
  /** 初始数据 */
  initialData?: T | null;
  /** 是否立即执行 */
  immediate?: boolean;
  /** 依赖项，当依赖项变化时重新执行 */
  deps?: any[];
  /** 错误处理函数 */
  onError?: (error: Error) => void;
  /** 成功处理函数 */
  onSuccess?: (data: T) => void;
}

export interface UseAsyncReturn<T> {
  /** 异步状态 */
  state: AsyncState<T>;
  /** 执行异步操作 */
  execute: (...args: any[]) => Promise<T>;
  /** 重置状态 */
  reset: () => void;
  /** 设置数据 */
  setData: (data: T) => void;
  /** 设置错误 */
  setError: (error: Error | null) => void;
}

/**
 * 异步操作状态管理hook
 */
export function useAsync<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const {
    initialData = null,
    immediate = false,
    deps = [],
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    executed: false
  });

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const data = await asyncFn(...args);
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        executed: true
      }));

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        error: err,
        loading: false,
        executed: true
      }));

      if (onError) {
        onError(err);
      }

      throw err;
    }
  }, [asyncFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      executed: false
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error
    }));
  }, []);

  // 立即执行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // 依赖项变化时重新执行
  useEffect(() => {
    if (deps.length > 0 && immediate) {
      execute();
    }
  }, deps);

  return {
    state,
    execute,
    reset,
    setData,
    setError
  };
} 