# The caller supplies the idempotency key

The payment provider deduplicates on the idempotency key, so whoever knows the
business meaning of "the same charge" has to choose it. Generating the key inside
`charge()` would make every retry a fresh charge, which is precisely the failure
the key exists to prevent. The key is therefore a required argument rather than
something the module derives.

## Considered Options

- **Derive the key from account and amount** — convenient, but two legitimate
  identical charges a minute apart would silently collapse into one.
