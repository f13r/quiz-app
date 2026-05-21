import { useState, useEffect } from 'react'
import defaultSocket from './socket'

export function useGameState(socket = defaultSocket) {
  const [gameState, setGameState] = useState(null)
  useEffect(() => {
    socket.emit('request-state')
    socket.on('game-state', setGameState)
    return () => socket.off('game-state', setGameState)
  }, [socket])
  return gameState
}
