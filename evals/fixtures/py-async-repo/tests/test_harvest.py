from unittest.mock import MagicMock

from src.harvest import fetch_series


def test_fetch_series_returns_points():
    session = MagicMock()
    session.get.return_value.json.return_value = {"points": [1, 2, 3]}
    assert fetch_series(session, "s-1") == [1, 2, 3]
