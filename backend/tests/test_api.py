from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_dashboard_contract_exposes_grounded_investigation() -> None:
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    payload = response.json()
    assert payload["metrics"][0]["value"] == 123.4
    assert round(sum(item["impact"] for item in payload["contributions"]), 1) == payload["metrics"][0]["change"]
    assert {item["type"] for item in payload["evidence"]} == {"calculation", "regulation", "disclosure"}
    assert payload["audit"]["review_status"] == "Analyst review required"


def test_scenario_endpoint_recalculates_and_validates_input() -> None:
    response = client.post("/api/scenarios", json={"wholesale_outflow_increase_pct": 10})
    assert response.status_code == 200
    payload = response.json()
    assert payload["stressed_lcr"] < payload["baseline_lcr"]
    assert payload["additional_outflows"] > 0

    invalid = client.post("/api/scenarios", json={"wholesale_outflow_increase_pct": 101})
    assert invalid.status_code == 422
