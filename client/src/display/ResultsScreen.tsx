import type { GameState } from '../../../shared/types.js'
import { useGameResults } from '../useGameResults.js'
import { pluralPoints } from '../utils.js'

interface Props {
  gameState: GameState
}

export default function ResultsScreen({ gameState }: Props) {
  const { blueTotal, yellowTotal, winner, rankedPlayers: sorted } = useGameResults(gameState)

  const winnerText = winner === 'blue' ? '🏆 Синя команда перемогла!'
    : winner === 'yellow' ? '🏆 Жовта команда перемогла!'
    : '🤝 Нічия!'

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
      <div style={{
        background: winner === 'yellow' ? '#F5C800' : winner === 'blue' ? '#1A3A8C' : 'rgba(255,255,255,0.12)',
        color: winner === 'yellow' ? '#1A1A1A' : 'white',
        borderRadius: 20,
        padding: '2.5vh 4vw',
        textAlign: 'center',
        fontWeight: 900,
        fontSize: 'clamp(1.8rem, 5vh, 5rem)',
        flexShrink: 0
      }}>
        {winnerText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3vw', flexShrink: 0 }}>
        <div style={{ background: 'rgba(26,58,140,0.7)', borderRadius: 18, padding: '2.5vh 3vw', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2.8vh, 2.2rem)', marginBottom: '1vh' }}>Синя команда</div>
          <div style={{ fontSize: 'clamp(4rem, 14vh, 16rem)', fontWeight: 900, lineHeight: 1 }}>{blueTotal}</div>
        </div>
        <div style={{ background: '#F5C800', borderRadius: 18, padding: '2.5vh 3vw', textAlign: 'center', color: '#1A1A1A' }}>
          <div style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2.8vh, 2.2rem)', marginBottom: '1vh' }}>Жовта команда</div>
          <div style={{ fontSize: 'clamp(4rem, 14vh, 16rem)', fontWeight: 900, lineHeight: 1 }}>{yellowTotal}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ marginBottom: '1.5vh', opacity: 0.6, fontSize: 'clamp(0.8rem, 1.8vh, 1.4rem)', fontWeight: 800, letterSpacing: '0.12em', flexShrink: 0 }}>
          ТАБЛИЦЯ ЛІДЕРІВ
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2vh', minHeight: 0 }}>
          {sorted.map((p, i) => (
            <div key={p.id} style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '2vw',
              padding: '0 2.5vw',
              borderRadius: 14,
              background: p.team === 'blue' ? 'rgba(26,58,140,0.6)' : 'rgba(245,200,0,0.2)',
              fontWeight: 700,
              fontSize: 'clamp(1rem, 2.5vh, 2.2rem)',
              minHeight: 0
            }}>
              <span style={{ minWidth: '3vw', opacity: 0.6, fontWeight: 800 }}>{i + 1}.</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontWeight: 900, fontSize: 'clamp(1rem, 2.8vh, 2.5rem)' }}>{pluralPoints(p.points)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
