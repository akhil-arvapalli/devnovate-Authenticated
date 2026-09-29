"""Regression tests for the FastAPI endpoints (agent/main.py).

Uses Starlette's TestClient (httpx) with the Hindsight memory boundary mocked.
"""
from unittest.mock import patch

from fastapi.testclient import TestClient

from agent.main import app

client = TestClient(app)


class TestHealth:
    def test_health_returns_ok(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestChat:
    def test_chat_returns_answer_and_risk(self):
        with patch("agent.main.catch") as mock_catch, \
             patch("agent.main.run_loop") as mock_loop:
            mock_catch.return_value = {"risk": True, "reason": "interaction",
                                       "evidence": ["Warfarin 5mg daily"]}
            mock_loop.return_value = {"answer": "Call the doctor.", "risk": True,
                                      "risk_reason": "interaction"}
            resp = client.post("/chat", json={"message": "Mom is dizzy"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["answer"] == "Call the doctor."
        assert body["risk"] is True
        assert body["risk_reason"] == "interaction"
        assert body["evidence"] == ["Warfarin 5mg daily"]

    def test_catch_risk_merged_when_loop_misses_it(self):
        """Catch engine finds a risk the loop didn't -> merged into response."""
        with patch("agent.main.catch") as mock_catch, \
             patch("agent.main.run_loop") as mock_loop:
            mock_catch.return_value = {"risk": True, "reason": "blood thinner",
                                       "evidence": []}
            mock_loop.return_value = {"answer": "ok", "risk": False,
                                      "risk_reason": None}
            resp = client.post("/chat", json={"message": "Mom is dizzy"})
        body = resp.json()
        assert body["risk"] is True
        assert body["risk_reason"] == "blood thinner"

    def test_chat_rejects_empty_message(self):
        """Boundary validation: empty message -> 422, not a downstream crash."""
        resp = client.post("/chat", json={"message": ""})
        assert resp.status_code == 422

    def test_chat_rejects_oversized_message(self):
        """Boundary validation: >2000 chars -> 422 (LLM context protection)."""
        resp = client.post("/chat", json={"message": "x" * 2001})
        assert resp.status_code == 422

    def test_catch_failure_degrades_to_loop_result(self):
        """Catch engine raising -> chat still returns the loop result."""
        with patch("agent.main.catch", side_effect=RuntimeError("boom")), \
             patch("agent.main.run_loop") as mock_loop:
            mock_loop.return_value = {"answer": "ok", "risk": False,
                                      "risk_reason": None}
            resp = client.post("/chat", json={"message": "Mom is dizzy"})
        assert resp.status_code == 200
        assert resp.json()["risk"] is False


class TestDashboard:
    def test_dashboard_returns_care_snapshot(self):
        resp = client.get("/dashboard")
        assert resp.status_code == 200
        body = resp.json()
        assert body["patient"]["name"] == "Margaret Chen"
        assert body["patient"]["age"] == 78
        assert body["attention"]
        assert body["timeline"]
        assert body["metrics"]["latest_bp"] == "165/92"
        assert len(body["medications"]) >= 4


class TestObservation:
    def test_observation_is_retained_and_returned(self):
        with patch("agent.main.retain") as mock_retain:
            resp = client.post(
                "/observations",
                json={"content": "Margaret slept well and ate breakfast.",
                      "category": "daily note"},
            )
        assert resp.status_code == 200
        assert resp.json()["saved"] is True
        assert resp.json()["category"] == "daily note"
        mock_retain.assert_called_once()

    def test_observation_rejects_blank_content(self):
        resp = client.post("/observations", json={"content": "  "})
        assert resp.status_code == 422


class TestBrief:
    def test_brief_renders_sections_from_memory(self):
        with patch("agent.main.recall") as mock_recall:
            mock_recall.side_effect = [
                ["Warfarin 5mg once daily"],
                ["atrial fibrillation"],
                ["BP 165/92, dizzy"],
                ["Dr. Patel, Cardiologist"],
            ]
            resp = client.get("/brief")
        assert resp.status_code == 200
        brief = resp.json()["brief"]
        assert "# Doctor Visit Brief" in brief
        assert "- Warfarin 5mg once daily" in brief
        assert "- BP 165/92, dizzy" in brief
        assert "- Dr. Patel, Cardiologist" in brief

    def test_brief_renders_placeholders_for_empty_memory(self):
        """Empty memory -> '(none recorded)' placeholders, not blank sections."""
        with patch("agent.main.recall", return_value=[]):
            resp = client.get("/brief")
        assert resp.status_code == 200
        assert "(none recorded)" in resp.json()["brief"]

    def test_brief_returns_503_when_memory_unavailable(self):
        """Hindsight down -> clean 503 with detail, not a raw 500."""
        with patch("agent.main.recall", side_effect=ConnectionError("down")):
            resp = client.get("/brief")
        assert resp.status_code == 503
        assert "Memory unavailable" in resp.json()["detail"]
