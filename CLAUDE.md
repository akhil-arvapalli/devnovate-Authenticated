# CLAUDE.md

Read `AGENTS.md` first — it is the authoritative cross-agent context for this repository
(what the project is, non-negotiable invariants, current state, conventions, what not to do).

Quick orientation:

- **Project:** Anchor — memory-powered health navigator for caregivers (Hindsight memory,
  FastAPI backend, React frontend).
- **Active frontend:** `frontend-react/` (React + Vite, glassmorphism, reactbits-style
  hand-built components). `frontend/app.py` (Streamlit) is deprecated.
- **API contract:** `POST /chat` `{message} -> {answer, risk, risk_reason}`,
  `GET /brief` -> `{brief}`, `GET /health` -> `{status}`. Frontend wrapper: `frontend-react/src/api.js`.
- **Run backend:** `cd backend && uvicorn agent.main:app --reload`
- **Run frontend:** `cd frontend-react && npm run dev` (proxy already configured)
- **Roadmap:** `TODO.md` · **Domain model:** `CONTEXT.md` · **Changes:** `changelog.md`

When you finish work, update the "Current project state" section of `AGENTS.md` and add a
`changelog.md` entry.
