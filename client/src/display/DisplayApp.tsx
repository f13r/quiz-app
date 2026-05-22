import { useGameState } from '../useGameState.js'
import { useWakeLock } from '../useWakeLock.js'
import LobbyScreen from './LobbyScreen.js'
import DashboardScreen from './DashboardScreen.js'
import ResultsScreen from './ResultsScreen.js'
import FullscreenButton from '../FullscreenButton.js'

export default function DisplayApp() {
  useWakeLock()
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
    <div style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {gameState.gamePhase === 'setup' && <LobbyScreen />}
        {gameState.gamePhase === 'playing' && <DashboardScreen gameState={gameState} />}
        {gameState.gamePhase !== 'setup' && gameState.gamePhase !== 'playing' && <ResultsScreen gameState={gameState} />}
      </div>
      <div style={{
        height: 48,
        background: '#0F2260',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 12px',
        flexShrink: 0,
      }}>
        <FullscreenButton inline />
      </div>
    </div>
  )
}
