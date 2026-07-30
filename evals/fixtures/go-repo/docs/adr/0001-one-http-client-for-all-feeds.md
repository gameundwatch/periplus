# One http.Client is shared by every feed

The aggregator talks to a few dozen hosts and reconnects to each of them on a
schedule. A client per call would throw away the connection pool between calls,
which on this workload is most of the cost, so the client is passed in rather
than constructed inside `Fetch`.

## Considered Options

- **Construct a client per call** — no shared state to reason about, but every
  fetch pays a fresh TLS handshake against a host it just spoke to.
