# TypeScript across client and server, with tsc build step on the server

The codebase was migrated to TypeScript throughout — client (Vite), server (tsc), and shared types. The server uses a `tsc` build step that compiles to `server/dist/` before running with `node`, rather than a runtime transpiler like `tsx`. This keeps TypeScript out of production and is consistent with the client already having a Vite build step in `deploy.sh`. The `shared/` directory holds the canonical type definitions (`GameState`, `TeamColor`, `GamePhase`, socket event maps) imported via relative paths — not a formal npm workspace package — because the surface area is small and workspace overhead isn't justified at this scale.

## Considered Options

- **`tsx` runtime on server** — simpler dev loop, no `dist/` output to manage, but `tsx` becomes a production dependency and the deploy command changes from `node server.js` to `tsx server.ts`. Rejected because the build step already exists for the client and TypeScript shouldn't run in production.
- **npm workspaces for `shared/`** — cleaner import paths (`@quiz/shared` vs `../../shared/types.js`), but adds workspace wiring for three small files. Rejected as premature; relative paths with a `tsconfig` path alias are sufficient.
- **`node --test` on server** — the existing test runner. Rejected in favour of Vitest everywhere so both server and client tests run with a single `vitest run` command and TypeScript is handled natively without a separate compile step for tests.
