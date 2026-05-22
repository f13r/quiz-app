import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ResultsScreen from '../host/ResultsScreen.jsx'
import type { GameState } from '../../../shared/types.js'

const mockEmit = vi.hoisted(() => vi.fn())
vi.mock('../socket.js', () => ({ default: { emit: mockEmit } }))

function makeState(
  bluePlayers: { id: number; name: string; points: number }[],
  yellowPlayers: { id: number; name: string; points: number }[]
): GameState {
  return {
    gamePhase: 'ended',
    teams: { blue: { players: bluePlayers }, yellow: { players: yellowPlayers } },
    cardOwner: 'blue', activeTeam: 'blue',
    questionIndex: 0, questionCounter: 1,
    isStealing: false, cardComplete: false, canUndo: false, nextPlayerId: 1,
  }
}

describe('host ResultsScreen', () => {
  beforeEach(() => mockEmit.mockClear())
  afterEach(cleanup)

  test('shows blue winner text when blue has more points', () => {
    render(<ResultsScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 5 }],
      [{ id: 2, name: 'Bob', points: 3 }]
    )} />)
    expect(screen.getByText(/Синя команда перемогла/)).toBeTruthy()
  })

  test('shows yellow winner text when yellow has more points', () => {
    render(<ResultsScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 2 }],
      [{ id: 2, name: 'Bob', points: 7 }]
    )} />)
    expect(screen.getByText(/Жовта команда перемогла/)).toBeTruthy()
  })

  test('shows draw text when teams are tied', () => {
    render(<ResultsScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 4 }],
      [{ id: 2, name: 'Bob', points: 4 }]
    )} />)
    expect(screen.getByText(/Нічия/)).toBeTruthy()
  })

  test('shows correct team score totals', () => {
    render(<ResultsScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 3 }, { id: 2, name: 'Bob', points: 2 }],
      [{ id: 3, name: 'Carol', points: 6 }]
    )} />)
    expect(screen.getByText('5')).toBeTruthy()  // blue total
    expect(screen.getByText('6')).toBeTruthy()  // yellow total
  })

  test('shows all players in the leaderboard', () => {
    render(<ResultsScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 5 }],
      [{ id: 2, name: 'Bob', points: 8 }]
    )} />)
    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByText('Bob')).toBeTruthy()
  })

  test('"New game" button emits new-game', () => {
    render(<ResultsScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 5 }],
      [{ id: 2, name: 'Bob', points: 3 }]
    )} />)
    fireEvent.click(screen.getByRole('button', { name: /Нова гра/ }))
    expect(mockEmit).toHaveBeenCalledWith('new-game')
  })
})
