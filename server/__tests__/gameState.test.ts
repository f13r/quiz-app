import { describe, test, expect } from 'vitest'
import {
  createGame, addPlayer, startGame,
  markCorrect, markWrong, nextCard, undo, endGame, newGame
} from '../gameState.js'
import { deriveResults } from '../../shared/deriveResults.js'
import type { GameState } from '../../shared/types.js'


function twoPlayerGame(): GameState {
  let s = createGame()
  s = addPlayer(s, 'blue', 'Олена')
  s = addPlayer(s, 'yellow', 'Іван')
  return startGame(s)
}

describe('createGame', () => {
  test('returns setup phase with empty teams', () => {
    const s = createGame()
    expect(s.gamePhase).toBe('setup')
    expect(s.teams.blue.players).toEqual([])
    expect(s.teams.yellow.players).toEqual([])
  })
})

describe('addPlayer', () => {
  test('adds named player with 0 points to specified team', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    expect(s.teams.blue.players.length).toBe(1)
    expect(s.teams.blue.players[0].name).toBe('Олена')
    expect(s.teams.blue.players[0].points).toBe(0)
    expect(typeof s.teams.blue.players[0].id).toBe('number')
  })

  test('assigns unique IDs across teams', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    const ids = [
      s.teams.blue.players[0].id,
      s.teams.yellow.players[0].id
    ]
    expect(new Set(ids).size).toBe(2)
  })
})

describe('startGame', () => {
  test('transitions to playing with blue as first card owner', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    s = startGame(s)
    expect(s.gamePhase).toBe('playing')
    expect(s.cardOwner).toBe('blue')
    expect(s.activeTeam).toBe('blue')
    expect(s.questionIndex).toBe(0)
    expect(s.questionCounter).toBe(1)
    expect(s.isStealing).toBe(false)
    expect(s.cardComplete).toBe(false)
  })
})

describe('markCorrect', () => {
  test('awards 1 point to the selected player', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const next = markCorrect(s, pid)
    expect(next.teams.blue.players[0].points).toBe(1)
  })

  test('advances to next question and increments counter', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const next = markCorrect(s, pid)
    expect(next.questionIndex).toBe(1)
    expect(next.questionCounter).toBe(2)
    expect(next.isStealing).toBe(false)
    expect(next.activeTeam).toBe('blue')
  })

  test('sets cardComplete after Q4 and increments counter', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    expect(s.cardComplete).toBe(true)
    expect(s.questionIndex).toBe(3)
    expect(s.questionCounter).toBe(5)
    expect(s.teams.blue.players[0].points).toBe(4)
  })

  test('awards point to stealing team when steal is correct', () => {
    let s = twoPlayerGame()
    s = markWrong(s)
    const yellowPid = s.teams.yellow.players[0].id
    s = markCorrect(s, yellowPid)
    expect(s.teams.yellow.players[0].points).toBe(1)
    expect(s.teams.blue.players[0].points).toBe(0)
    expect(s.activeTeam).toBe('blue')
    expect(s.isStealing).toBe(false)
  })
})

describe('markWrong', () => {
  test('switches to steal mode for opposing team', () => {
    const s = twoPlayerGame()
    const next = markWrong(s)
    expect(next.isStealing).toBe(true)
    expect(next.activeTeam).toBe('yellow')
    expect(next.questionIndex).toBe(0)
    expect(next.questionCounter).toBe(1)
  })

  test('advances question when steal also fails, returns to card owner', () => {
    let s = twoPlayerGame()
    s = markWrong(s)
    s = markWrong(s)
    expect(s.isStealing).toBe(false)
    expect(s.activeTeam).toBe('blue')
    expect(s.questionIndex).toBe(1)
    expect(s.questionCounter).toBe(2)
  })

  test('sets cardComplete when Q4 steal also fails', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markWrong(s)
    s = markWrong(s)
    expect(s.cardComplete).toBe(true)
  })
})

describe('nextCard', () => {
  test('flips card owner and resets card state, keeps counter', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = nextCard(s)
    expect(s.cardOwner).toBe('yellow')
    expect(s.activeTeam).toBe('yellow')
    expect(s.questionIndex).toBe(0)
    expect(s.cardComplete).toBe(false)
    expect(s.isStealing).toBe(false)
    expect(s.questionCounter).toBe(5)
  })
})

describe('undo', () => {
  test('reverses to the provided previous state', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const before = s
    s = markCorrect(s, pid)
    expect(s.questionIndex).toBe(1)
    s = undo(s, before)
    expect(s.questionIndex).toBe(0)
    expect(s.teams.blue.players[0].points).toBe(0)
    expect(s.questionCounter).toBe(1)
  })

  test('reverses markWrong when previous state is provided', () => {
    let s = twoPlayerGame()
    const before = s
    s = markWrong(s)
    expect(s.isStealing).toBe(true)
    s = undo(s, before)
    expect(s.isStealing).toBe(false)
    expect(s.activeTeam).toBe('blue')
  })

  test('is a no-op when prev is null', () => {
    const s = twoPlayerGame()
    expect(undo(s, null)).toBe(s)
  })
})

describe('endGame', () => {
  test('transitions to ended phase', () => {
    const s = twoPlayerGame()
    expect(endGame(s).gamePhase).toBe('ended')
  })
})

describe('newGame', () => {
  test('returns a fresh setup state', () => {
    let s = twoPlayerGame()
    s = endGame(s)
    s = newGame(s)
    expect(s.gamePhase).toBe('setup')
    expect(s.teams.blue.players).toEqual([])
    expect(s.teams.yellow.players).toEqual([])
  })
})

describe('deriveResults', () => {
  function stateWithPoints(bluePoints: number[], yellowPoints: number[]): GameState {
    let s = createGame()
    bluePoints.forEach((_pts, i) => { s = addPlayer(s, 'blue', `Blue${i + 1}`) })
    yellowPoints.forEach((_pts, i) => { s = addPlayer(s, 'yellow', `Yellow${i + 1}`) })
    s = startGame(s)
    return {
      ...s,
      teams: {
        blue: { players: s.teams.blue.players.map((p, i) => ({ ...p, points: bluePoints[i] })) },
        yellow: { players: s.teams.yellow.players.map((p, i) => ({ ...p, points: yellowPoints[i] })) }
      }
    }
  }

  test('winner is blue when blue has more points', () => {
    expect(deriveResults(stateWithPoints([3, 2], [1, 1])).winner).toBe('blue')
  })

  test('winner is yellow when yellow has more points', () => {
    expect(deriveResults(stateWithPoints([1, 0], [3, 2])).winner).toBe('yellow')
  })

  test('winner is draw when scores are equal', () => {
    expect(deriveResults(stateWithPoints([2, 1], [2, 1])).winner).toBe('draw')
  })

  test('rankedPlayers are sorted descending by points', () => {
    const { rankedPlayers } = deriveResults(stateWithPoints([5, 1], [3, 2]))
    for (let i = 0; i < rankedPlayers.length - 1; i++) {
      expect(rankedPlayers[i].points).toBeGreaterThanOrEqual(rankedPlayers[i + 1].points)
    }
  })

  test('rankedPlayers include team property on each player', () => {
    const { rankedPlayers } = deriveResults(stateWithPoints([2], [3]))
    expect(rankedPlayers.every(p => p.team === 'blue' || p.team === 'yellow')).toBe(true)
  })

  test('blueTotal and yellowTotal correctly sum player points', () => {
    const { blueTotal, yellowTotal } = deriveResults(stateWithPoints([4, 2], [3, 1]))
    expect(blueTotal).toBe(6)
    expect(yellowTotal).toBe(4)
  })

  test('rankedPlayers includes all players when scores are tied', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'A')
    s = addPlayer(s, 'blue', 'B')
    s = addPlayer(s, 'yellow', 'C')
    s = addPlayer(s, 'yellow', 'D')
    s = startGame(s)
    s = {
      ...s,
      teams: {
        blue: { players: s.teams.blue.players.map(p => ({ ...p, points: 2 })) },
        yellow: { players: s.teams.yellow.players.map(p => ({ ...p, points: 2 })) }
      }
    }
    const { rankedPlayers } = deriveResults(s)
    expect(rankedPlayers.length).toBe(4)
    expect(rankedPlayers.every(p => p.points === 2)).toBe(true)
  })
})

describe('phase guard no-ops', () => {
  test('addPlayer during playing phase returns state unchanged', () => {
    const s = twoPlayerGame()
    expect(addPlayer(s, 'blue', 'Extra')).toBe(s)
  })

  test('startGame during playing phase returns state unchanged', () => {
    const s = twoPlayerGame()
    expect(startGame(s)).toBe(s)
  })

  test('startGame during setup with no blue players returns state unchanged', () => {
    let s = createGame()
    s = addPlayer(s, 'yellow', 'Іван')
    expect(startGame(s)).toBe(s)
  })

  test('startGame during setup with no yellow players returns state unchanged', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    expect(startGame(s)).toBe(s)
  })

  test('markCorrect during setup phase returns state unchanged', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    expect(markCorrect(s, s.teams.blue.players[0].id)).toBe(s)
  })

  test('markCorrect when cardComplete returns state unchanged', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    expect(markCorrect(s, pid)).toBe(s)
  })

  test('markWrong when cardComplete returns state unchanged', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    expect(markWrong(s)).toBe(s)
  })

  test('nextCard when cardComplete is false returns state unchanged', () => {
    const s = twoPlayerGame()
    expect(nextCard(s)).toBe(s)
  })

  test('undo during setup phase returns state unchanged', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    expect(undo(s, twoPlayerGame())).toBe(s)
  })

  test('endGame during setup phase returns state unchanged', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    expect(endGame(s)).toBe(s)
  })

  test('newGame during playing phase returns state unchanged', () => {
    const s = twoPlayerGame()
    expect(newGame(s)).toBe(s)
  })
})
