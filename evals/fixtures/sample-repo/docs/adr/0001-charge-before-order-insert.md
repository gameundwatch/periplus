# Charge the card before inserting the order

An order row that exists without a successful charge is harder to reconcile than
a charge without an order row, because support can refund an orphan charge but
cannot tell an unpaid order from a fulfilment backlog. Checkout therefore charges
first and inserts the order only after the charge succeeds, accepting that a
crash between the two leaves a charge to be reconciled by hand.

## Considered Options

- **Insert the order first, charge after** — reads more naturally and keeps the
  order id available for the payment metadata, but produces unpaid order rows
  that are indistinguishable from a stuck queue.
- **Push the order onto a queue and drain it asynchronously** — decouples the two
  writes, at the cost of a failure mode with no owner on call.
