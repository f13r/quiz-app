import { deriveResults } from '../deriveResults'

export default function DashboardScreen({ gameState }) {
  const { teams, cardOwner, activeTeam, questionIndex, isStealing, questionCounter } = gameState
  const { blueTotal, yellowTotal, rankedPlayers } = deriveResults(gameState)
  const leaders = rankedPlayers.slice(0, 3)

  const isBlue = activeTeam === 'blue'
  const cardOwnerLabel = cardOwner === 'blue' ? 'Синя' : 'Жовта'
  const activeTeamLabel = activeTeam === 'blue' ? 'Синя' : 'Жовта'

  const turnText = isStealing
    ? `🔥 ${activeTeamLabel} краде питання #${questionCounter}!`
    : `${cardOwnerLabel} картка — питання ${questionIndex + 1} з 4`

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0F2260',
      color: 'white',
      fontFamily: 'Nunito, sans-serif',
      padding: '3vh 4vw',
      gap: '2vh',
      overflow: 'hidden'
    }}>
      {/* Team scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '3vw',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{
          background: isBlue && !isStealing ? '#1A3A8C' : 'rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '2.5vh 3vw',
          textAlign: 'center',
          transition: 'background 0.4s',
          border: isBlue && !isStealing ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent'
        }}>
          <div style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2.8vh, 2.2rem)', marginBottom: '1vh', opacity: 0.8 }}>
            Синя команда
          </div>
          <div style={{ fontSize: 'clamp(5rem, 20vh, 22rem)', fontWeight: 900, lineHeight: 1 }}>
            {blueTotal}
          </div>
        </div>

        <div style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 4vh, 4rem)', opacity: 0.35 }}>VS</div>

        <div style={{
          background: !isBlue && !isStealing ? '#F5C800' : 'rgba(255,255,255,0.07)',
          color: !isBlue && !isStealing ? '#1A1A1A' : 'white',
          borderRadius: 20,
          padding: '2.5vh 3vw',
          textAlign: 'center',
          transition: 'background 0.4s, color 0.4s',
          border: !isBlue && !isStealing ? '3px solid rgba(0,0,0,0.2)' : '3px solid transparent'
        }}>
          <div style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2.8vh, 2.2rem)', marginBottom: '1vh', opacity: 0.8 }}>
            Жовта команда
          </div>
          <div style={{ fontSize: 'clamp(5rem, 20vh, 22rem)', fontWeight: 900, lineHeight: 1 }}>
            {yellowTotal}
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div style={{
        background: isBlue ? '#1A3A8C' : '#F5C800',
        color: isBlue ? 'white' : '#1A1A1A',
        borderRadius: 14,
        padding: '1.8vh 3vw',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 'clamp(1rem, 3vh, 2.8rem)',
        transition: 'background 0.4s',
        flexShrink: 0
      }}>
        {turnText}
      </div>

      {/* Top 3 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ marginBottom: '1.5vh', opacity: 0.6, fontSize: 'clamp(0.8rem, 1.8vh, 1.4rem)', fontWeight: 800, letterSpacing: '0.12em' }}>
          ТОП ГРАВЦІ
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2vh', minHeight: 0 }}>
          {leaders.map((p, i) => (
            <div key={p.id} style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '2vw',
              padding: '0 2.5vw',
              borderRadius: 16,
              background: p.team === 'blue' ? 'rgba(26,58,140,0.65)' : 'rgba(245,200,0,0.25)',
              fontWeight: 700,
              fontSize: 'clamp(1rem, 3vh, 2.8rem)',
              minHeight: 0
            }}>
              <span style={{ fontSize: 'clamp(1.2rem, 3.5vh, 3.2rem)' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </span>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontWeight: 900, fontSize: 'clamp(1.2rem, 3.5vh, 3.2rem)' }}>{p.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
