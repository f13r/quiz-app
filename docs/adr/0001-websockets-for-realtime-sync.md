# WebSockets (Socket.io) for real-time sync between Host and Display

The Host phone and the Display tablet must reflect score changes instantly — when the Host marks an answer correct, the tablet leaderboard updates immediately with no perceptible lag. We chose WebSockets via Socket.io over HTTP polling because the two devices are on the same local WiFi LAN, making a persistent connection trivial and eliminating the need to accept 1–5 second polling delay mid-game. Polling was the simpler alternative but the lag would be visible to players watching the tablet.

## Considered Options

- **HTTP polling** — simpler, but ~2–5 s delay between host action and tablet update is noticeable during a live game.
- **Server-Sent Events** — push-only from server; fine for the tablet, but the host also needs to send events, making SSE awkward for bidirectional state.
- **WebSockets (Socket.io)** — bidirectional, instant, works well on LAN, minor extra complexity. Chosen.
