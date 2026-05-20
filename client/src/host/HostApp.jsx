import { useState, useEffect } from 'react'
import socket from '../socket'
import SetupScreen from './SetupScreen'

export default function HostApp() {
  const [gameState, setGameState] = useState(null)

  useEffect(() => {
    socket.on('game-state', setGameState)
    return () => socket.off('game-state', setGameState)
  }, [])

  if (!gameState) return <div className="connecting">З'єднання...</div>
  return <SetupScreen gameState={gameState} />
}
