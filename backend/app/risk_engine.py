from __future__ import annotations

from dataclasses import replace
from math import sqrt

from .data import LiquiditySnapshot
from .models import Contribution

ENGINE_VERSION = "lcr-demo-1.0.0"


def lcr(snapshot: LiquiditySnapshot) -> float:
    return snapshot.hqla / snapshot.net_outflows * 100


def nsfr(snapshot: LiquiditySnapshot) -> float:
    return snapshot.available_stable_funding / snapshot.required_stable_funding * 100


def trailing_z_score(values: list[float], current: float) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((value - mean) ** 2 for value in values) / (len(values) - 1)
    standard_deviation = sqrt(variance)
    return 0.0 if standard_deviation == 0 else (current - mean) / standard_deviation


def decompose_lcr(previous: LiquiditySnapshot, current: LiquiditySnapshot) -> list[Contribution]:
    """Sequentially replace inputs to produce an additive, auditable bridge."""
    steps = [
        ("Wholesale deposit runoff", "wholesale_outflows", "Higher stressed wholesale cash outflows"),
        ("Level 1 HQLA", "level_1_hqla", "Change in the Level 1 liquid-asset buffer"),
        ("Corporate deposits", "corporate_outflows", "Higher stressed corporate deposit outflows"),
        ("Other movements", None, "Retail, secured funding, Level 2 HQLA, and inflows"),
    ]
    working = previous
    contributions: list[Contribution] = []

    for driver, field, detail in steps[:-1]:
        before = lcr(working)
        working = replace(working, **{field: getattr(current, field)})
        contributions.append(Contribution(driver=driver, impact=round(lcr(working) - before, 1), detail=detail))

    # Make the displayed, one-decimal bridge reconcile exactly after rounding.
    total_movement = round(lcr(current) - lcr(previous), 1)
    residual = round(total_movement - sum(item.impact for item in contributions), 1)
    contributions.append(Contribution(driver=steps[-1][0], impact=residual, detail=steps[-1][2]))
    return contributions


def run_wholesale_scenario(snapshot: LiquiditySnapshot, increase_pct: float) -> tuple[float, float, float]:
    baseline = lcr(snapshot)
    additional_outflows = snapshot.wholesale_outflows * increase_pct / 100
    stressed = replace(snapshot, wholesale_outflows=snapshot.wholesale_outflows + additional_outflows)
    return baseline, lcr(stressed), additional_outflows
