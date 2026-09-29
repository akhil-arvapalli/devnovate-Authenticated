# CONTEXT.md — Domain model

The vocabulary and mental model of Anchor. Keep this current when entities or flows change.

## The product in one sentence

Anchor remembers a caregiver's full medical journey (via Hindsight) so the family never
repeats the story — and catches risks before they become emergencies.

## Entities

| Entity | Where it lives | Meaning |
|---|---|---|
| **Memory bank** | Hindsight (Cloud or Docker) | The durable store of the family's medical journey. One bank per family (`get_bank_id()`). |
| **Observation** | `retain()` as world/experience facts | A dated fact: symptom, med change, lab result, doctor note, daily observation. |
| **Directive** | `memory/create_bank.py` | Standing rules for the agent: flag interactions, never give dosage advice, always cite sources. |
| **Disposition** | `memory/create_bank.py` | Answering personality (empathy 5, skepticism 4) governing tone. |
| **Mental model** | `memory/create_bank.py` | Family-curated baseline ("BP ~130/80, walks daily") the agent reasons against. |
| **Catch** | `backend/agent/catch.py` | Risk-detection engine: recalls history and flags contradictions across time (new med + existing med + symptom = risk). Fails closed. |
| **Brief** | `GET /brief` | One-page doctor-visit summary: meds, conditions, recent observations, care team. |
| **Risk reason** | `ChatResponse.risk_reason` | Human-readable explanation attached to a risk flag; rendered as a distinct banner in the UI. |

## Memory flow (the loop)

```
caregiver message
  → Catch engine (safety-sensitive wording; fails closed)
  → reflect() memory-grounded answer  ← TEMPR 4-way recall (semantic/keyword/graph/temporal)
  → LLM (Groq) shapes the reply
  → retain() new observations back into the bank
```

## UI vocabulary (React frontend)

- **Caregiver chat** — the message panel; bubbles in WhatsApp style; assistant replies cite
  memory and show a **risk banner** when the Catch engine fires.
- **Memory connected / Memory offline** — the health pill; live `GET /health` status.
- **Doctor-visit brief** — the printable summary panel; generated from the memory bank.
- **Recalling memory…** — typing indicator while the agent loop runs.

## Safety rules that show up in the UI

1. Never dosage advice; escalate to the care team instead.
2. Risk reasons are always shown with a risk flag — never merged into answer text.
3. PII is redacted by the memory layer; demo data is synthetic only.
