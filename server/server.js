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
    if (!['blue', 'yellow'].includes(team)) return
    if (!name || !name.trim()) return
    const next = addPlayer(state, team, name.trim())
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('start-game', () => {
    const next = startGame(state)
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('mark-correct', ({ playerId }) => {
    if (typeof playerId !== 'number') return
    const next = markCorrect(state, playerId)
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('mark-wrong', () => {
    const next = markWrong(state)
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('next-card', () => {
    const next = nextCard(state)
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('undo', () => {
    const next = undo(state)
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('end-game', () => {
    const next = endGame(state)
    if (next !== state) { state = next; broadcast() }
  })

  socket.on('new-game', () => {
    const next = newGame(state)
    if (next !== state) { state = next; broadcast() }
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Quiz server running on http://0.0.0.0:${PORT}`)
})
