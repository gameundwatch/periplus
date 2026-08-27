# kind

```ebnf
kind = "contracts" | "external-facts" | "current-limits"
     | "upgrade-triggers" | "tautology" | "test-intent"
     | "doc-restatement" | "undocumented-design"
     | "unspecified-choices" | "rejected-alternatives" | "why"
     | "label" | "default" ;
```

## Meaning
- [CONTEXT.md#kind](../ubiquitous/CONTEXT.md#kind)

## Decisions
- [ADR 0014#closed-set](../adr/0014-the-set-of-kinds-is-closed.md#closed-set) — 集合を閉じる
- [ADR 0004](../adr/0004-deliberate-deviation-is-not-a-criterion.md) — `deliberate-deviation` を外す
- [ADR 0022](../adr/0022-a-kind-for-choices-the-design-did-not-specify.md) — `unspecified-choices` を足す
- [ADR 0029#doc-restatement](../adr/0029-a-reason-is-sorted-by-who-decided-it-and-what-records-it.md#doc-restatement) — `doc-references` を `doc-restatement` に改名
- [ADR 0029#why-residual](../adr/0029-a-reason-is-sorted-by-who-decided-it-and-what-records-it.md#why-residual) — `undocumented-design` を足し、`why` を残余にする
- [ADR 0035#default](../adr/0035-the-tree-classifies-and-the-table-only-names.md#default) — `history` を落とし、`default` を足す
- [ADR 0035#label](../adr/0035-the-tree-classifies-and-the-table-only-names.md#label) — `block-headings` を `label` に改名
