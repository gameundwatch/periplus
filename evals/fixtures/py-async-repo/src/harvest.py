import requests

API_ROOT = "https://api.example-metrics.com/v1"


# The metrics API answers with the reading it holds at request time; there is no
# way to ask for a snapshot, so two series fetched a second apart are not aligned.
def fetch_series(session, sensor_id):
    response = session.get(
        f"{API_ROOT}/series/{sensor_id}",
        headers={"Accept": "application/json"},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["points"]


def fetch_all(sensor_ids):
    with requests.Session() as session:
        return {sid: fetch_series(session, sid) for sid in sensor_ids}
