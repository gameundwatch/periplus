# config.json

`.periplus/config.json` が保証するキーは [`criteria`](../ubiquitous/CONTEXT.md#criterion) 一つ。

```json
{
  "criteria": {
    "<kind>": "<destination>"
  }
}
```

`<kind>` は [kind](kind.md)、`<destination>` は [destination](destination.md)。

- 無ければ作られる。既にあれば、欠けている `kind` だけが既定値で追記される
- `criteria` 以外のキーは触られずに残る
- 知らない `kind` と、行き先でない値は、そのキーだけが無視される。ファイル全体は適用される
- 追跡しない。チームで揃えたい場合は手で配る

`warnThreshold` と `updated` は廃止済みで、書いても効かない。

## Meaning
- [CONTEXT.md#criterion](../ubiquitous/CONTEXT.md#criterion)

## Decisions
- [ADR 0027](../adr/0027-config-json-is-the-authority-for-destinations.md) — 行き先の唯一の権威であり、無ければ作られる
- [ADR 0014#mechanised-resolution](../adr/0014-the-set-of-kinds-is-closed.md#mechanised-resolution) — 解決は機械が行う
- [ADR 0009](../adr/0009-the-workspace-is-untracked-in-full.md) — config も含めて追跡しない
- [ADR 0023#no-warn-threshold](../adr/0023-the-log-is-evidence-for-writing-a-document.md#no-warn-threshold) — `warnThreshold` を廃止
- [ADR 0023#no-updated-column](../adr/0023-the-log-is-evidence-for-writing-a-document.md#no-updated-column) — `updated` を廃止
