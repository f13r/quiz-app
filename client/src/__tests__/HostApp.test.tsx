import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HostApp from '../host/HostApp.jsx'

const { mockSocket, handlers } = vi.hoisted(() => {
  const handlers: Record<string, ((...args: unknown[]) => void)[]> = {}
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!handlers[event]) handlers[event] = []
      handlers[event].push(handler)
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = (handlers[event] ?? []).filter(h => h !== handler)
    }),
    trigger(event: string, ...args: unknown[]) {
      handlers[event]?.forEach(h => h(...args))
    }
  }
  return { mockSocket, handlers }
})

vi.mock('../socket.js', () => ({ default: mockSocket }))

function renderHostApp() {
  return render(
    <MemoryRouter initialEntries={['/host']}>
      <Routes>
        <Route path="/host" element={<HostApp />} />
        <Route path="/game" element={<div>display view</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('HostApp — host claiming', () => {
  beforeEach(() => {
    mockSocket.emit.mockClear()
    mockSocket.on.mockClear()
    mockSocket.off.mockClear()
    Object.keys(handlers).forEach(k => delete handlers[k])
  })
  afterEach(cleanup)

  test('emits claim-host on mount', () => {
    renderHostApp()
    expect(mockSocket.emit).toHaveBeenCalledWith('claim-host')
  })

  test('stays on host view when host-status is true', () => {
    renderHostApp()
    act(() => mockSocket.trigger('host-status', true))
    expect(screen.queryByText('display view')).toBeNull()
  })

  test('navigates to /game when host-status is false', () => {
    renderHostApp()
    act(() => mockSocket.trigger('host-status', false))
    expect(screen.getByText('display view')).toBeTruthy()
  })

  test('unsubscribes host-status listener on unmount', () => {
    const { unmount } = renderHostApp()
    const subscribedHandler = mockSocket.on.mock.calls.find(([ev]) => ev === 'host-status')?.[1]
    unmount()
    const unsubscribedHandler = mockSocket.off.mock.calls.find(([ev]) => ev === 'host-status')?.[1]
    expect(unsubscribedHandler).toBe(subscribedHandler)
  })
})
