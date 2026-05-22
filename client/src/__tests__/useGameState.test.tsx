import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState, type GameSocket } from '../useGameState.js'
import type { GameState } from '../../../shared/types.js'

function makeFakeSocket() {
  const calls: { emit: unknown[][], on: unknown[][], off: unknown[][] } = { emit: [], on: [], off: [] }
  const handlers: Record<string, (data: unknown) => void> = {}
  return {
    emit(ev: string, ...args: unknown[]) { calls.emit.push([ev, ...args]) },
    on(ev: string, handler: (data: unknown) => void) { calls.on.push([ev, handler]); handlers[ev] = handler },
    off(ev: string, handler: (data: unknown) => void) { calls.off.push([ev, handler]) },
    trigger(ev: string, data: unknown) { handlers[ev]?.(data) },
    calls
  }
}

describe('useGameState', () => {
  test('returns null before any game-state event', () => {
    const socket = makeFakeSocket()
    const { result } = renderHook(() => useGameState(socket as unknown as GameSocket))
    expect(result.current).toBeNull()
  })

  test('emits request-state on mount', () => {
    const socket = makeFakeSocket()
    renderHook(() => useGameState(socket as unknown as GameSocket))
    expect(socket.calls.emit).toContainEqual(['request-state'])
  })

  test('subscribes to game-state event', () => {
    const socket = makeFakeSocket()
    renderHook(() => useGameState(socket as unknown as GameSocket))
    expect(socket.calls.on.map(([event]) => event)).toContain('game-state')
  })

  test('returns state when game-state event fires', () => {
    const socket = makeFakeSocket()
    const { result } = renderHook(() => useGameState(socket as unknown as GameSocket))
    const state = { gamePhase: 'setup', teams: { blue: { players: [] }, yellow: { players: [] } } } as unknown as GameState
    act(() => socket.trigger('game-state', state))
    expect(result.current).toEqual(state)
  })

  test('unsubscribes from game-state on unmount', () => {
    const socket = makeFakeSocket()
    const { unmount } = renderHook(() => useGameState(socket as unknown as GameSocket))
    unmount()
    expect(socket.calls.off.map(([event]) => event)).toContain('game-state')
  })

  test('unsubscribes the exact handler that was subscribed', () => {
    const socket = makeFakeSocket()
    const { unmount } = renderHook(() => useGameState(socket as unknown as GameSocket))
    const subscribedHandler = socket.calls.on.find(([event]) => event === 'game-state')?.[1]
    unmount()
    const unsubscribedHandler = socket.calls.off.find(([event]) => event === 'game-state')?.[1]
    expect(unsubscribedHandler).toBe(subscribedHandler)
  })
})
