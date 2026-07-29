from unittest.mock import patch

from src.payments import charge


def test_charge_returns_charge_id():
    with patch("src.payments.requests.post") as post:
        post.return_value.json.return_value = {"charge_id": "ch_1"}
        assert charge("acct_1", 500, "key_1") == "ch_1"
