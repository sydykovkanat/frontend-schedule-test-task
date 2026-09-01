import { describe, expect, it } from 'vitest'

import { ScheduleLoadError, loadScheduleDataset, parseScheduleDataset } from '@/data/scheduleApi'
import { DATASET } from '@/test/fixtures'

describe('parseScheduleDataset', () => {
  it('принимает настоящий mock-файл', () => {
    expect(parseScheduleDataset(DATASET).sections).toHaveLength(10)
  })

  it('отвергает набор без обязательных полей', () => {
    expect(() => parseScheduleDataset({ meta: {}, timeSlots: [] })).toThrow(ScheduleLoadError)
  })

  it('отвергает аудиторию с отрицательной вместимостью', () => {
    const broken = { ...DATASET, rooms: [{ ...DATASET.rooms[0], capacity: -5 }] }

    expect(() => parseScheduleDataset(broken)).toThrow(ScheduleLoadError)
  })

  it('в сообщении об ошибке нет технического мусора', () => {
    try {
      parseScheduleDataset(null)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ScheduleLoadError)
      expect((error as ScheduleLoadError).message).toContain('данные')
    }
  })
})

describe('loadScheduleDataset', () => {
  it('возвращает набор после искусственной задержки', async () => {
    const dataset = await loadScheduleDataset({ delayMs: 0 })

    expect(dataset.sections).toHaveLength(10)
    expect(dataset.lessons).toHaveLength(10)
  })

  it('умеет падать по требованию, чтобы можно было увидеть состояние ошибки', async () => {
    await expect(loadScheduleDataset({ delayMs: 0, simulateFailure: true })).rejects.toBeInstanceOf(
      ScheduleLoadError,
    )
  })

  it('прерывается по сигналу', async () => {
    const controller = new AbortController()
    const pending = loadScheduleDataset({ delayMs: 50, signal: controller.signal })
    controller.abort()

    await expect(pending).rejects.toBeInstanceOf(ScheduleLoadError)
  })
})
