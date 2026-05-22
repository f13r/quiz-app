import type { GameState, DeriveResultsOutput, RankedPlayer } from './types.js'

export function deriveResults(state: GameState): DeriveResultsOutput {
  const blueTotal = state.teams.blue.players.reduce((sum, p) => sum + p.points, 0)
  const yellowTotal = state.teams.yellow.players.reduce((sum, p) => sum + p.points, 0)
  const winner = blueTotal > yellowTotal ? 'blue' as const
    : yellowTotal > blueTotal ? 'yellow' as const
    : 'draw' as const
  const rankedPlayers: readonly RankedPlayer[] = [
    ...state.teams.blue.players.map((p): RankedPlayer => ({ ...p, team: 'blue' })),
    ...state.teams.yellow.players.map((p): RankedPlayer => ({ ...p, team: 'yellow' }))
  ].sort((a, b) => b.points - a.points)
  return { blueTotal, yellowTotal, winner, rankedPlayers }
}
