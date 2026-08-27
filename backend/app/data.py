from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class LiquiditySnapshot:
    date: date
    level_1_hqla: float
    level_2_hqla: float
    wholesale_outflows: float
    corporate_outflows: float
    retail_outflows: float
    secured_outflows: float
    inflows: float
    available_stable_funding: float
    required_stable_funding: float

    @property
    def hqla(self) -> float:
        return self.level_1_hqla + self.level_2_hqla

    @property
    def gross_outflows(self) -> float:
        return (
            self.wholesale_outflows
            + self.corporate_outflows
            + self.retail_outflows
            + self.secured_outflows
        )

    @property
    def net_outflows(self) -> float:
        capped_inflows = min(self.inflows, self.gross_outflows * 0.75)
        return self.gross_outflows - capped_inflows


def synthetic_snapshots() -> list[LiquiditySnapshot]:
    """Return reproducible daily fixtures with a deliberate final-week event."""
    start = date(2026, 7, 23)
    snapshots: list[LiquiditySnapshot] = []

    for day in range(35):
        weekly = (day % 7) - 3
        drift = day * 0.03
        snapshots.append(
            LiquiditySnapshot(
                date=start + timedelta(days=day),
                level_1_hqla=188.5 - drift + weekly * 0.12,
                level_2_hqla=34.1 - drift * 0.15,
                wholesale_outflows=82.0 + weekly * 1.20,
                corporate_outflows=47.5 + weekly * 0.10,
                retail_outflows=36.2 + weekly * 0.06,
                secured_outflows=19.0,
                inflows=9.4 + weekly * 0.04,
                available_stable_funding=612.0 + drift,
                required_stable_funding=518.5 + drift * 0.4,
            )
        )

    # Pin the weekly comparison point, then introduce a controlled final-day event.
    weekly_comparison = snapshots[-8]
    snapshots[-8] = LiquiditySnapshot(
        date=weekly_comparison.date,
        level_1_hqla=188.1,
        level_2_hqla=33.9,
        wholesale_outflows=82.0,
        corporate_outflows=48.0,
        retail_outflows=36.7,
        secured_outflows=17.0,
        inflows=9.4,
        available_stable_funding=612.8,
        required_stable_funding=518.8,
    )

    # A controlled event makes the demo investigation deterministic and obvious.
    latest = snapshots[-1]
    snapshots[-1] = LiquiditySnapshot(
        date=latest.date,
        level_1_hqla=184.2,
        level_2_hqla=33.4,
        wholesale_outflows=87.8,
        corporate_outflows=46.0,
        retail_outflows=35.6,
        secured_outflows=16.0,
        inflows=9.1,
        available_stable_funding=611.8,
        required_stable_funding=520.2,
    )
    return snapshots
