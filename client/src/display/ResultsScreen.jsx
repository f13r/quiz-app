function teamTotal(players) {
  return players.reduce((sum, p) => sum + p.points, 0)
}

function allPlayersSorted(teams) {
  return [
    ...teams.blue.players.map(p => ({ ...p, team: 'blue' })),
    ...teams.yellow.players.map(p => ({ ...p, team: 'yellow' }))
  ].sort((a, b) => b.points - a.points)
}

export default function ResultsScreen({ gameState }) {
  const { teams } = gameState
  const blueTotal = teamTotal(teams.blue.players)
  const yellowTotal = teamTotal(teams.yellow.players)
  const sorted = allPlayersSorted(teams)

  const winner = blueTotal > yellowTotal ? 'blue'
    : yellowTotal > blueTotal ? 'yellow'
    : 'draw'

  const winnerText = winner === 'blue' ? '🏆 Синя команда перемогла!'
    : winner === 'yellow' ? '🏆 Жовта команда перемогла!'
    : '🤝 Нічия!'

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0F2260',
      color: 'white',
      fontFamily: 'Nunito, sans-serif',
      padding: 32,
      gap: 24
    }}>
      <div style={{
        background: winner === 'yellow' ? '#F5C800' : 'rgba(255,255,255,0.12)',
        color: winner === 'yellow' ? '#1A1A1A' : 'white',
        borderRadius: 20,
        padding: '28px 24px',
        textAlign: 'center',
        fontWeight: 900,
        fontSize: '2rem'
      }}>
        {winnerText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(26,58,140,0.7)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Синя команда</div>
          <div style={{ fontSize: '4rem', fontWeight: 900 }}>{blueTotal}</div>
        </div>
        <div style={{ background: '#F5C800', borderRadius: 16, padding: 20, textAlign: 'center', color: '#1A1A1A' }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Жовта команда</div>
          <div style={{ fontSize: '4rem', fontWeight: 900 }}>{yellowTotal}</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: 12, opacity: 0.7, fontSize: '1rem', letterSpacing: '0.05em' }}>
          ТАБЛИЦЯ ЛІДЕРІВ
        </h3>
        {sorted.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            marginBottom: 8,
            borderRadius: 12,
            background: p.team === 'blue' ? 'rgba(26,58,140,0.6)' : 'rgba(245,200,0,0.2)',
            fontWeight: 700,
            fontSize: '1.15rem'
          }}>
            <span style={{ minWidth: 28, opacity: 0.6 }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{p.name}</span>
            <span style={{ fontWeight: 900 }}>{p.points} очок</span>
          </div>
        ))}
      </div>
    </div>
  )
}
