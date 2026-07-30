# SKU is the join key, not the internal product id

The warehouse knows nothing about our product ids, and the mapping between the
two lives in a table that is edited by hand. Joining on the internal id would
mean every stock lookup depends on that table being correct on the day, so the
SKU travels through this module unchanged and the mapping happens above it.

## Considered Options

- **Resolve the internal id inside the client** — fewer arguments at the call
  site, but a stale mapping row would silently return another product's stock.
