function teamTotal(players) {
  return players.reduce((sum, p) => sum + p.points, 0)
}

function top3(teams) {
  return [
    ...teams.blue.players.map(p => ({ ...p, team: 'blue' })),
    ...teams.yellow.players.map(p => ({ ...p, team: 'yellow' }))
  ]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
}

export default function DashboardScreen({ gameState }) {
  const { teams, cardOwner, activeTeam, questionIndex, isStealing, questionCounter } = gameState
  const blueTotal = teamTotal(teams.blue.players)
  const yellowTotal = teamTotal(teams.yellow.players)
  const leaders = top3(teams)

  const isBlue = activeTeam === 'blue'
  const cardOwnerLabel = cardOwner === 'blue' ? 'Синя' : 'Жовта'
  const activeTeamLabel = activeTeam === 'blue' ? 'Синя' : 'Жовта'

  const turnText = isStealing
    ? `🔥 ${activeTeamLabel} краде питання #${questionCounter}!`
    : `${cardOwnerLabel} картка — питання ${questionIndex + 1} з 4`

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0F2260',
      color: 'white',
      fontFamily: 'Nunito, sans-serif',
      padding: 24,
      gap: 20
    }}>
      {/* Team scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
        <div style={{
          background: isBlue && !isStealing ? '#1A3A8C' : 'rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '20px 16px',
          textAlign: 'center',
          transition: 'background 0.4s',
          border: isBlue && !isStealing ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent'
        }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8, opacity: 0.8 }}>
            🔵 Синя
          </div>
          <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1 }}>{blueTotal}</div>
        </div>

        <div style={{ fontWeight: 900, fontSize: '1.5rem', opacity: 0.4 }}>VS</div>

        <div style={{
          background: !isBlue && !isStealing ? '#F5C800' : 'rgba(255,255,255,0.07)',
          color: !isBlue && !isStealing ? '#1A1A1A' : 'white',
          borderRadius: 16,
          padding: '20px 16px',
          textAlign: 'center',
          transition: 'background 0.4s, color 0.4s',
          border: !isBlue && !isStealing ? '3px solid rgba(0,0,0,0.2)' : '3px solid transparent'
        }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8, opacity: 0.8 }}>
            🟡 Жовта
          </div>
          <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1 }}>{yellowTotal}</div>
        </div>
      </div>

      {/* Turn indicator */}
      <div style={{
        background: isBlue ? '#1A3A8C' : '#F5C800',
        color: isBlue ? 'white' : '#1A1A1A',
        borderRadius: 12,
        padding: '14px 20px',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: '1.1rem',
        transition: 'background 0.4s'
      }}>
        {turnText}
      </div>

      {/* Top 3 */}
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: 12, opacity: 0.7, fontSize: '1rem' }}>ТОП ГРАВЦІ</h3>
        {leaders.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            marginBottom: 8,
            borderRadius: 12,
            background: p.team === 'blue' ? 'rgba(26,58,140,0.6)' : 'rgba(245,200,0,0.25)',
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>
            <span style={{ fontSize: '1.3rem' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </span>
            <span style={{ flex: 1 }}>{p.name}</span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>{p.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
