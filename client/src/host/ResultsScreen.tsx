import type { GameState } from '../../../shared/types.js'
import { useGameResults } from '../useGameResults.js'
import socket from '../socket.js'
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
    <div className="screen screen--blue">
      <div style={{
        background: winner === 'draw' ? 'rgba(255,255,255,0.1)' : winner === 'blue' ? 'rgba(255,255,255,0.15)' : '#F5C800',
        color: winner === 'yellow' ? '#1A1A1A' : 'white',
        borderRadius: 16,
        padding: '20px 16px',
        textAlign: 'center',
        fontWeight: 900,
        fontSize: '1.4rem'
      }}>
        {winnerText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Синя</div>
          <div className="score-big">{blueTotal}</div>
        </div>
        <div style={{ background: '#F5C800', borderRadius: 12, padding: 16, textAlign: 'center', color: '#1A1A1A' }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Жовта</div>
          <div className="score-big">{yellowTotal}</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: 10, opacity: 0.8 }}>Таблиця лідерів</h3>
        {sorted.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            marginBottom: 6,
            borderRadius: 10,
            background: p.team === 'blue' ? 'rgba(255,255,255,0.1)' : 'rgba(245,200,0,0.2)',
            fontWeight: 700
          }}>
            <span style={{ opacity: 0.6, minWidth: 24 }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{p.name}</span>
            <span style={{
              background: p.team === 'blue' ? 'rgba(255,255,255,0.2)' : '#F5C800',
              color: p.team === 'yellow' ? '#1A1A1A' : 'white',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: '0.9rem'
            }}>
              {pluralPoints(p.points)}
            </span>
          </div>
        ))}
      </div>

      <button className="btn btn--new-game" onClick={() => socket.emit('new-game')}>
        Нова гра
      </button>
    </div>
  )
}
