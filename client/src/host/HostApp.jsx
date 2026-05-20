import { useState, useEffect } from 'react'
import socket from '../socket'
import SetupScreen from './SetupScreen'
import GameScreen from './GameScreen'
import ResultsScreen from './ResultsScreen'

export default function HostApp() {
  const [gameState, setGameState] = useState(null)

  useEffect(() => {
    socket.on('game-state', setGameState)
    return () => socket.off('game-state', setGameState)
  }, [])

  if (!gameState) return <div className="connecting">З'єднання...</div>
  if (gameState.gamePhase === 'setup') return <SetupScreen gameState={gameState} />
  if (gameState.gamePhase === 'playing') return <GameScreen gameState={gameState} />
  return <ResultsScreen gameState={gameState} />
}
