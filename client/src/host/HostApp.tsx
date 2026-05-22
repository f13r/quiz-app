import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../useGameState.js'
import { useWakeLock } from '../useWakeLock.js'
import socket from '../socket.js'
import SetupScreen from './SetupScreen.js'
import GameScreen from './GameScreen.js'
import ResultsScreen from './ResultsScreen.js'
import FullscreenButton from '../FullscreenButton.js'

export default function HostApp() {
  useWakeLock()
  const navigate = useNavigate()
  const gameState = useGameState()

  useEffect(() => {
    socket.emit('claim-host')
    function onHostStatus(isHost: boolean) {
      if (!isHost) navigate('/game', { replace: true })
    }
    socket.on('host-status', onHostStatus)
    return () => { socket.off('host-status', onHostStatus) }
  }, [navigate])

  if (!gameState) return <div className="connecting">З'єднання...</div>

  return (
    <>
      {gameState.gamePhase === 'setup' && <SetupScreen gameState={gameState} />}
      {gameState.gamePhase === 'playing' && <GameScreen gameState={gameState} />}
      {gameState.gamePhase !== 'setup' && gameState.gamePhase !== 'playing' && <ResultsScreen gameState={gameState} />}
      <FullscreenButton corner="top-right" />
    </>
  )
}
