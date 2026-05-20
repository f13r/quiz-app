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
  const prev = saveForUndo(state)
  const team = state.activeTeam
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
  if (!state.lastState) return state
  return state.lastState
}

export function endGame(state) {
  return { ...state, gamePhase: 'ended', lastState: saveForUndo(state) }
}

export function newGame() {
  return createGame()
}
