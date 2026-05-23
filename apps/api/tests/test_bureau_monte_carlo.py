"""Monte Carlo distribution unit tests."""

from __future__ import annotations

from apps.api.services.bureau.monte_carlo import _championship_odds, _distribution, _sample_score


def test_distribution_from_multiple_weeks():
    d = _distribution([12.0, 18.0, 15.0, 20.0, 9.0])
    assert d["mean"] == 14.8
    assert d["floor"] == 9.0
    assert d["ceiling"] == 20.0
    assert d["games"] == 5
    assert d["stddev"] > 0


def test_distribution_single_week():
    d = _distribution([16.0])
    assert d["mean"] == 16.0
    assert d["games"] == 1


def test_distribution_empty():
    d = _distribution([])
    assert d["mean"] == 0.0
    assert d["games"] == 0


def test_sample_score_clamps():
    for _ in range(50):
        s = _sample_score(15.0, 5.0, 5.0, 25.0)
        assert 5.0 <= s <= 25.0


def test_championship_odds_favors_stronger_roster():
    weak = [{"mean": 8.0, "stddev": 2.0, "floor": 4.0, "ceiling": 12.0}]
    strong = [{"mean": 20.0, "stddev": 3.0, "floor": 10.0, "ceiling": 30.0}] * 3
    odds = _championship_odds({1: weak, 2: strong}, sims=500)
    assert odds[2] > odds[1]
    assert abs(sum(odds.values()) - 100.0) < 1.0
