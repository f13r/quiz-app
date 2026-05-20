import { useState, useEffect } from 'react'
import socket from '../socket'
import LobbyScreen from './LobbyScreen'
import DashboardScreen from './DashboardScreen'
import ResultsScreen from './ResultsScreen'

export default function DisplayApp() {
  const [gameState, setGameState] = useState(null)

  useEffect(() => {
    socket.on('game-state', setGameState)
    return () => socket.off('game-state', setGameState)
  }, [])

  if (!gameState) return <div className="connecting">З'єднання...</div>
  if (gameState.gamePhase === 'setup') return <LobbyScreen />
  if (gameState.gamePhase === 'playing') return <DashboardScreen gameState={gameState} />
  return <ResultsScreen gameState={gameState} />
}
