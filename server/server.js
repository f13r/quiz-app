import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import {
  createGame, addPlayer, startGame,
  markCorrect, markWrong, nextCard, undo, endGame, newGame
} from './gameState.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(express.static(join(__dirname, '../client/dist')))
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'))
})

let state = createGame()

function broadcast() {
  io.emit('game-state', state)
}

io.on('connection', (socket) => {
  socket.emit('game-state', state)

  socket.on('add-player', ({ team, name }) => {
    if (state.gamePhase !== 'setup') return
    if (!['blue', 'yellow'].includes(team)) return
    if (!name || !name.trim()) return
    state = addPlayer(state, team, name.trim())
    broadcast()
  })

  socket.on('start-game', () => {
    if (state.gamePhase !== 'setup') return
    state = startGame(state)
    broadcast()
  })

  socket.on('mark-correct', ({ playerId }) => {
    if (state.gamePhase !== 'playing' || state.cardComplete) return
    state = markCorrect(state, playerId)
    broadcast()
  })

  socket.on('mark-wrong', () => {
    if (state.gamePhase !== 'playing' || state.cardComplete) return
    state = markWrong(state)
    broadcast()
  })

  socket.on('next-card', () => {
    if (state.gamePhase !== 'playing' || !state.cardComplete) return
    state = nextCard(state)
    broadcast()
  })

  socket.on('undo', () => {
    state = undo(state)
    broadcast()
  })

  socket.on('end-game', () => {
    if (state.gamePhase !== 'playing') return
    state = endGame(state)
    broadcast()
  })

  socket.on('new-game', () => {
    state = newGame()
    broadcast()
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Quiz server running on http://0.0.0.0:${PORT}`)
})
