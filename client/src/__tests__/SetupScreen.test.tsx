import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SetupScreen from '../host/SetupScreen.js'
import type { GameState } from '../../../shared/types.js'

const mockEmit = vi.hoisted(() => vi.fn())
vi.mock('../socket.js', () => ({ default: { emit: mockEmit } }))

function makeState(
  bluePlayers: { id: number; name: string; points: number }[] = [],
  yellowPlayers: { id: number; name: string; points: number }[] = []
): GameState {
  return {
    gamePhase: 'setup',
    teams: { blue: { players: bluePlayers }, yellow: { players: yellowPlayers } },
    cardOwner: 'blue', activeTeam: 'blue',
    questionIndex: 0, questionCounter: 1,
    isStealing: false, cardComplete: false, canUndo: false, nextPlayerId: 1,
  }
}

describe('SetupScreen', () => {
  beforeEach(() => mockEmit.mockClear())
  afterEach(cleanup)

  test('start button is disabled when both teams are empty', () => {
    render(<SetupScreen gameState={makeState()} />)
    expect((screen.getByRole('button', { name: /Почати гру/ }) as HTMLButtonElement).disabled).toBe(true)
  })

  test('start button is disabled when only blue team has players', () => {
    render(<SetupScreen gameState={makeState([{ id: 1, name: 'Alice', points: 0 }])} />)
    expect((screen.getByRole('button', { name: /Почати гру/ }) as HTMLButtonElement).disabled).toBe(true)
  })

  test('start button is enabled when both teams have players', () => {
    render(<SetupScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 0 }],
      [{ id: 2, name: 'Bob', points: 0 }]
    )} />)
    expect((screen.getByRole('button', { name: /Почати гру/ }) as HTMLButtonElement).disabled).toBe(false)
  })

  test('clicking start emits start-game', () => {
    render(<SetupScreen gameState={makeState(
      [{ id: 1, name: 'Alice', points: 0 }],
      [{ id: 2, name: 'Bob', points: 0 }]
    )} />)
    fireEvent.click(screen.getByRole('button', { name: /Почати гру/ }))
    expect(mockEmit).toHaveBeenCalledWith('start-game')
  })

  test('add button emits add-player for blue team', () => {
    render(<SetupScreen gameState={makeState()} />)
    const [blueInput] = screen.getAllByPlaceholderText("Ім'я гравця")
    fireEvent.change(blueInput, { target: { value: 'Alice' } })
    fireEvent.click(screen.getAllByRole('button', { name: /Додати/ })[0])
    expect(mockEmit).toHaveBeenCalledWith('add-player', { team: 'blue', name: 'Alice' })
  })

  test('add button emits add-player for yellow team', () => {
    render(<SetupScreen gameState={makeState()} />)
    const [, yellowInput] = screen.getAllByPlaceholderText("Ім'я гравця")
    fireEvent.change(yellowInput, { target: { value: 'Bob' } })
    fireEvent.click(screen.getAllByRole('button', { name: /Додати/ })[1])
    expect(mockEmit).toHaveBeenCalledWith('add-player', { team: 'yellow', name: 'Bob' })
  })

  test('does not emit when input is empty', () => {
    render(<SetupScreen gameState={makeState()} />)
    fireEvent.click(screen.getAllByRole('button', { name: /Додати/ })[0])
    expect(mockEmit).not.toHaveBeenCalled()
  })

  test('trims whitespace from player name before emitting', () => {
    render(<SetupScreen gameState={makeState()} />)
    const [blueInput] = screen.getAllByPlaceholderText("Ім'я гравця")
    fireEvent.change(blueInput, { target: { value: '  Alice  ' } })
    fireEvent.click(screen.getAllByRole('button', { name: /Додати/ })[0])
    expect(mockEmit).toHaveBeenCalledWith('add-player', { team: 'blue', name: 'Alice' })
  })

  test('pressing Enter in blue input adds the player', () => {
    render(<SetupScreen gameState={makeState()} />)
    const [blueInput] = screen.getAllByPlaceholderText("Ім'я гравця")
    fireEvent.change(blueInput, { target: { value: 'Alice' } })
    fireEvent.keyDown(blueInput, { key: 'Enter' })
    expect(mockEmit).toHaveBeenCalledWith('add-player', { team: 'blue', name: 'Alice' })
  })
})
