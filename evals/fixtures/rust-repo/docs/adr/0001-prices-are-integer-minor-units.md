# Prices are integer minor units, never floats

Two quotes that differ by one minor unit decide whether an order fills, and a
binary float cannot hold every such value exactly. Every price in this crate is
an `i64` count of the venue's minor unit, and the conversion to a display string
happens at the edge.

## Considered Options

- **`f64` with rounding at comparison time** — simpler arithmetic, but the
  rounding rule then has to be identical in every place a comparison happens.
