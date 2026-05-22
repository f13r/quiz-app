import { useState, useEffect } from 'react'
import type { GameState } from '../../shared/types.js'
import defaultSocket from './socket.js'

export interface GameSocket {
  emit(ev: 'request-state'): void
  on(ev: 'game-state', listener: (state: GameState) => void): void
  off(ev: 'game-state', listener: (state: GameState) => void): void
}

export function useGameState(socket: GameSocket = defaultSocket): GameState | null {
  const [gameState, setGameState] = useState<GameState | null>(null)
  useEffect(() => {
    socket.emit('request-state')
    socket.on('game-state', setGameState)
    return () => { socket.off('game-state', setGameState) }
  }, [socket])
  return gameState
}
