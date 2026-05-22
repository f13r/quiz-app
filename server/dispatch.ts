import type { GameState, ClientToServerEvents } from '../shared/types.js'
import { addPlayer, startGame, markCorrect, markWrong, nextCard, undo, endGame, newGame } from './gameState.js'

export interface DispatchResult {
  readonly state: GameState
  readonly lastState: GameState | null
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

export function dispatch(
  state: GameState,
  lastState: GameState | null,
  event: keyof ClientToServerEvents,
  payload?: unknown
): DispatchResult {
  const noChange: DispatchResult = { state, lastState }

  switch (event) {
    // claim-host and request-state are handled directly by the server (side-effects, not state transitions)
    case 'claim-host':
    case 'request-state':
      return noChange

    case 'add-player': {
      if (!isRecord(payload)) return noChange
      const { team, name } = payload
      if (team !== 'blue' && team !== 'yellow') return noChange
      if (typeof name !== 'string' || !name.trim()) return noChange
      const next = addPlayer(state, team, name.trim())
      if (next === state) return noChange
      return { state: next, lastState: null }
    }

    case 'start-game': {
      const next = startGame(state)
      if (next === state) return noChange
      return { state: next, lastState: null }
    }

    case 'mark-correct': {
      if (!isRecord(payload) || typeof payload.playerId !== 'number') return noChange
      const next = markCorrect(state, payload.playerId)
      if (next === state) return noChange
      return { state: { ...next, canUndo: true }, lastState: state }
    }

    case 'mark-wrong': {
      const next = markWrong(state)
      if (next === state) return noChange
      return { state: { ...next, canUndo: true }, lastState: state }
    }

    case 'next-card': {
      const next = nextCard(state)
      if (next === state) return noChange
      return { state: { ...next, canUndo: true }, lastState: state }
    }

    case 'undo': {
      const next = undo(state, lastState)
      if (next === state) return noChange
      return { state: { ...next, canUndo: false }, lastState: null }
    }

    case 'end-game': {
      const next = endGame(state)
      if (next === state) return noChange
      return { state: next, lastState: null }
    }

    case 'new-game': {
      const next = newGame(state)
      if (next === state) return noChange
      return { state: next, lastState: null }
    }

    default:
      return noChange
  }
}
