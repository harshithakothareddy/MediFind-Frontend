import { useCallback, useRef } from 'react';

export const useDebounce = (fn, delay = 300) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
};
