# Contributing — Anchor (6-Person Team)

Workflow for the team: how to contribute code and content without stepping on
each other.

## Setup (once)

```bash
git clone https://github.com/akhil-arvapalli/devnovate-Authenticated.git
cd devnovate-Authenticated
pip install -r backend/requirements.txt
cp .env.example .env   # set your Hindsight + Groq keys
python run.py          # verify bank + demo data work
```

## Team roles & ownership

| # | Role | Owns |
|---|---|---|
| P1 | Team Lead / Backend Agent | `backend/agent/loop.py`, `main.py`, final submission |
| P2 | Hindsight Memory Architect | `backend/memory/` (bank config, mission/directives) |
| P3 | Frontend / Chat UI | `frontend/app.py` |
| P4 | Data & Edge Cases | `backend/data/`, `backend/tests/` |
| P5 | Demo & Video Lead | video recording, thumbnail, YouTube |
| P6 | Content & Pitch Lead | `content/`, README, Reddit post |

## Code workflow (small PRs, main protected)

1. Create a branch: `git checkout -b <role>/<short-name>` (e.g. `p2/bank-config`)
2. Make your change, keep it small and focused.
3. **Run the tests before pushing:**
   ```bash
   cd backend
   python -m pytest tests -v
   ```
   CI runs the same suite on every push/PR — it must be green.
4. Push and open a PR; one review from the role owner of the touched area.
5. Merge with squash; delete the branch.

## Conventions

- No secrets in code — everything via `.env` (see `.env.example`).
- Type hints on public functions; docstrings for modules.
- Tests in `backend/tests/` — mock the Hindsight/LLM boundary (see existing
  tests for the pattern).
- Edge cases matter: every new behavior needs a failing-then-passing test.

## Content workflow (per the content guide)

- Article drafts live in `content/article-0X-*.md` — each member edits their
  own, then publishes to a public URL (Medium / Dev.to / Hashnode).
- **Never mention "hackathon"** in any article or social post (disqualifier).
- Every article embeds the 3 required Hindsight links.
- Social posts: LinkedIn post per member; article URL as first comment;
  Hindsight repo (https://github.com/vectorize-io/hindsight) as a comment.
- Video: script in `content/video-script.md`; upload public to YouTube.
- Reddit: link post from `content/reddit-post.md`.

## Before the final submission

See `docs/SUBMISSION_CHECKLIST.md` — the Profile Review Form (every member)
and the final submission form (team lead) are mandatory.
