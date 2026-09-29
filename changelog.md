# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning is SEMVER.

## [Unreleased]

### Latest delivery
- Rebuilt the React UI as a caregiver command center with a synthetic patient snapshot,
  safety radar, BP chart, memory stream, medication list, and care-team contacts.
- Added `/dashboard` for the synthetic snapshot, `/observations` for live memory writes,
  and `evidence` in chat responses. Live services still require Hindsight configuration.
- Added conversation history, send retry, evidence expansion, and doctor brief copy/print
  controls (TODO Phase 2 UX depth). Backend tests: 39 passed; frontend build passed.
- Replaced the previous Git origin and contributor clone instructions with
  `https://github.com/akhil-arvapalli/devnovate-Authenticated.git`, preserving commit history.

### Changed — 2026-09-29
- **Frontend migrated from Streamlit to React + Vite.** New app lives in `frontend-react/`
  (React 18, Vite 5, zero UI dependencies). The original Streamlit UI is kept at
  `frontend/app.py` but deprecated; `README.md` and `run.py` now point to the React app.
- **Design system rebuilt with glassmorphism** (`frontend-react/src/index.css`): deep
  navy base, aurora gradient backdrop, blurred translucent glass surfaces, spotlight-glow
  cards, teal/coral semantic colors, `prefers-reduced-motion` respected.
- **reactbits.dev-style components hand-built** in `frontend-react/src/components/`:
  - `SpotlightCard` — mouse-following radial glow on glass panels
  - `ShinyText` — animated shimmer text (used for the generating state)
  - `TypingDots` — pulsing typing indicator ("Recalling memory…")
  - `ChatMessage` — WhatsApp-style bubbles with distinct risk banner
  - `BriefPanel` — doctor-visit brief with tiny built-in Markdown renderer
- **Vite dev/preview proxy** forwards `/chat`, `/brief`, `/health` to
  `ANCHOR_API_URL` (default `http://localhost:8000`) — no backend CORS changes needed.
- **API wrapper** `frontend-react/src/api.js` with abort-signal support and readable
  error surfacing.
- **Health pill** in the header shows live memory connectivity (`GET /health`).

### Added — 2026-09-29
- `AGENTS.md` — persistent cross-agent context (invariants, state, conventions).
- `CLAUDE.md` — pointer file for Claude-family agents.
- `CONTEXT.md` — domain model: entities, vocabulary, memory-flow.
- `TODO.md` — implementation roadmap: what is done and what can be implemented next.
- `changelog.md` (this file).

### Kept
- Backend unchanged: FastAPI agent loop, Catch engine, Hindsight memory client, synthetic
  data, 36 pytest regression tests.
