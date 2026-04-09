import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  convertToCSV,
  downloadCSV,
  formatExportFilename,
  validateExportData,
} from './exportHelpers'

describe('Export Helpers', () => {
  describe('convertToCSV', () => {
    it('converts data array to CSV format', () => {
      const data = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ]
      const csv = convertToCSV(data)
      
      expect(csv).toContain('"name","email"')
      expect(csv).toContain('"John","john@example.com"')
      expect(csv).toContain('"Jane","jane@example.com"')
    })

    it('handles empty data', () => {
      const csv = convertToCSV([])
      expect(csv).toBe('')
    })

    it('respects column selection', () => {
      const data = [
        { name: 'John', email: 'john@example.com', phone: '123-456' },
      ]
      const csv = convertToCSV(data, ['name', 'email'])
      
      expect(csv).toContain('"name","email"')
      expect(csv).not.toContain('phone')
    })

    it('escapes quotes in values', () => {
      const data = [{ name: 'John "Johnny" Doe' }]
      const csv = convertToCSV(data)
      
      expect(csv).toContain('"John ""Johnny"" Doe"')
    })

    it('handles null and undefined values', () => {
      const data = [
        { name: 'John', email: null, phone: undefined },
      ]
      const csv = convertToCSV(data)
      
      expect(csv).toContain('""')
    })

    it('handles object values', () => {
      const data = [
        { name: 'John', details: { age: 30 } },
      ]
      const csv = convertToCSV(data)
      
      expect(csv).toContain('{"age":30}')
    })
  })

  describe('downloadCSV', () => {
    let createElementSpy: any
    let appendChildSpy: any
    let removeChildSpy: any

    beforeEach(() => {
      createElementSpy = vi.spyOn(document, 'createElement')
      appendChildSpy = vi.spyOn(document.body, 'appendChild')
      removeChildSpy = vi.spyOn(document.body, 'removeChild')
    })

    afterEach(() => {
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('creates and downloads CSV file', () => {
      downloadCSV('name,email\nJohn,john@example.com')
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
    })

    it('uses custom filename', () => {
      const link = { click: vi.fn(), setAttribute: vi.fn() } as any
      createElementSpy.mockReturnValue(link)
      
      downloadCSV('data', 'custom-file.csv')
      
      expect(link.setAttribute).toHaveBeenCalledWith('download', 'custom-file.csv')
    })
  })

  describe('formatExportFilename', () => {
    it('formats filename with timestamp', () => {
      const filename = formatExportFilename('logs', 'csv')
      
      expect(filename).toMatch(/^logs-\d{4}-\d{2}-\d{2}\.csv$/)
    })

    it('uses default format', () => {
      const filename = formatExportFilename('data')
      
      expect(filename).toMatch(/\.csv$/)
    })

    it('uses specified format', () => {
      const filename = formatExportFilename('report', 'pdf')
      
      expect(filename).toMatch(/\.pdf$/)
    })
  })

  describe('validateExportData', () => {
    it('validates array data', () => {
      expect(validateExportData([{ name: 'John' }])).toBe(true)
    })

    it('rejects empty array', () => {
      expect(validateExportData([])).toBe(false)
    })

    it('rejects non-array data', () => {
      expect(validateExportData(null as any)).toBe(false)
      expect(validateExportData(undefined as any)).toBe(false)
      expect(validateExportData('data' as any)).toBe(false)
    })
  })
})
