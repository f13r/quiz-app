function opposite(team) {
  return team === 'blue' ? 'yellow' : 'blue'
}

function saveForUndo(state) {
  const { lastState, ...rest } = state
  return { ...rest, lastState: null }
}

function advance(state) {
  if (state.questionIndex === 3) {
    return { cardComplete: true, questionCounter: state.questionCounter + 1 }
  }
  return {
    questionIndex: state.questionIndex + 1,
    questionCounter: state.questionCounter + 1
  }
}

export function createGame() {
  return {
    gamePhase: 'setup',
    teams: { blue: { players: [] }, yellow: { players: [] } },
    cardOwner: 'blue',
    activeTeam: 'blue',
    questionIndex: 0,
    questionCounter: 1,
    isStealing: false,
    cardComplete: false,
    lastState: null,
    nextPlayerId: 1
  }
}

export function addPlayer(state, team, name) {
  if (state.gamePhase !== 'setup') return state
  const player = { id: state.nextPlayerId, name, points: 0 }
  return {
    ...state,
    teams: {
      ...state.teams,
      [team]: { players: [...state.teams[team].players, player] }
    },
    nextPlayerId: state.nextPlayerId + 1
  }
}

export function startGame(state) {
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
    lastState: null
  }
}

export function markCorrect(state, playerId) {
  if (state.gamePhase !== 'playing' || state.cardComplete) return state
  const team = state.activeTeam
  if (!state.teams[team].players.some(p => p.id === playerId)) return state
  const prev = saveForUndo(state)
  const updatedPlayers = state.teams[team].players.map(p =>
    p.id === playerId ? { ...p, points: p.points + 1 } : p
  )
  return {
    ...state,
    ...advance(state),
    teams: { ...state.teams, [team]: { players: updatedPlayers } },
    isStealing: false,
    activeTeam: state.cardOwner,
    lastState: prev
  }
}

export function markWrong(state) {
  if (state.gamePhase !== 'playing' || state.cardComplete) return state
  const prev = saveForUndo(state)

  if (!state.isStealing) {
    return {
      ...state,
      isStealing: true,
      activeTeam: opposite(state.cardOwner),
      lastState: prev
    }
  }

  return {
    ...state,
    ...advance(state),
    isStealing: false,
    activeTeam: state.cardOwner,
    lastState: prev
  }
}

export function nextCard(state) {
  if (state.gamePhase !== 'playing' || !state.cardComplete) return state
  const prev = saveForUndo(state)
  const newOwner = opposite(state.cardOwner)
  return {
    ...state,
    cardOwner: newOwner,
    activeTeam: newOwner,
    questionIndex: 0,
    isStealing: false,
    cardComplete: false,
    lastState: prev
  }
}

export function undo(state) {
  if (state.gamePhase !== 'playing') return state
  if (!state.lastState) return state
  return state.lastState
}

export function endGame(state) {
  if (state.gamePhase !== 'playing') return state
  return { ...state, gamePhase: 'ended' }
}

export function newGame(state) {
  if (state.gamePhase !== 'ended') return state
  return createGame()
}

export function deriveResults(state) {
  if (!state?.teams?.blue?.players || !state?.teams?.yellow?.players) {
    return { blueTotal: 0, yellowTotal: 0, winner: 'draw', rankedPlayers: [] }
  }
  const blueTotal = state.teams.blue.players.reduce((sum, p) => sum + p.points, 0)
  const yellowTotal = state.teams.yellow.players.reduce((sum, p) => sum + p.points, 0)
  const winner = blueTotal > yellowTotal ? 'blue' : yellowTotal > blueTotal ? 'yellow' : 'draw'
  const rankedPlayers = [
    ...state.teams.blue.players.map(p => ({ ...p, team: 'blue' })),
    ...state.teams.yellow.players.map(p => ({ ...p, team: 'yellow' }))
  ].sort((a, b) => b.points - a.points)
  return { blueTotal, yellowTotal, winner, rankedPlayers }
}
