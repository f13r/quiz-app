import { useState, useEffect } from 'react'
import socket from '../socket'

export default function GameScreen({ gameState }) {
  const {
    teams, activeTeam, cardOwner, questionIndex,
    questionCounter, isStealing, cardComplete, lastState
  } = gameState

  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

  // Reset selection when active team changes (steal switch) or question advances
  useEffect(() => {
    setSelectedPlayerId(null)
  }, [activeTeam, questionIndex])

  const isBlue = activeTeam === 'blue'
  const screenClass = `screen ${isBlue ? 'screen--blue' : 'screen--yellow'}`
  const cardOwnerLabel = cardOwner === 'blue' ? 'Синя' : 'Жовта'
  const activeTeamLabel = activeTeam === 'blue' ? 'Синя' : 'Жовта'
  const activePlayers = teams[activeTeam].players

  function handleCorrect() {
    if (!selectedPlayerId) return
    socket.emit('mark-correct', { playerId: selectedPlayerId })
  }

  function handleWrong() {
    socket.emit('mark-wrong')
  }

  function handleNextCard() {
    socket.emit('next-card')
  }

  function handleUndo() {
    socket.emit('undo')
  }

  function handleEndGame() {
    socket.emit('end-game')
  }

  return (
    <div className={screenClass}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem', opacity: 0.8 }}>
          Питання #{questionCounter}
        </span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', opacity: 0.8 }}>
          {cardOwnerLabel} картка — {questionIndex + 1} з 4
        </span>
      </div>

      {/* Steal indicator */}
      {isStealing && (
        <div style={{ textAlign: 'center' }}>
          <span className="steal-badge">🔥 Крадіжка — {activeTeamLabel}</span>
        </div>
      )}

      {/* Card complete state */}
      {cardComplete ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', opacity: 0.8 }}>
            Картка завершена! Наступне питання: #{questionCounter}
          </p>
          <button className="btn btn--next" onClick={handleNextCard}>
            Наступна картка →
          </button>
        </div>
      ) : (
        <>
          {/* Player list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {activePlayers.map(p => (
              <label
                key={p.id}
                className={`player-option ${selectedPlayerId === p.id ? 'player-option--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="player"
                  value={p.id}
                  checked={selectedPlayerId === p.id}
                  onChange={() => setSelectedPlayerId(p.id)}
                />
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>{p.points} очок</span>
              </label>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn--correct"
              disabled={!selectedPlayerId}
              onClick={handleCorrect}
            >
              ✓ Правильно
            </button>
            <button className="btn btn--wrong" onClick={handleWrong}>
              ✗ Неправильно
            </button>
          </div>
        </>
      )}

      {/* Meta buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {lastState && (
          <button className="btn btn--undo" style={{ flex: 1 }} onClick={handleUndo}>
            ↩ Скасувати
          </button>
        )}
        <button className="btn btn--end" style={{ flex: 1 }} onClick={handleEndGame}>
          Завершити гру
        </button>
      </div>
    </div>
  )
}
