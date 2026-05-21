import { useGameState } from '../useGameState'
import LobbyScreen from './LobbyScreen'
import DashboardScreen from './DashboardScreen'
import ResultsScreen from './ResultsScreen'

export default function DisplayApp() {
  const gameState = useGameState()

  if (!gameState) return (
    <div style={{
      height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0F2260', color: 'rgba(255,255,255,0.6)',
      fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(1rem, 2.5vh, 2rem)', fontWeight: 700
    }}>
      З'єднання...
    </div>
  )

  return (
    <div style={{ height: '100dvh', overflow: 'hidden' }}>
      {gameState.gamePhase === 'setup' && <LobbyScreen />}
      {gameState.gamePhase === 'playing' && <DashboardScreen gameState={gameState} />}
      {gameState.gamePhase !== 'setup' && gameState.gamePhase !== 'playing' && <ResultsScreen gameState={gameState} />}
    </div>
  )
}
