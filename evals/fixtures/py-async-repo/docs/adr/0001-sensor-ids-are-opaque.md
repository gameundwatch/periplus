# Sensor ids are opaque to this module

The ids look like `site-rack-slot` today and every few months a site is
renumbered. Parsing them here would make this module fail on a naming change it
has no stake in, so ids travel through as strings and grouping happens in the
caller, which owns the site layout.

## Considered Options

- **Parse the id into site and rack** — would let the module group results
  itself, at the cost of breaking every time operations renames a site.
