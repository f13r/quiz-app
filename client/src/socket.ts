import { io, type Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '../../shared/types.js'

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(window.location.origin, { transports: ['websocket'] })
export default socket
