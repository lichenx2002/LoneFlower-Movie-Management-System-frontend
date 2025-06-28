import { useState, useEffect, useCallback } from 'react';

export interface UseLocalStorageOptions<T> {
  /** 默认值 */
  defaultValue?: T;
  /** 序列化函数 */
  serialize?: (value: T) => string;
  /** 反序列化函数 */
  deserialize?: (value: string) => T;
}

/**
 * 本地存储管理hook
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [T | null, (value: T | null) => void, () => void] {
  const {
    defaultValue = null,
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  // 获取初始值
  const getInitialValue = useCallback((): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, deserialize]);

  const [storedValue, setStoredValue] = useState<T | null>(getInitialValue);

  // 设置值
  const setValue = useCallback((value: T | null) => {
    try {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(value));
      }
      setStoredValue(value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize]);

  // 移除值
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // 监听storage事件（跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.error(`Error deserializing localStorage value for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue, deserialize]);

  return [storedValue, setValue, removeValue];
} 