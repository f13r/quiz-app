import { describe, test, expect } from 'vitest'
import { dispatch } from '../dispatch.js'
import { createGame, addPlayer, startGame, markCorrect, markWrong } from '../gameState.js'
import type { GameState } from '../../shared/types.js'

function twoPlayerGame(): GameState {
  let s = createGame()
  s = addPlayer(s, 'blue', 'Олена')
  s = addPlayer(s, 'yellow', 'Іван')
  return startGame(s)
}

describe('dispatch — add-player', () => {
  test('valid payload adds player', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'add-player', { team: 'blue', name: 'Олена' })
    expect(next.teams.blue.players.length).toBe(1)
  })

  test('trims whitespace from name', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'add-player', { team: 'blue', name: '  Олена  ' })
    expect(next.teams.blue.players[0].name).toBe('Олена')
  })

  test('invalid team returns state unchanged', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'add-player', { team: 'red', name: 'Олена' })
    expect(next).toBe(s)
  })

  test('empty name returns state unchanged', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'add-player', { team: 'blue', name: '' })
    expect(next).toBe(s)
  })

  test('whitespace-only name returns state unchanged', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'add-player', { team: 'blue', name: '   ' })
    expect(next).toBe(s)
  })

  test('non-object payload returns state unchanged', () => {
    const s = createGame()
    expect(dispatch(s, null, 'add-player', null).state).toBe(s)
    expect(dispatch(s, null, 'add-player', 'blue').state).toBe(s)
    expect(dispatch(s, null, 'add-player', undefined).state).toBe(s)
  })

  test('clears lastState — add-player is not undoable', () => {
    const s = createGame()
    const prev = createGame()
    const { lastState } = dispatch(s, prev, 'add-player', { team: 'blue', name: 'Олена' })
    expect(lastState).toBeNull()
  })
})

describe('dispatch — start-game', () => {
  test('transitions to playing with both teams populated', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    const { state: next } = dispatch(s, null, 'start-game')
    expect(next.gamePhase).toBe('playing')
  })

  test('no-op when teams are empty', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'start-game')
    expect(next).toBe(s)
  })

  test('clears lastState — start-game is not undoable', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    const prev = createGame()
    const { lastState } = dispatch(s, prev, 'start-game')
    expect(lastState).toBeNull()
  })
})

describe('dispatch — mark-correct', () => {
  test('awards point to the player', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const { state: next } = dispatch(s, null, 'mark-correct', { playerId: pid })
    expect(next.teams.blue.players[0].points).toBe(1)
  })

  test('sets canUndo and saves lastState', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const { state: next, lastState } = dispatch(s, null, 'mark-correct', { playerId: pid })
    expect(next.canUndo).toBe(true)
    expect(lastState).toBe(s)
  })

  test('unknown playerId returns state unchanged', () => {
    const s = twoPlayerGame()
    const { state: next } = dispatch(s, null, 'mark-correct', { playerId: 9999 })
    expect(next).toBe(s)
  })

  test('non-number playerId returns state unchanged', () => {
    const s = twoPlayerGame()
    expect(dispatch(s, null, 'mark-correct', { playerId: 'abc' }).state).toBe(s)
    expect(dispatch(s, null, 'mark-correct', { playerId: null }).state).toBe(s)
  })

  test('non-object payload returns state unchanged', () => {
    const s = twoPlayerGame()
    expect(dispatch(s, null, 'mark-correct', null).state).toBe(s)
    expect(dispatch(s, null, 'mark-correct', undefined).state).toBe(s)
  })
})

describe('dispatch — mark-wrong', () => {
  test('enters steal mode and sets canUndo', () => {
    const s = twoPlayerGame()
    const { state: next, lastState } = dispatch(s, null, 'mark-wrong')
    expect(next.isStealing).toBe(true)
    expect(next.canUndo).toBe(true)
    expect(lastState).toBe(s)
  })

  test('exits steal mode when already stealing', () => {
    const s = twoPlayerGame()
    const { state: stealing } = dispatch(s, null, 'mark-wrong')
    const { state: next } = dispatch(stealing, s, 'mark-wrong')
    expect(next.isStealing).toBe(false)
    expect(next.questionIndex).toBe(1)
  })
})

describe('dispatch — next-card', () => {
  test('flips card owner and sets canUndo', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    for (let i = 0; i < 4; i++) s = markCorrect(s, pid)
    const { state: next, lastState } = dispatch(s, null, 'next-card')
    expect(next.cardOwner).toBe('yellow')
    expect(next.canUndo).toBe(true)
    expect(lastState).toBe(s)
  })

  test('no-op when card is not complete', () => {
    const s = twoPlayerGame()
    const { state: next } = dispatch(s, null, 'next-card')
    expect(next).toBe(s)
  })
})

describe('dispatch — undo', () => {
  test('restores previous state and clears canUndo', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const { state: after, lastState: saved } = dispatch(s, null, 'mark-correct', { playerId: pid })
    const { state: restored, lastState: newLast } = dispatch(after, saved, 'undo')
    expect(restored.questionIndex).toBe(0)
    expect(restored.teams.blue.players[0].points).toBe(0)
    expect(restored.canUndo).toBe(false)
    expect(newLast).toBeNull()
  })

  test('no-op when lastState is null', () => {
    const s = twoPlayerGame()
    const { state: next } = dispatch(s, null, 'undo')
    expect(next).toBe(s)
  })

  test('canUndo is false after undo even when prior state had canUndo: true', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const { state: s1, lastState: l1 } = dispatch(s, null, 'mark-correct', { playerId: pid })
    const { state: s2, lastState: l2 } = dispatch(s1, l1, 'mark-correct', { playerId: pid })
    const { state: restored } = dispatch(s2, l2, 'undo')
    expect(restored.canUndo).toBe(false)
  })
})

describe('dispatch — end-game', () => {
  test('transitions to ended phase', () => {
    const s = twoPlayerGame()
    const { state: next } = dispatch(s, null, 'end-game')
    expect(next.gamePhase).toBe('ended')
  })

  test('clears lastState', () => {
    const s = twoPlayerGame()
    const prev = twoPlayerGame()
    const { lastState } = dispatch(s, prev, 'end-game')
    expect(lastState).toBeNull()
  })

  test('no-op during setup phase', () => {
    const s = createGame()
    const { state: next } = dispatch(s, null, 'end-game')
    expect(next).toBe(s)
  })
})

describe('dispatch — new-game', () => {
  test('returns fresh setup state after game ends', () => {
    let s = twoPlayerGame()
    const { state: ended } = dispatch(s, null, 'end-game')
    const { state: fresh } = dispatch(ended, null, 'new-game')
    expect(fresh.gamePhase).toBe('setup')
    expect(fresh.teams.blue.players).toEqual([])
  })

  test('no-op during playing phase', () => {
    const s = twoPlayerGame()
    const { state: next } = dispatch(s, null, 'new-game')
    expect(next).toBe(s)
  })
})

describe('dispatch — request-state', () => {
  test('always returns state unchanged', () => {
    const s = twoPlayerGame()
    const { state: next } = dispatch(s, null, 'request-state')
    expect(next).toBe(s)
  })
})
