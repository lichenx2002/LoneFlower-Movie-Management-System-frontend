/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行（可选，默认false）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timer: any = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timer) {
      clearTimeout(timer);
    }

    if (immediate && !timer) {
      fn.apply(context, args);
    }

    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args);
      }
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const context = this;

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(context, args);
    }
  };
} 