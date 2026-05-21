import { useGameState } from '../useGameState'
import SetupScreen from './SetupScreen'
import GameScreen from './GameScreen'
import ResultsScreen from './ResultsScreen'

export default function HostApp() {
  const gameState = useGameState()

  if (!gameState) return <div className="connecting">З'єднання...</div>
  if (gameState.gamePhase === 'setup') return <SetupScreen gameState={gameState} />
  if (gameState.gamePhase === 'playing') return <GameScreen gameState={gameState} />
  return <ResultsScreen gameState={gameState} />
}
