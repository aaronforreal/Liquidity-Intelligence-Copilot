from typing import Literal

from pydantic import BaseModel, Field


class Metric(BaseModel):
    label: str
    value: float
    unit: str
    change: float | None = None
    status: Literal["healthy", "watch", "critical"] = "healthy"


class HistoryPoint(BaseModel):
    date: str
    lcr: float
    hqla: float
    outflows: float


class Contribution(BaseModel):
    driver: str
    impact: float
    detail: str


class Alert(BaseModel):
    severity: Literal["high", "medium", "low"]
    title: str
    message: str
    z_score: float


class Evidence(BaseModel):
    id: str
    type: Literal["calculation", "regulation", "disclosure"]
    title: str
    excerpt: str
    source: str


class AuditMetadata(BaseModel):
    request_id: str
    generated_at: str
    engine_version: str
    data_classification: str
    review_status: str


class DashboardResponse(BaseModel):
    as_of: str
    metrics: list[Metric]
    history: list[HistoryPoint]
    alert: Alert
    contributions: list[Contribution]
    explanation: str
    evidence: list[Evidence]
    audit: AuditMetadata


class ScenarioRequest(BaseModel):
    wholesale_outflow_increase_pct: float = Field(10, ge=0, le=100)


class ScenarioResponse(BaseModel):
    baseline_lcr: float
    stressed_lcr: float
    impact: float
    additional_outflows: float
    explanation: str
    formula: str
