import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import GameScreen from '../host/GameScreen.jsx'
import type { GameState } from '../../../shared/types.js'

const mockEmit = vi.hoisted(() => vi.fn())
vi.mock('../socket.js', () => ({ default: { emit: mockEmit } }))

const BASE_STATE: GameState = {
  gamePhase: 'playing',
  teams: {
    blue: { players: [{ id: 1, name: 'Alice', points: 3 }, { id: 2, name: 'Bob', points: 1 }] },
    yellow: { players: [{ id: 3, name: 'Carol', points: 2 }] },
  },
  cardOwner: 'blue', activeTeam: 'blue',
  questionIndex: 0, questionCounter: 1,
  isStealing: false, cardComplete: false, canUndo: false, nextPlayerId: 4,
}

function make(overrides: Partial<GameState> = {}): GameState {
  return { ...BASE_STATE, ...overrides }
}

describe('GameScreen', () => {
  beforeEach(() => mockEmit.mockClear())
  afterEach(cleanup)

  test('"Correct" button is disabled when no player is selected', () => {
    render(<GameScreen gameState={make()} />)
    expect((screen.getByRole('button', { name: /Правильно/ }) as HTMLButtonElement).disabled).toBe(true)
  })

  test('"Correct" button is enabled after selecting a player', () => {
    render(<GameScreen gameState={make()} />)
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect((screen.getByRole('button', { name: /Правильно/ }) as HTMLButtonElement).disabled).toBe(false)
  })

  test('clicking "Correct" emits mark-correct with the selected playerId', () => {
    render(<GameScreen gameState={make()} />)
    fireEvent.click(screen.getAllByRole('radio')[0]) // Alice, id=1
    fireEvent.click(screen.getByRole('button', { name: /Правильно/ }))
    expect(mockEmit).toHaveBeenCalledWith('mark-correct', { playerId: 1 })
  })

  test('clicking "Correct" uses the second selected player when changed', () => {
    render(<GameScreen gameState={make()} />)
    fireEvent.click(screen.getAllByRole('radio')[0]) // Alice
    fireEvent.click(screen.getAllByRole('radio')[1]) // Bob, id=2
    fireEvent.click(screen.getByRole('button', { name: /Правильно/ }))
    expect(mockEmit).toHaveBeenCalledWith('mark-correct', { playerId: 2 })
  })

  test('"Wrong" button emits mark-wrong', () => {
    render(<GameScreen gameState={make()} />)
    fireEvent.click(screen.getByRole('button', { name: /Неправильно/ }))
    expect(mockEmit).toHaveBeenCalledWith('mark-wrong')
  })

  test('"End game" button emits end-game', () => {
    render(<GameScreen gameState={make()} />)
    fireEvent.click(screen.getByRole('button', { name: /Завершити гру/ }))
    expect(mockEmit).toHaveBeenCalledWith('end-game')
  })

  test('undo button is not rendered when canUndo is false', () => {
    render(<GameScreen gameState={make({ canUndo: false })} />)
    expect(screen.queryByRole('button', { name: /Скасувати/ })).toBeNull()
  })

  test('undo button is rendered when canUndo is true', () => {
    render(<GameScreen gameState={make({ canUndo: true })} />)
    expect(screen.getByRole('button', { name: /Скасувати/ })).toBeTruthy()
  })

  test('clicking undo emits undo', () => {
    render(<GameScreen gameState={make({ canUndo: true })} />)
    fireEvent.click(screen.getByRole('button', { name: /Скасувати/ }))
    expect(mockEmit).toHaveBeenCalledWith('undo')
  })

  test('"Next card" button is shown when cardComplete is true', () => {
    render(<GameScreen gameState={make({ cardComplete: true })} />)
    expect(screen.getByRole('button', { name: /Наступна картка/ })).toBeTruthy()
  })

  test('clicking "Next card" emits next-card', () => {
    render(<GameScreen gameState={make({ cardComplete: true })} />)
    fireEvent.click(screen.getByRole('button', { name: /Наступна картка/ }))
    expect(mockEmit).toHaveBeenCalledWith('next-card')
  })

  test('steal badge is hidden when isStealing is false', () => {
    render(<GameScreen gameState={make({ isStealing: false })} />)
    expect(screen.queryByText(/Крадіжка/)).toBeNull()
  })

  test('steal badge is visible when isStealing is true', () => {
    render(<GameScreen gameState={make({ isStealing: true })} />)
    expect(screen.getByText(/Крадіжка/)).toBeTruthy()
  })
})
