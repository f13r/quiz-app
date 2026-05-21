export function deriveResults(state) {
  const blueTotal = state.teams.blue.players.reduce((sum, p) => sum + p.points, 0)
  const yellowTotal = state.teams.yellow.players.reduce((sum, p) => sum + p.points, 0)
  const winner = blueTotal > yellowTotal ? 'blue' : yellowTotal > blueTotal ? 'yellow' : 'draw'
  const rankedPlayers = [
    ...state.teams.blue.players.map(p => ({ ...p, team: 'blue' })),
    ...state.teams.yellow.players.map(p => ({ ...p, team: 'yellow' }))
  ].sort((a, b) => b.points - a.points)
  return { blueTotal, yellowTotal, winner, rankedPlayers }
}
