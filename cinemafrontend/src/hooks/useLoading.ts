import { useState, useCallback } from 'react';

export interface UseLoadingOptions {
  /** 初始加载状态 */
  initialLoading?: boolean;
  /** 加载延迟时间（毫秒），用于防止闪烁 */
  delay?: number;
  /** 错误处理函数 */
  onError?: (error: Error) => void;
}

export interface UseLoadingReturn {
  /** 当前加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误信息 */
  setError: (error: Error | null) => void;
  /** 执行异步操作并自动管理加载状态 */
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 通用的加载状态管理hook
 */
export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
  const {
    initialLoading = false,
    delay = 0,
    onError
  } = options;

  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [timeoutId, setTimeoutId] = useState<any>(null);

  const setLoadingWithDelay = useCallback((newLoading: boolean) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (newLoading && delay > 0) {
      const id = setTimeout(() => {
        setLoading(true);
      }, delay);
      setTimeoutId(id);
    } else {
      setLoading(newLoading);
    }
  }, [delay, timeoutId]);

  const setErrorState = useCallback((newError: Error | null) => {
    setError(newError);
    if (newError && onError) {
      onError(newError);
    }
  }, [onError]);

  const execute = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      setLoadingWithDelay(true);
      setErrorState(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setErrorState(error);
      throw error;
    } finally {
      setLoadingWithDelay(false);
    }
  }, [setLoadingWithDelay, setErrorState]);

  const reset = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setLoading(false);
    setError(null);
  }, [timeoutId]);

  return {
    loading,
    error,
    setLoading: setLoadingWithDelay,
    setError: setErrorState,
    execute,
    reset
  };
}; 