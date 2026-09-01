import { useEffect, useState, type RefObject } from 'react'

export interface ListWindow {
  startIndex: number
  endIndex: number
  paddingTop: number
  paddingBottom: number
}

interface ListWindowOptions {
  itemCount: number
  itemStride: number
  overscan?: number
}

export function useListWindow(
  scrollRef: RefObject<HTMLElement | null>,
  { itemCount, itemStride, overscan = 6 }: ListWindowOptions,
): ListWindow {
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const onScroll = () => setScrollTop(element.scrollTop)
    const observer = new ResizeObserver(() => setViewportHeight(element.clientHeight))

    setViewportHeight(element.clientHeight)
    element.addEventListener('scroll', onScroll, { passive: true })
    observer.observe(element)

    return () => {
      element.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [scrollRef])

  if (viewportHeight === 0) {
    const fallbackEnd = Math.min(itemCount, overscan * 4)
    return { startIndex: 0, endIndex: fallbackEnd, paddingTop: 0, paddingBottom: (itemCount - fallbackEnd) * itemStride }
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / itemStride) - overscan)
  const visibleCount = Math.ceil(viewportHeight / itemStride) + overscan * 2
  const endIndex = Math.min(itemCount, startIndex + visibleCount)

  return {
    startIndex,
    endIndex,
    paddingTop: startIndex * itemStride,
    paddingBottom: Math.max(0, (itemCount - endIndex) * itemStride),
  }
}
