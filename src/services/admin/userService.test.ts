import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../api/client';
import { userService } from './userService';
import type { User } from '@/types/api.types';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a user through the admin endpoint using the expected payload', async () => {
    const user: User = {
      id: '1',
      email: 'sam.student@example.com',
      firstname: 'Sam',
      lastname: 'Student',
      username: 'sam.student',
      role: 'student',
      isBlocked: false,
      isVerified: false,
      isActive: true,
      createdAt: '2026-10-09T00:00:00Z',
      updatedAt: '2026-10-09T00:00:00Z',
    };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, data: { user }, message: 'User created successfully' },
    });

    await expect(
      userService.createUser({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      })
    ).resolves.toEqual(user);

    expect(apiClient.post).toHaveBeenCalledWith('/admin/users', {
      email: user.email,
      name: 'Sam Student',
      role: user.role,
    });
  });

  it('loads users from the admin endpoint with supported filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: { users: [], total: 0, page: 2, totalPages: 0 },
        message: 'Users fetched successfully',
      },
    });

    await expect(
      userService.getUsers({
        role: 'teacher',
        status: 'blocked',
        search: 'sam',
        page: 2,
        limit: 10,
      })
    ).resolves.toEqual({
      users: [],
      total: 0,
      page: 2,
      totalPages: 0,
      limit: 10,
    });

    const [url, config] = vi.mocked(apiClient.get).mock.calls[0];
    expect(url).toBe('/admin/users');
    expect(config?.params.toString()).toBe(
      'role=teacher&isBlocked=true&search=sam&page=2&limit=10'
    );
  });

  it('changes a user role through the admin update endpoint', async () => {
    const user: User = {
      id: '1',
      email: 'sam.student@example.com',
      firstname: 'Sam',
      lastname: 'Student',
      username: 'sam.student',
      role: 'teacher',
      isBlocked: false,
      isVerified: false,
      isActive: true,
      createdAt: '2026-10-09T00:00:00Z',
      updatedAt: '2026-10-09T00:00:00Z',
    };
    vi.mocked(apiClient.put).mockResolvedValue({
      data: { success: true, data: { user }, message: 'User updated successfully' },
    });

    await expect(userService.changeUserRole(user.id, user.role)).resolves.toEqual(user);

    expect(apiClient.put).toHaveBeenCalledWith('/admin/users/1', {
      role: 'teacher',
    });
  });
});
