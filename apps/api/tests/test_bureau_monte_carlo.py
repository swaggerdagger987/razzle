"""Monte Carlo distribution unit tests."""

from __future__ import annotations

from apps.api.services.bureau.monte_carlo import _distribution


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
