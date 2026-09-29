# TODO.md — implementation roadmap

Phased plan for what is done and what can be implemented next. Update as work progresses.

## Phase 1 — React migration (DONE, 2026-09-29)

- [x] Scaffold React + Vite app in `frontend-react/` (React 18, Vite 5)
- [x] Wire to backend: `POST /chat`, `GET /brief`, `GET /health` via `src/api.js`
- [x] Vite dev + preview proxy to `ANCHOR_API_URL` (no backend CORS change)
- [x] Glassmorphism design system (`src/index.css`): aurora backdrop, glass surfaces,
      spotlight cards, teal/coral semantics, reduced-motion support
- [x] reactbits-style components: `SpotlightCard`, `ShinyText`, `TypingDots`,
      `ChatMessage`, `BriefPanel` (hand-built, dependency-free)
- [x] Health pill (live memory connectivity), risk banner, suggested prompts, typing state
- [x] Responsive down to mobile, visible keyboard focus
- [x] Persistent-memory docs: `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `TODO.md`, `changelog.md`

## Phase 2 — UX depth (next)

- [ ] **Timeline view** — vertical timeline of the family's medical journey from memory
      (new `GET /timeline` endpoint + `recall` by time buckets); pairs with the aurora theme.
- [ ] **Medication tracker card** — current meds + doses with "changed on Tuesday" badges;
      source: `recall(bank_id, "current medications and doses")`.
- [ ] **Trend sparkline** — BP/weight readings charted from memory (SVG, no chart lib).
- [ ] **Brief print stylesheet** — `@media print` CSS so the doctor brief prints clean.
- [ ] **Copy-to-clipboard** on the brief.
- [ ] **Retry affordance** on failed sends (one click, same message).
- [ ] **Streaming responses** — switch `/chat` to SSE/WebSocket for token streaming; the
      typing indicator becomes a live-streaming bubble.

## Phase 3 — Product surface

- [ ] **Multi-family bank switcher** — the backend already accepts `bank_id`; add a glass
      dropdown in the header that passes it through.
- [ ] **Care-team quick actions** — tap a provider to draft a call script or email.
- [ ] **PWA** — installable on the caregiver's phone (manifest + service worker).
- [ ] **Voice input** — Web Speech API dictation in the chat input.
- [ ] **Reminder nudges** — scheduled follow-up suggestions when the Catch engine detects
      a missed follow-up.
- [ ] **Onboarding flow** — first-run "Day 1" state that walks through creating the bank
      and adding the first memory.

## Phase 4 — Engineering hygiene

- [ ] **Frontend tests** — Vitest + React Testing Library for components and `api.js`.
- [ ] **ESLint + Prettier** for `frontend-react/` and wire into the existing GitHub
      Actions CI alongside the pytest suite.
- [ ] **Production serving story** — decide: static host + `VITE_API_URL`, or serve the
      built bundle from FastAPI with `StaticFiles`.
- [ ] **Delete `frontend/app.py`** (Streamlit) once the team confirms the React UI is final.
- [ ] **Error taxonomy** — distinguish memory-down (503) from LLM failure in the UI.
