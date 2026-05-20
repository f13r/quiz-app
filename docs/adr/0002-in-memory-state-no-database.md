# In-memory game state with no database

All Game state (teams, players, scores, current turn) lives in server memory only. A server restart loses the current Game. We chose this because the use case is a single-session party game: stats are only meaningful for the current Game, there is no cross-game history requirement, and the host manually ends the Game before starting a new one. Adding a database (even SQLite) would add setup complexity on the Ubuntu server with no user-visible benefit. If cross-session history is ever needed, SQLite is the natural next step.
