import { useState, useCallback } from 'react';
import { userService, type UserFilters } from '@services/admin/userService';
import type { User, UserRole } from '@/types/api.types';

interface UseUsersState {
  users: User[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

export const useUsers = () => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
  });

  /**
   * Fetch users with filters
   */
  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await userService.getUsers(filters);
      console.log('user data', data);
      setState((prev) => ({
        ...prev,
        users: data.users,
        total: data.total,
        page: data.page,
        limit: data.limit,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  /**
   * Get a single user
   */
  const getUser = useCallback(async (userId: string) => {
    try {
      return await userService.getUserById(userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      throw new Error(message);
    }
  }, []);

  /**
   * Create a new user
   */
  const createUser = useCallback(
    async (firstname: string, lastname: string, email: string, role: UserRole) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const user = await userService.createUser({ email, firstname, lastname, role });
        setState((prev) => ({
          ...prev,
          users: [user, ...prev.users],
          total: prev.total + 1,
          loading: false,
        }));
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create user';
        setState((prev) => ({ ...prev, error: message, loading: false }));
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Update a user
   */
  const updateUser = useCallback(async (userId: string, updates: any) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await userService.updateUser(userId, updates);
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? user : u)),
        loading: false,
      }));
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  /**
   * Change user role
   */
  const changeRole = useCallback(async (userId: string, role: UserRole) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await userService.changeUserRole(userId, role);
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? user : u)),
        loading: false,
      }));
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change user role';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  /**
   * Block a user
   */
  const blockUser = useCallback(async (userId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await userService.blockUser(userId);
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? user : u)),
        loading: false,
      }));
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to block user';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  /**
   * Unblock a user
   */
  const unblockUser = useCallback(async (userId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await userService.unblockUser(userId);
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? user : u)),
        loading: false,
      }));
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unblock user';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  /**
   * Delete a user
   */
  const deleteUserFn = useCallback(async (userId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await userService.deleteUser(userId);
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
        total: prev.total - 1,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  return {
    ...state,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    changeRole,
    blockUser,
    unblockUser,
    deleteUser: deleteUserFn,
  };
};
