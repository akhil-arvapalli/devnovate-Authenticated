# AGENTS.md — anchor-caregiver-memory

Shared context for any AI agent (Claude, opencode, Cursor, Copilot, …) working in this
repository. Read this before making changes. The authoritative references are `README.md`
(architecture), `PROJECT_INFO.md` (demo + feature sheet), and `TODO.md` (implementation
roadmap). Do not re-derive the architecture from scratch — it is already specified.

## 1. What this project is

**Anchor** is a memory-powered health navigator for caregivers of aging parents. It uses
[Hindsight](https://github.com/vectorize-io/hindsight) (retain / recall / reflect) to keep
the full medical journey — symptoms, meds, labs, doctor conversations, observations — so a
family never repeats the story to a new doctor, nurse, or insurer, and Anchor catches risks
(drug interactions, worsening trends, missed follow-ups) before they become emergencies.

- **Backend:** FastAPI + Python (`backend/agent/`, `backend/memory/`, `backend/data/`)
- **Frontend:** **React + Vite** (`frontend-react/`) — replaced the original Streamlit UI
  (`frontend/app.py`, kept for reference/deprecated as of 2026-09-29)
- **Memory:** Hindsight Cloud or open-source Docker; LLM is Groq via OpenAI-compatible API

## 2. Non-negotiable invariants

1. **The Catch engine (`backend/agent/catch.py`) is a safety layer, not a chat feature.**
   It must keep failing closed (`{"risk": False}` on its own exceptions in `main.py`) —
   never make a Catch failure block the chat loop.
2. **Never give dosage advice** in any agent output, and always surface the risk reason
   with a risk flag. The frontend renders `risk_reason` inside a distinct risk banner —
   do not merge it into the answer text silently.
3. **Message length is validated** (1–2000 chars, `ChatRequest`). Keep the client-side
   `maxLength={2000}` in the React input in sync with the backend contract.
4. **Graceful degradation when memory is down.** `/brief` returns a clean 503, never a raw
   500. The React UI must show a readable "Memory offline" state, not a crash.
5. **Demo data must stay synthetic** (`backend/data/synthetic.py`). Never commit real PII.

## 3. Current project state

> **Agents: update this section as work progresses.** Write what you finished and any
> significant decisions here before ending your session.

- **Phase:** Streamlit → React migration complete; glassmorphism + reactbits-style
  components implemented; persistent-memory docs created.
- **Last completed milestone (2026-09-29):**
  - React + Vite app in `frontend-react/` wired to `POST /chat`, `GET /brief`, `GET /health`
  - Vite dev + preview proxy to `ANCHOR_API_URL` (default `http://localhost:8000`) so the
    backend needs no CORS changes
  - Glassmorphism theme (`frontend-react/src/index.css`): aurora backdrop, blurred glass
    surfaces, spotlight cards
  - reactbits-style components hand-built in `frontend-react/src/components/`:
    `SpotlightCard`, `ShinyText`, `TypingDots`, `ChatMessage`, `BriefPanel`
  - Persistent-memory docs: `AGENTS.md`, `changelog.md`, `CLAUDE.md`, `CONTEXT.md`, `TODO.md`
- **Open decisions not yet made:**
  - Whether to delete `frontend/app.py` (Streamlit) outright or keep it deprecated
  - Production serving story for the React build (static host + API URL vs. same-origin)
  - Real-time timeline/medication-tracker views (see TODO.md)
- **Latest delivery:** caregiver command-center redesign with synthetic `/dashboard`
  data, `/observations` retention, chat evidence, conversation history, retry controls,
  and brief copy/print actions. Backend tests: 39 passed; frontend build passed.
  Browser validation was not completed because the Chromium installation stalled.
- **Repository remote:** `https://github.com/akhil-arvapalli/devnovate-Authenticated.git`.
  Prior commit history is preserved; the previous origin URL has been replaced.
- **Known blockers:** live chat, observations, and brief generation require a configured
  Hindsight service; `/health` is API liveness only, not a memory connectivity check.

## 4. Repo structure

```
backend/agent/     FastAPI app, agent loop, Catch engine, CLI
backend/memory/    Hindsight bank config + client wrapper
backend/data/      synthetic dataset + loader
backend/tests/     pytest regression suite (CI on GitHub Actions)
frontend/          (deprecated) original Streamlit chat UI
frontend-react/    React + Vite UI (the active frontend)
  src/components/  SpotlightCard, ShinyText, TypingDots, ChatMessage, BriefPanel
  src/api.js       fetch wrapper for /chat, /brief, /health
  src/index.css    glassmorphism design system
content/           articles, posts, scripts
docs/              CONTENT_PLAN.md, SUBMISSION_CHECKLIST.md
```

## 5. Conventions

- **Frontend:** React 18 function components + hooks, no component library dependencies —
  reactbits.dev-style effects are hand-built in `src/components/`. Plain CSS with custom
  properties (no Tailwind); keep the design tokens in `:root` in `index.css`.
- **Design tokens:** `--teal` for positive/memory-connected, `--coral` for risk/offline,
  glass surfaces via `.glass`. Respect `prefers-reduced-motion`.
- **Backend:** Python 3.12, FastAPI, pytest. Do not change endpoint contracts without
  updating `frontend-react/src/api.js` and this file.
- **Commits:** reference the TODO.md item being worked on; add a `changelog.md` entry for
  every user-visible change.

## 6. What NOT to do

- Don't reintroduce Streamlit or add a second UI framework.
- Don't add heavy UI dependencies (UI kits, CSS frameworks) — the design system is
  intentionally dependency-free and hand-built.
- Don't merge risk reasons into answer text, or drop the risk banner styling.
- Don't hardcode API URLs in components — use `src/api.js` and the `ANCHOR_API_URL` env.
- Don't break the backend tests; run them from `backend/` if you touch Python.

## 7. Where to look first

- New to the project? Read `README.md`, then `PROJECT_INFO.md`.
- Touching the UI? Read `frontend-react/src/index.css` (design system) and `src/App.jsx`.
- Touching memory/loop logic? Read `backend/memory/client.py` and `backend/agent/loop.py`.
- Picking up mid-build? Read §3 above, then `TODO.md` for unchecked items.
