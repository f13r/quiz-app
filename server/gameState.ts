import type { GameState, TeamColor, Player } from '../shared/types.js'

function opposite(team: TeamColor): TeamColor {
  return team === 'blue' ? 'yellow' : 'blue'
}

function advance(state: GameState): Pick<GameState, 'questionIndex' | 'cardComplete' | 'questionCounter'> {
  if (state.questionIndex === 3) {
    return { questionIndex: state.questionIndex, cardComplete: true, questionCounter: state.questionCounter + 1 }
  }
  return {
    questionIndex: state.questionIndex + 1,
    cardComplete: false,
    questionCounter: state.questionCounter + 1
  }
}

export function createGame(): GameState {
  return {
    gamePhase: 'setup',
    teams: { blue: { players: [] }, yellow: { players: [] } },
    cardOwner: 'blue',
    activeTeam: 'blue',
    questionIndex: 0,
    questionCounter: 1,
    isStealing: false,
    cardComplete: false,
    canUndo: false,
    nextPlayerId: 1
  }
}

export function addPlayer(state: GameState, team: TeamColor, name: string): GameState {
  if (state.gamePhase !== 'setup') return state
  const player: Player = { id: state.nextPlayerId, name, points: 0 }
  return {
    ...state,
    teams: {
      ...state.teams,
      [team]: { players: [...state.teams[team].players, player] }
    } as GameState['teams'],
    canUndo: false,
    nextPlayerId: state.nextPlayerId + 1
  }
}

export function startGame(state: GameState): GameState {
  if (state.gamePhase !== 'setup') return state
  if (!state.teams.blue.players.length || !state.teams.yellow.players.length) return state
  return {
    ...state,
    gamePhase: 'playing',
    cardOwner: 'blue',
    activeTeam: 'blue',
    questionIndex: 0,
    questionCounter: 1,
    isStealing: false,
    cardComplete: false,
    canUndo: false
  }
}

export function markCorrect(state: GameState, playerId: number): GameState {
  if (state.gamePhase !== 'playing' || state.cardComplete) return state
  const team = state.activeTeam
  if (!state.teams[team].players.some(p => p.id === playerId)) return state
  const updatedPlayers = state.teams[team].players.map(p =>
    p.id === playerId ? { ...p, points: p.points + 1 } : p
  )
  return {
    ...state,
    ...advance(state),
    teams: {
      ...state.teams,
      [team]: { players: updatedPlayers }
    } as GameState['teams'],
    isStealing: false,
    activeTeam: state.cardOwner,
  }
}

export function markWrong(state: GameState): GameState {
  if (state.gamePhase !== 'playing' || state.cardComplete) return state

  if (!state.isStealing) {
    return {
      ...state,
      isStealing: true,
      activeTeam: opposite(state.cardOwner),
    }
  }

  return {
    ...state,
    ...advance(state),
    isStealing: false,
    activeTeam: state.cardOwner,
  }
}

export function nextCard(state: GameState): GameState {
  if (state.gamePhase !== 'playing' || !state.cardComplete) return state
  const newOwner = opposite(state.cardOwner)
  return {
    ...state,
    cardOwner: newOwner,
    activeTeam: newOwner,
    questionIndex: 0,
    isStealing: false,
    cardComplete: false,
  }
}

export function undo(state: GameState, prev: GameState | null): GameState {
  if (state.gamePhase !== 'playing') return state
  if (!prev) return state
  return prev
}

export function endGame(state: GameState): GameState {
  if (state.gamePhase !== 'playing') return state
  return { ...state, gamePhase: 'ended', canUndo: false }
}

export function newGame(state: GameState): GameState {
  if (state.gamePhase !== 'ended') return state
  return createGame()
}
