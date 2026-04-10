import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';

describe('useUsers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUsers());

    expect(result.current.users).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
