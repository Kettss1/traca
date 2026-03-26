import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('não atualiza o valor antes do delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    )

    rerender({ value: 'world', delay: 500 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('hello')
  })

  it('atualiza o valor após o delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    )

    rerender({ value: 'world', delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('world')
  })

  it('reseta o timer se o valor mudar durante o delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    )

    rerender({ value: 'b', delay: 500 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    rerender({ value: 'c', delay: 500 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // 'c' não completou 500ms ainda
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('c')
  })
})
