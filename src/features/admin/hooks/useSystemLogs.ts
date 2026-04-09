import { useState, useCallback } from 'react'
import { systemLogsService, type SystemLogsFilters } from '@services/admin/systemLogsService'
import { downloadCSV, downloadPDF, formatExportFilename } from '@utils/exportHelpers'
import type { SystemLog } from '@types/api.types'

interface UseSystemLogsState {
  logs: SystemLog[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  exporting: boolean
}

export const useSystemLogs = () => {
  const [state, setState] = useState<UseSystemLogsState>({
    logs: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
    exporting: false,
  })

  /**
   * Fetch system logs with filters
   */
  const fetchLogs = useCallback(async (filters?: SystemLogsFilters) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await systemLogsService.getLogs(filters)
      setState((prev) => ({
        ...prev,
        logs: data.logs,
        total: data.total,
        page: data.page,
        limit: data.limit,
        loading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logs'
      setState((prev) => ({ ...prev, error: message, loading: false }))
    }
  }, [])

  /**
   * Export logs as CSV
   */
  const exportAsCSV = useCallback(
    async (filters?: SystemLogsFilters, filename?: string) => {
      try {
        setState((prev) => ({ ...prev, exporting: true, error: null }))
        const blob = await systemLogsService.exportLogsAsCSV(filters)

        const finalFilename =
          filename || formatExportFilename('system-logs', 'csv')
        downloadCSV(blob.toString(), finalFilename)

        setState((prev) => ({ ...prev, exporting: false }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to export logs'
        setState((prev) => ({ ...prev, error: message, exporting: false }))
        throw new Error(message)
      }
    },
    []
  )

  /**
   * Export logs as PDF
   */
  const exportAsPDF = useCallback(
    async (filters?: SystemLogsFilters, filename?: string) => {
      try {
        setState((prev) => ({ ...prev, exporting: true, error: null }))
        const blob = await systemLogsService.exportLogsAsPDF(filters)

        const finalFilename =
          filename || formatExportFilename('system-logs', 'pdf')
        downloadPDF(blob, finalFilename)

        setState((prev) => ({ ...prev, exporting: false }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to export logs'
        setState((prev) => ({ ...prev, error: message, exporting: false }))
        throw new Error(message)
      }
    },
    []
  )

  return {
    ...state,
    fetchLogs,
    exportAsCSV,
    exportAsPDF,
  }
}
