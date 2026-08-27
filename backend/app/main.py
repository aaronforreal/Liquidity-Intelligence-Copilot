from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .data import synthetic_snapshots
from .models import (
    Alert,
    AuditMetadata,
    DashboardResponse,
    Evidence,
    HistoryPoint,
    Metric,
    ScenarioRequest,
    ScenarioResponse,
)
from .risk_engine import ENGINE_VERSION, decompose_lcr, lcr, nsfr, run_wholesale_scenario, trailing_z_score

app = FastAPI(title="LiquidityLens Risk Engine", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine_version": ENGINE_VERSION}


@app.get("/api/dashboard", response_model=DashboardResponse)
def dashboard() -> DashboardResponse:
    snapshots = synthetic_snapshots()
    current = snapshots[-1]
    previous = snapshots[-8]
    current_lcr = lcr(current)
    previous_lcr = lcr(previous)
    z_score = trailing_z_score([item.wholesale_outflows for item in snapshots[-31:-1]], current.wholesale_outflows)
    contributions = decompose_lcr(previous, current)
    leading = min(contributions, key=lambda item: item.impact)

    explanation = (
        f"LCR declined {abs(current_lcr - previous_lcr):.1f} percentage points over the week to "
        f"{current_lcr:.1f}%. The primary driver was {leading.driver.lower()} "
        f"({leading.impact:.1f} pp). Wholesale stressed outflows are {z_score:.1f} standard deviations "
        "above their trailing 30-day pattern. The ratio remains above the illustrative 100% minimum, "
        "but the movement warrants analyst review."
    )

    return DashboardResponse(
        as_of=current.date.isoformat(),
        metrics=[
            Metric(label="Liquidity Coverage Ratio", value=round(current_lcr, 1), unit="%", change=round(current_lcr - previous_lcr, 1), status="watch"),
            Metric(label="Net Stable Funding Ratio", value=round(nsfr(current), 1), unit="%", change=-0.3),
            Metric(label="Eligible HQLA", value=round(current.hqla, 1), unit="$B", change=round(current.hqla - previous.hqla, 1), status="watch"),
            Metric(label="30-day net outflows", value=round(current.net_outflows, 1), unit="$B", change=round(current.net_outflows - previous.net_outflows, 1), status="watch"),
        ],
        history=[HistoryPoint(date=item.date.isoformat(), lcr=round(lcr(item), 1), hqla=round(item.hqla, 1), outflows=round(item.net_outflows, 1)) for item in snapshots],
        alert=Alert(
            severity="high",
            title="Wholesale funding outflow anomaly",
            message=f"Stressed wholesale outflows are {z_score:.1f}σ above the trailing 30-day average.",
            z_score=round(z_score, 1),
        ),
        contributions=contributions,
        explanation=explanation,
        evidence=[
            Evidence(id="calc-001", type="calculation", title="LCR calculation trace", excerpt=f"Eligible HQLA ${current.hqla:.1f}B ÷ net 30-day outflows ${current.net_outflows:.1f}B = {current_lcr:.1f}%.", source=f"Synthetic position data · {ENGINE_VERSION}"),
            Evidence(id="reg-001", type="regulation", title="Liquidity Coverage Ratio requirement", excerpt="The LCR compares the stock of high-quality liquid assets with total net cash outflows over a 30-day stress period.", source="OSFI Liquidity Adequacy Requirements guideline · public source placeholder"),
            Evidence(id="disc-001", type="disclosure", title="Public liquidity disclosure", excerpt="Large Canadian banks publicly disclose LCR and NSFR as part of their liquidity risk reporting.", source="Public financial disclosure · source link to be validated before publication"),
        ],
        audit=AuditMetadata(
            request_id=str(uuid4()),
            generated_at=datetime.now(timezone.utc).isoformat(),
            engine_version=ENGINE_VERSION,
            data_classification="Synthetic / public",
            review_status="Analyst review required",
        ),
    )


@app.post("/api/scenarios", response_model=ScenarioResponse)
def scenario(request: ScenarioRequest) -> ScenarioResponse:
    current = synthetic_snapshots()[-1]
    baseline, stressed, additional = run_wholesale_scenario(current, request.wholesale_outflow_increase_pct)
    impact = stressed - baseline
    return ScenarioResponse(
        baseline_lcr=round(baseline, 1),
        stressed_lcr=round(stressed, 1),
        impact=round(impact, 1),
        additional_outflows=round(additional, 1),
        explanation=(
            f"A {request.wholesale_outflow_increase_pct:.0f}% increase in stressed wholesale outflows "
            f"adds ${additional:.1f}B of 30-day outflows and reduces LCR by {abs(impact):.1f} percentage points."
        ),
        formula=f"${current.hqla:.1f}B HQLA ÷ (${current.net_outflows:.1f}B + ${additional:.1f}B) net outflows",
    )
