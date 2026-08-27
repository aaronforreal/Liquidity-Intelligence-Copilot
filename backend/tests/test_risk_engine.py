from dataclasses import replace

import pytest

from app.data import synthetic_snapshots
from app.risk_engine import decompose_lcr, lcr, run_wholesale_scenario


def test_lcr_uses_hqla_over_capped_net_outflows() -> None:
    snapshot = synthetic_snapshots()[-1]
    expected = snapshot.hqla / (snapshot.gross_outflows - snapshot.inflows) * 100
    assert lcr(snapshot) == expected


def test_higher_wholesale_outflows_reduce_lcr() -> None:
    snapshot = synthetic_snapshots()[-1]
    baseline, stressed, additional = run_wholesale_scenario(snapshot, 10)
    assert additional == snapshot.wholesale_outflows * 0.1
    assert stressed < baseline


def test_contribution_bridge_reconciles_to_total_movement() -> None:
    snapshots = synthetic_snapshots()
    previous = snapshots[-8]
    current = snapshots[-1]
    contributions = decompose_lcr(previous, current)
    assert round(sum(item.impact for item in contributions), 1) == round(lcr(current) - lcr(previous), 1)


def test_inflow_cap_is_applied() -> None:
    snapshot = synthetic_snapshots()[-1]
    high_inflow = replace(snapshot, inflows=snapshot.gross_outflows)
    assert high_inflow.net_outflows == pytest.approx(high_inflow.gross_outflows * 0.25)
