import { apiClient } from '../api/client'
import type { SystemLog } from '../../types/api.types'

export interface SystemLogsListResponse {
  logs: SystemLog[]
  total: number
  page: number
  limit: number
}

export interface SystemLogsFilters {
  userId?: string
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export interface ExportOptions {
  format: 'csv' | 'pdf'
  filters?: SystemLogsFilters
}

/**
 * Admin System Logs Service
 * Handles all system logs operations for admins
 */

export const systemLogsService = {
  /**
   * Get system logs with optional filtering
   */
  async getLogs(filters?: SystemLogsFilters) {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.resource) params.append('resource', filters.resource)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get<SystemLogsListResponse>('/admin/logs', { params })
    return response.data
  },

  /**
   * Export system logs as CSV
   */
  async exportLogsAsCSV(filters?: SystemLogsFilters) {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.resource) params.append('resource', filters.resource)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)

    const response = await apiClient.get('/admin/logs/export/csv', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Export system logs as PDF
   */
  async exportLogsAsPDF(filters?: SystemLogsFilters) {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.resource) params.append('resource', filters.resource)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)

    const response = await apiClient.get('/admin/logs/export/pdf', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
