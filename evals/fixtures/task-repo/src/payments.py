import requests

API_ROOT = "https://api.example-psp.com/v2"


def charge(account_id, amount_cents, idempotency_key):
    response = requests.post(
        f"{API_ROOT}/charges",
        json={"account": account_id, "amount": amount_cents},
        headers={"Idempotency-Key": idempotency_key},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["charge_id"]
