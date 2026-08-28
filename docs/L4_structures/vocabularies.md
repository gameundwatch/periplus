# 二つの行き先語彙

行き先を表す語は二組あり、別の段に属する。同じ綴りが両方に現れる。

```mermaid
flowchart LR
    subgraph v1["criteria — kind から機械が引く"]
        k[kind] --> c1[code]
        k --> p1[periplus]
        k --> d1[drop]
    end

    subgraph v2["/pp-discuss — 一件ずつ合意で決める"]
        e[log の一件] --> c2[code]
        e --> doc2[docs]
        e --> h2[here]
        e --> t2[trash]
    end

    p1 --> e
```

| | criteria | /pp-discuss |
| --- | --- | --- |
| 決めるもの | kind | 記述一件 |
| 決め方 | [`config.json` から機械が引く](../L5_adr/0027-config-json-is-the-authority-for-destinations.md) | 提案し、同意を待つ |
| 行き先 | `code` `periplus` `drop` | `code` `docs` `here` `trash` |

`code` は両方にある。criteria の `code` は kind ごと送る。`/pp-discuss` の [`code`](../L4_ubiquitous/code.md) は
一件から該当部分だけを切り出す救済路で、主経路ではない。

`drop` と [`trash`](../L4_ubiquitous/trash.md) は同じ行為で、段が違う。[`periplus`](../L4_ubiquitous/periplus.md) は criteria の行き先であり、
`/pp-discuss` の入口である。[`here`](../L4_ubiquitous/here.md) はそこに留まること。

## Meaning
- [criterion](../L4_ubiquitous/criterion.md)
- [code](../L4_ubiquitous/code.md)
- [here](../L4_ubiquitous/here.md)

## Decisions
- [ADR 0003](../L5_adr/0003-periplus-is-a-state-not-a-category.md)
    - periplus を状態として立てる
- [ADR 0020#per-repository](../L5_adr/0020-the-log-drains-into-whatever-documents-the-repository-keeps.md#per-repository)
    - `/pp-discuss` の行き先はリポジトリごとに違う
- [ADR 0027](../L5_adr/0027-config-json-is-the-authority-for-destinations.md)
    - criteria の行き先は `config.json` が決める
- [ADR 0031](../L5_adr/0031-the-skills-hold-instructions-and-the-adrs-hold-the-reasons.md)
    - 二語彙の同居が誤読を生んだ記録
