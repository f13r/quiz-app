import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  createGame, addPlayer, startGame,
  markCorrect, markWrong, nextCard, undo, endGame, newGame
} from '../gameState.js'

function twoPlayerGame() {
  let s = createGame()
  s = addPlayer(s, 'blue', 'Олена')
  s = addPlayer(s, 'yellow', 'Іван')
  return startGame(s)
}

describe('createGame', () => {
  test('returns setup phase with empty teams', () => {
    const s = createGame()
    assert.equal(s.gamePhase, 'setup')
    assert.deepEqual(s.teams.blue.players, [])
    assert.deepEqual(s.teams.yellow.players, [])
  })
})

describe('addPlayer', () => {
  test('adds named player with 0 points to specified team', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    assert.equal(s.teams.blue.players.length, 1)
    assert.equal(s.teams.blue.players[0].name, 'Олена')
    assert.equal(s.teams.blue.players[0].points, 0)
    assert.equal(typeof s.teams.blue.players[0].id, 'number')
  })

  test('assigns unique IDs across teams', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    const ids = [
      s.teams.blue.players[0].id,
      s.teams.yellow.players[0].id
    ]
    assert.equal(new Set(ids).size, 2)
  })
})

describe('startGame', () => {
  test('transitions to playing with blue as first card owner', () => {
    let s = createGame()
    s = addPlayer(s, 'blue', 'Олена')
    s = addPlayer(s, 'yellow', 'Іван')
    s = startGame(s)
    assert.equal(s.gamePhase, 'playing')
    assert.equal(s.cardOwner, 'blue')
    assert.equal(s.activeTeam, 'blue')
    assert.equal(s.questionIndex, 0)
    assert.equal(s.questionCounter, 1)
    assert.equal(s.isStealing, false)
    assert.equal(s.cardComplete, false)
  })
})

describe('markCorrect', () => {
  test('awards 1 point to the selected player', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const next = markCorrect(s, pid)
    assert.equal(next.teams.blue.players[0].points, 1)
  })

  test('advances to next question and increments counter', () => {
    const s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    const next = markCorrect(s, pid)
    assert.equal(next.questionIndex, 1)
    assert.equal(next.questionCounter, 2)
    assert.equal(next.isStealing, false)
    assert.equal(next.activeTeam, 'blue')
  })

  test('sets cardComplete after Q4 and increments counter', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid) // Q1→Q2
    s = markCorrect(s, pid) // Q2→Q3
    s = markCorrect(s, pid) // Q3→Q4
    s = markCorrect(s, pid) // Q4→complete
    assert.equal(s.cardComplete, true)
    assert.equal(s.questionIndex, 3)
    assert.equal(s.questionCounter, 5) // pointing to Q1 of next card
    assert.equal(s.teams.blue.players[0].points, 4)
  })

  test('awards point to stealing team when steal is correct', () => {
    let s = twoPlayerGame()
    s = markWrong(s) // blue wrong, yellow steals
    const yellowPid = s.teams.yellow.players[0].id
    s = markCorrect(s, yellowPid)
    assert.equal(s.teams.yellow.players[0].points, 1)
    assert.equal(s.teams.blue.players[0].points, 0)
    assert.equal(s.activeTeam, 'blue') // returns to card owner
    assert.equal(s.isStealing, false)
  })
})

describe('markWrong', () => {
  test('switches to steal mode for opposing team', () => {
    const s = twoPlayerGame()
    const next = markWrong(s)
    assert.equal(next.isStealing, true)
    assert.equal(next.activeTeam, 'yellow')
    assert.equal(next.questionIndex, 0) // same question, not advanced
    assert.equal(next.questionCounter, 1) // counter unchanged during steal setup
  })

  test('advances question when steal also fails, returns to card owner', () => {
    let s = twoPlayerGame()
    s = markWrong(s) // blue wrong
    s = markWrong(s) // yellow wrong (steal failed)
    assert.equal(s.isStealing, false)
    assert.equal(s.activeTeam, 'blue')
    assert.equal(s.questionIndex, 1)
    assert.equal(s.questionCounter, 2)
  })

  test('sets cardComplete when Q4 steal also fails', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid) // Q1
    s = markCorrect(s, pid) // Q2
    s = markCorrect(s, pid) // Q3
    s = markWrong(s)        // Q4 blue wrong
    s = markWrong(s)        // Q4 yellow wrong → complete
    assert.equal(s.cardComplete, true)
  })
})

describe('nextCard', () => {
  test('flips card owner and resets card state, keeps counter', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid)
    s = markCorrect(s, pid) // Q4 → cardComplete, counter = 5
    s = nextCard(s)
    assert.equal(s.cardOwner, 'yellow')
    assert.equal(s.activeTeam, 'yellow')
    assert.equal(s.questionIndex, 0)
    assert.equal(s.cardComplete, false)
    assert.equal(s.isStealing, false)
    assert.equal(s.questionCounter, 5) // unchanged by nextCard
  })
})

describe('undo', () => {
  test('reverses the last markCorrect', () => {
    let s = twoPlayerGame()
    const pid = s.teams.blue.players[0].id
    s = markCorrect(s, pid)
    assert.equal(s.questionIndex, 1)
    s = undo(s)
    assert.equal(s.questionIndex, 0)
    assert.equal(s.teams.blue.players[0].points, 0)
    assert.equal(s.questionCounter, 1)
  })

  test('reverses markWrong (steal setup)', () => {
    let s = twoPlayerGame()
    s = markWrong(s)
    assert.equal(s.isStealing, true)
    s = undo(s)
    assert.equal(s.isStealing, false)
    assert.equal(s.activeTeam, 'blue')
  })

  test('is a no-op when there is nothing to undo', () => {
    const s = twoPlayerGame()
    const same = undo(s)
    assert.strictEqual(same, s)
  })
})

describe('endGame', () => {
  test('transitions to ended phase', () => {
    const s = twoPlayerGame()
    const ended = endGame(s)
    assert.equal(ended.gamePhase, 'ended')
  })
})

describe('newGame', () => {
  test('returns a fresh setup state', () => {
    let s = twoPlayerGame()
    s = endGame(s)
    s = newGame()
    assert.equal(s.gamePhase, 'setup')
    assert.deepEqual(s.teams.blue.players, [])
    assert.deepEqual(s.teams.yellow.players, [])
  })
})
