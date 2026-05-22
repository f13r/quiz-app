import { useMemo } from 'react'
import { deriveResults } from '@shared/deriveResults.js'
import type { GameState, DeriveResultsOutput } from '@shared/types.js'

export function useGameResults(gameState: GameState): DeriveResultsOutput {
  return useMemo(() => deriveResults(gameState), [gameState])
}
