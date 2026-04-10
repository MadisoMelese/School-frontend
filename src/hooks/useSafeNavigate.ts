import { useNavigate } from 'react-router-dom';

type NavigateFn = ReturnType<typeof useNavigate> | (() => void);

export function useSafeNavigate(): NavigateFn {
  try {
    return useNavigate();
  } catch {
    // If no Router is present (e.g., in isolated tests), return a no-op navigate function
    return () => {};
  }
}
