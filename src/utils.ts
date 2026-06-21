export function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Thiết lập một bộ đếm thời gian mới
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}