import { useState } from 'react'
import type { GameState, TeamColor, Player } from '../../../shared/types.js'
import socket from '../socket.js'

interface Props {
  gameState: GameState
}

interface TeamColumnProps {
  label: string
  color: TeamColor
  players: readonly Player[]
  inputValue: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onKey: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function SetupScreen({ gameState }: Props) {
  const [blueInput, setBlueInput] = useState('')
  const [yellowInput, setYellowInput] = useState('')

  function addPlayer(team: TeamColor) {
    const value = team === 'blue' ? blueInput : yellowInput
    if (!value.trim()) return
    socket.emit('add-player', { team, name: value.trim() })
    team === 'blue' ? setBlueInput('') : setYellowInput('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>, team: TeamColor) {
    if (e.key === 'Enter') addPlayer(team)
  }

  const bluePlayers = gameState.teams.blue.players
  const yellowPlayers = gameState.teams.yellow.players
  const canStart = bluePlayers.length > 0 && yellowPlayers.length > 0

  return (
    <div className="screen screen--blue">
      <h1>Як я цього не знав?</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TeamColumn
          label="Синя"
          color="blue"
          players={bluePlayers}
          inputValue={blueInput}
          onInputChange={setBlueInput}
          onAdd={() => addPlayer('blue')}
          onKey={(e) => handleKey(e, 'blue')}
        />
        <TeamColumn
          label="Жовта"
          color="yellow"
          players={yellowPlayers}
          inputValue={yellowInput}
          onInputChange={setYellowInput}
          onAdd={() => addPlayer('yellow')}
          onKey={(e) => handleKey(e, 'yellow')}
        />
      </div>

      <button
        className="btn btn--start"
        disabled={!canStart}
        onClick={() => socket.emit('start-game')}
      >
        Почати гру →
      </button>
    </div>
  )
}

function TeamColumn({ label, color, players, inputValue, onInputChange, onAdd, onKey }: TeamColumnProps) {
  const accentStyle = color === 'yellow'
    ? { background: 'rgba(245,200,0,0.15)', border: '1px solid rgba(245,200,0,0.4)' }
    : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, ...accentStyle }}>
      <h2 style={{ color: color === 'yellow' ? '#F5C800' : 'white' }}>{label}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 60 }}>
        {players.map(p => (
          <div key={p.id} style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>
            • {p.name}
          </div>
        ))}
      </div>

      <input
        className="input"
        value={inputValue}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={onKey}
        placeholder="Ім'я гравця"
        maxLength={20}
      />
      <button className="btn btn--add" onClick={onAdd}>
        + Додати
      </button>
    </div>
  )
}
