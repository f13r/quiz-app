import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import type { ServerToClientEvents, ClientToServerEvents, GameState } from '../shared/types.js'
import { createGame } from './gameState.js'
import { dispatch } from './dispatch.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, { cors: { origin: '*' } })

// Compiled to dist/server/server.js — two levels up from dist/server/ reaches the repo root
app.use(express.static(join(__dirname, '../../client/dist')))
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../../client/dist/index.html'))
})

let state: GameState = createGame()
let lastState: GameState | null = null
let hostSocketId: string | null = null

function broadcast() {
  io.emit('game-state', state)
}

function apply(event: keyof ClientToServerEvents, payload?: unknown) {
  const result = dispatch(state, lastState, event, payload)
  if (result.state !== state) {
    state = result.state
    lastState = result.lastState
    broadcast()
  }
}

function hostApply(socketId: string, event: keyof ClientToServerEvents, payload?: unknown) {
  if (socketId === hostSocketId) apply(event, payload)
}

io.on('connection', (socket) => {
  socket.emit('game-state', state)

  socket.on('disconnect', () => {
    if (socket.id === hostSocketId) hostSocketId = null
  })

  socket.on('claim-host', () => {
    const existingHost = hostSocketId ? io.sockets.sockets.get(hostSocketId) : null
    if (!existingHost || hostSocketId === socket.id) {
      hostSocketId = socket.id
      socket.emit('host-status', true)
    } else {
      socket.emit('host-status', false)
    }
  })

  socket.on('request-state', () => socket.emit('game-state', state))

  socket.on('add-player', (payload) => hostApply(socket.id, 'add-player', payload))
  socket.on('start-game', () => hostApply(socket.id, 'start-game'))
  socket.on('mark-correct', (payload) => hostApply(socket.id, 'mark-correct', payload))
  socket.on('mark-wrong', () => hostApply(socket.id, 'mark-wrong'))
  socket.on('next-card', () => hostApply(socket.id, 'next-card'))
  socket.on('undo', () => hostApply(socket.id, 'undo'))
  socket.on('end-game', () => hostApply(socket.id, 'end-game'))
  socket.on('new-game', () => hostApply(socket.id, 'new-game'))
})

const PORT = Number(process.env.PORT) || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Quiz server running on http://0.0.0.0:${PORT}`)
})
