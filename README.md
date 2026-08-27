# LiquidityLens

LiquidityLens is an experimental, AI-assisted liquidity risk analysis platform. It explores how deterministic analytics, anomaly detection, and grounded explanations can support second-line liquidity risk oversight at a large financial institution.

> **Demonstration using synthetic data. No RBC proprietary data is used.** This is an independent portfolio project inspired by the RBC GRM-BSLR Data & AI Intern opportunity. It is not affiliated with or endorsed by RBC.

## The demo story

The prototype is deliberately organized around one workflow a reviewer can understand in under a minute:

1. The dashboard flags an unusual increase in stressed wholesale funding outflows.
2. The analyst opens an investigation and sees a deterministic decomposition of the weekly LCR movement.
3. A grounded narrative explains the verified calculation outputs and links each claim to evidence.
4. The analyst runs a `+10%` wholesale runoff scenario and sees the recalculated LCR.
5. The governance view shows how synthetic data, calculation traces, human review, and audit records constrain the system.

The explanation layer never calculates liquidity metrics. Python does that first; the narrative is constructed only from the resulting typed evidence.

## Architecture

```text
Synthetic portfolio data
          |
          v
FastAPI deterministic risk engine ----> anomaly detection
          |                                      |
          +---------------+----------------------+
                          v
                verified investigation
                          |
                          v
           grounded narrative + evidence
                          |
                          v
                 Next.js analyst UI
```

## Run locally

Requirements: Node.js 20+, Python 3.11+.

Backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend, in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. If the API is unavailable, the interface uses a bundled, deterministic demo snapshot so the portfolio walkthrough still works.

## API

- `GET /api/dashboard` — current metrics, history, alert, contribution analysis, evidence, and audit metadata
- `POST /api/scenarios` — recalculate LCR for a wholesale-outflow shock
- `GET /health` — service health

Interactive API documentation is available at `http://localhost:8000/docs`.

## Responsible AI controls

| Control | MVP implementation |
| --- | --- |
| Privacy and security | Synthetic data and public-source metadata only |
| Hallucination control | Narratives are generated from a typed calculation result, not raw balances |
| Explainability | Contribution decomposition and formula-level calculation trace |
| Accountability | Explicit analyst-review state; no automated risk decision |
| Monitoring | Request ID, engine version, timestamp, and deterministic audit metadata |
| Reproducibility | Seeded fixture data and a versioned calculation engine |

## Technical decisions

- **One vertical slice over three shallow products.** Regulatory intelligence is represented by a cited evidence card; a full vector database is a later phase.
- **No API key required.** The MVP remains dependable during a live demo. A real LLM can later paraphrase the same verified evidence contract.
- **Transparent anomaly detection.** A trailing z-score is easier to defend in an interview than an opaque model for this small synthetic dataset.
- **In-memory fixtures first.** PostgreSQL, authentication, and production observability are intentionally deferred.

## Limitations and next steps

This is not a regulatory calculator, production risk system, or representation of any bank's methodology. LCR assumptions are simplified for demonstration. The next useful additions would be a validated rule configuration, document ingestion with page-level citations, persisted audit events, model evaluations, and role-based access—not more dashboard widgets.
