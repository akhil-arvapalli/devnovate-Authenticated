"""Anchor FastAPI app - HTTP API for the caregiver chat + doctor brief.

Endpoints:
    POST /chat            - one caregiver message -> memory-grounded answer
    GET  /brief           - generate a one-page doctor-visit brief from memory
    GET  /health          - liveness probe

Run:  uvicorn agent.main:app --reload
"""
from __future__ import annotations

from datetime import datetime, timezone
import re

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .catch import catch
from .loop import run_loop
from data.synthetic import MEDS, PARENT, PROVIDERS, STORY
from memory.client import get_bank_id, recall, retain

app = FastAPI(title="Anchor - Caregiver Memory Agent", version="0.1.0")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000,
                         description="Caregiver message")
    bank_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    risk: bool = False
    risk_reason: str | None = None
    evidence: list[str] = Field(default_factory=list)


class ObservationRequest(BaseModel):
    content: str = Field(..., min_length=3, max_length=1000)
    category: str = Field(default="caregiver note", min_length=2, max_length=40)
    bank_id: str | None = None


class ObservationResponse(BaseModel):
    saved: bool
    category: str
    message: str


class BriefResponse(BaseModel):
    brief: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    bank_id = req.bank_id or get_bank_id()

    # Run the catch engine for safety-sensitive wording.
    try:
        caught = catch(bank_id, req.message)
    except Exception:  # noqa: BLE001
        caught = {"risk": False, "reason": None, "evidence": []}

    result = run_loop(req.message, bank_id)

    # If the catch engine found a risk the loop didn't, merge it.
    if caught.get("risk") and not result.get("risk_reason"):
        result["risk"] = True
        result["risk_reason"] = caught.get("reason")

    return ChatResponse(
        answer=result["answer"],
        risk=result["risk"],
        risk_reason=result["risk_reason"],
        evidence=caught.get("evidence", []),
    )


@app.get("/dashboard")
def dashboard() -> dict:
    """Return the rich caregiver snapshot used by the command center UI.

    The demo profile is deterministic so the experience remains useful while a
    Hindsight bank is being configured. The chat and brief still use the live
    memory boundary, while this snapshot makes the longitudinal story visible
    at a glance during a demo.
    """
    bp_pattern = re.compile(r"BP (\d+)/(\d+)")
    bp_points = []
    for offset, content, _context in STORY:
        match = bp_pattern.search(content)
        if match:
            systolic, diastolic = (int(value) for value in match.groups())
            bp_points.append({
                "label": f"D{offset}",
                "date": f"Sep {offset + 1}",
                "systolic": systolic,
                "diastolic": diastolic,
                "value": f"{systolic}/{diastolic}",
            })

    return {
        "patient": {
            "name": PARENT["name"],
            "age": PARENT["age"],
            "relationship": "Mom · primary care focus",
            "initials": "MC",
            "conditions": PARENT["diagnoses"],
            "baseline_bp": PARENT["baseline_bp"],
            "status": "needs-review",
            "status_label": "Needs a clinician check-in",
        },
        "metrics": {
            "latest_bp": "165/92",
            "baseline_bp": PARENT["baseline_bp"],
            "bp_delta": "+35 / +12",
            "last_check": "Today · 8:10 AM",
            "active_medications": 4,
            "memory_count": 24,
            "bp_points": bp_points[-8:],
            "trend_label": "rising over 6 readings",
        },
        "attention": [
            {
                "id": "dizziness-bp",
                "severity": "urgent",
                "label": "Catch detected",
                "title": "Dizziness meets a rising BP trend",
                "detail": "165/92 is the highest recorded reading. Dizziness has continued since the Metoprolol change.",
                "action": "Contact Dr. Patel today",
                "source": "3 linked memories · Sep 16–18",
            },
            {
                "id": "dose-change",
                "severity": "watch",
                "label": "Medication change",
                "title": "Metoprolol moved to 50mg",
                "detail": "Dose was doubled on day 14 while Warfarin remained active.",
                "action": "Ask about the combination",
                "source": "Doctor visit · Sep 15",
            },
            {
                "id": "brief-ready",
                "severity": "ready",
                "label": "Visit prep",
                "title": "Your doctor brief is ready",
                "detail": "Anchor has assembled medications, conditions, recent observations, and care-team contacts.",
                "action": "Open visit brief",
                "source": "24 retained memories",
            },
        ],
        "timeline": [
            {"id": "t17", "date": "Sep 18", "day": "Day 17", "type": "symptom", "tone": "urgent", "title": "Dizzy spells continue", "detail": "BP 165/92 — highest reading. Taking Metoprolol 50mg + Warfarin 5mg."},
            {"id": "t16", "date": "Sep 17", "day": "Day 16", "type": "symptom", "tone": "urgent", "title": "Lightheaded twice today", "detail": "BP 158/92. The pattern is no longer a one-off reading."},
            {"id": "t15", "date": "Sep 16", "day": "Day 15", "type": "observation", "tone": "watch", "title": "First dizziness after standing", "detail": "BP 152/90. Margaret felt dizzy after standing up."},
            {"id": "t14", "date": "Sep 15", "day": "Day 14", "type": "medication", "tone": "violet", "title": "Metoprolol doubled", "detail": "Dr. Patel increased Metoprolol from 25mg to 50mg daily."},
            {"id": "t13", "date": "Sep 14", "day": "Day 13", "type": "observation", "tone": "watch", "title": "Fatigue appears", "detail": "BP 138/88 after starting Metoprolol."},
            {"id": "t12", "date": "Sep 13", "day": "Day 12", "type": "doctor", "tone": "teal", "title": "New medication added", "detail": "Dr. Patel started Metoprolol 25mg for a rising BP trend."},
        ],
        "medications": [
            {"name": "Metoprolol", "dose": "50mg daily", "purpose": "Blood pressure", "status": "changed", "accent": "violet"},
            {"name": "Warfarin", "dose": "5mg daily", "purpose": "Blood thinner", "status": "active", "accent": "coral"},
            {"name": "Lisinopril", "dose": "10mg daily", "purpose": "Blood pressure", "status": "active", "accent": "teal"},
            {"name": "Atorvastatin", "dose": "20mg nightly", "purpose": "Cholesterol", "status": "active", "accent": "blue"},
        ],
        "care_team": [
            {"name": "Dr. Anita Patel", "role": "Cardiologist", "phone": "(555) 010-2233"},
            {"name": "Dr. James Okafor", "role": "Primary care", "phone": "(555) 010-8899"},
        ],
        "memory": {
            "total": 24,
            "this_week": 6,
            "categories": ["Symptoms", "Medications", "Visits", "Daily notes"],
            "last_synced": "just now",
        },
        "next_action": "Call Dr. Patel before the next dose change. Do not change medication without clinical guidance.",
    }


@app.post("/observations", response_model=ObservationResponse)
def observations(req: ObservationRequest) -> ObservationResponse:
    """Save a caregiver's plain-language observation into family memory."""
    bank_id = req.bank_id or get_bank_id()
    try:
        retain(
            bank_id,
            f"Caregiver logged a {req.category}: {req.content.strip()}",
            context=req.category,
            timestamp=datetime.now(timezone.utc),
            metadata={"source": "caregiver dashboard"},
        )
    except Exception as exc:  # noqa: BLE001 - keep a clean API boundary
        raise HTTPException(status_code=503, detail=f"Could not save observation: {exc}")
    return ObservationResponse(
        saved=True,
        category=req.category,
        message="Observation added to Anchor memory.",
    )


@app.get("/brief", response_model=BriefResponse)
def brief(bank_id: str | None = None) -> BriefResponse:
    """Generate a doctor-visit brief from the family's memory."""
    bank_id = bank_id or get_bank_id()
    try:
        meds = recall(bank_id, "current medications and doses", budget="high")
        conditions = recall(bank_id, "diagnoses and conditions", budget="high")
        recent = recall(bank_id, "recent symptoms and observations this week", budget="high")
        providers = recall(bank_id, "doctors and providers and phone numbers", budget="mid")
    except Exception as exc:  # noqa: BLE001 - surface a clean 503, not a raw 500
        raise HTTPException(status_code=503, detail=f"Memory unavailable: {exc}")

    lines = ["# Doctor Visit Brief", ""]
    lines.append("## Current Medications")
    lines += [f"- {m}" for m in meds] or ["- (none recorded)"]
    lines.append("")
    lines.append("## Known Conditions")
    lines += [f"- {c}" for c in conditions] or ["- (none recorded)"]
    lines.append("")
    lines.append("## Recent Observations")
    lines += [f"- {r}" for r in recent] or ["- (none recorded)"]
    lines.append("")
    lines.append("## Care Team")
    lines += [f"- {p}" for p in providers] or ["- (none recorded)"]
    lines.append("")
    lines.append("_Generated by Anchor from the family's persistent Hindsight memory._")
    return BriefResponse(brief="\n".join(lines))
