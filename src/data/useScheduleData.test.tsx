import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ScheduleLoadError } from '@/data/scheduleApi'
import { useScheduleData } from '@/data/useScheduleData'
import { DATASET } from '@/test/fixtures'

const loadScheduleDataset = vi.hoisted(() => vi.fn())

vi.mock('@/data/scheduleApi', async () => {
  const actual = await vi.importActual<typeof import('@/data/scheduleApi')>('@/data/scheduleApi')
  return { ...actual, loadScheduleDataset }
})

beforeEach(() => {
  loadScheduleDataset.mockReset()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useScheduleData', () => {
  it('начинает с загрузки и отдаёт набор', async () => {
    loadScheduleDataset.mockResolvedValue(DATASET)

    const { result } = renderHook(() => useScheduleData())
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.dataset?.sections).toHaveLength(10)
    expect(result.current.error).toBeNull()
  })

  it('показывает текст ошибки из сервиса', async () => {
    loadScheduleDataset.mockRejectedValue(new ScheduleLoadError('Сервер расписания недоступен'))

    const { result } = renderHook(() => useScheduleData())

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Сервер расписания недоступен')
  })

  it('подставляет запасной текст для неизвестной ошибки', async () => {
    loadScheduleDataset.mockRejectedValue('что-то пошло не так')

    const { result } = renderHook(() => useScheduleData())

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Не удалось загрузить расписание')
  })

  it('повторная попытка снова обращается к сервису', async () => {
    loadScheduleDataset.mockRejectedValueOnce(new ScheduleLoadError('Упало')).mockResolvedValue(DATASET)

    const { result } = renderHook(() => useScheduleData())
    await waitFor(() => expect(result.current.status).toBe('error'))

    await act(async () => result.current.reload())

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(loadScheduleDataset).toHaveBeenCalledTimes(2)
  })

  it('параметр fail=1 просит сервис упасть', async () => {
    window.history.replaceState({}, '', '/?fail=1')
    loadScheduleDataset.mockResolvedValue(DATASET)

    renderHook(() => useScheduleData())

    await waitFor(() => expect(loadScheduleDataset).toHaveBeenCalled())
    expect(loadScheduleDataset.mock.calls[0][0]).toMatchObject({ simulateFailure: true })
  })
})
