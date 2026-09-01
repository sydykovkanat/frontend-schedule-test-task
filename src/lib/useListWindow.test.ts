import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { useListWindow } from './useListWindow'

const STRIDE = 100

class FakeResizeObserver {
  private readonly callback: () => void

  constructor(callback: () => void) {
    this.callback = callback
  }

  observe() {
    this.callback()
  }

  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver
})

function scroller(clientHeight: number) {
  const element = document.createElement('div')
  Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true })
  document.body.append(element)
  const ref = createRef<HTMLElement>() as { current: HTMLElement | null }
  ref.current = element
  return { element, ref }
}

describe('useListWindow', () => {
  it('без измеренной высоты показывает начало списка', () => {
    const ref = { current: null }

    const { result } = renderHook(() => useListWindow(ref, { itemCount: 500, itemStride: STRIDE }))

    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBeGreaterThan(0)
    expect(result.current.paddingBottom).toBeGreaterThan(0)
  })

  it('показывает только видимую часть большого списка', () => {
    const { ref } = scroller(500)

    const { result } = renderHook(() => useListWindow(ref, { itemCount: 500, itemStride: STRIDE }))

    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBeLessThan(500)
    expect(result.current.paddingTop).toBe(0)
  })

  it('сдвигает окно при прокрутке и компенсирует отступом', () => {
    const { element, ref } = scroller(500)
    const { result } = renderHook(() => useListWindow(ref, { itemCount: 500, itemStride: STRIDE, overscan: 2 }))

    act(() => {
      Object.defineProperty(element, 'scrollTop', { value: STRIDE * 20, configurable: true })
      element.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.startIndex).toBe(18)
    expect(result.current.paddingTop).toBe(18 * STRIDE)
  })

  it('короткий список показывает целиком без отступов', () => {
    const { ref } = scroller(1000)

    const { result } = renderHook(() => useListWindow(ref, { itemCount: 3, itemStride: STRIDE }))

    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(3)
    expect(result.current.paddingTop).toBe(0)
    expect(result.current.paddingBottom).toBe(0)
  })

  it('не уходит за конец списка на самом низу', () => {
    const { element, ref } = scroller(500)
    const { result } = renderHook(() => useListWindow(ref, { itemCount: 30, itemStride: STRIDE }))

    act(() => {
      Object.defineProperty(element, 'scrollTop', { value: STRIDE * 25, configurable: true })
      element.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.endIndex).toBe(30)
    expect(result.current.paddingBottom).toBe(0)
  })
})
