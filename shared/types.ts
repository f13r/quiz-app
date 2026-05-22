export type TeamColor = 'blue' | 'yellow'
export type GamePhase = 'setup' | 'playing' | 'ended'

export interface Player {
  readonly id: number
  readonly name: string
  readonly points: number
}

export interface Team {
  readonly players: readonly Player[]
}

export interface GameState {
  readonly gamePhase: GamePhase
  readonly teams: Readonly<Record<TeamColor, Team>>
  readonly cardOwner: TeamColor
  readonly activeTeam: TeamColor
  readonly questionIndex: number
  readonly questionCounter: number
  readonly isStealing: boolean
  readonly cardComplete: boolean
  readonly canUndo: boolean
  readonly nextPlayerId: number
}

export interface RankedPlayer extends Player {
  readonly team: TeamColor
}

export interface DeriveResultsOutput {
  readonly blueTotal: number
  readonly yellowTotal: number
  readonly winner: TeamColor | 'draw'
  readonly rankedPlayers: readonly RankedPlayer[]
}

export interface ServerToClientEvents {
  'game-state': (state: GameState) => void
  'host-status': (isHost: boolean) => void
}

export interface ClientToServerEvents {
  'request-state': () => void
  'claim-host': () => void
  'add-player': (payload: { team: TeamColor; name: string }) => void
  'start-game': () => void
  'mark-correct': (payload: { playerId: number }) => void
  'mark-wrong': () => void
  'next-card': () => void
  'undo': () => void
  'end-game': () => void
  'new-game': () => void
}
