# 捕獲から行き先まで

コードを書いている間の捕獲と、書き終えた後の濾過。

```mermaid
flowchart TD
    hook[SessionStart フック] -->|phase 1 の規律を注入| write[コードを書く]
    write -->|コメントの代わりに追記| pre[(.periplus/pre.csv)]
    existing[既存のコメント] --> refactor["/pp-refactor"]
    refactor --> pre

    pre --> classify["/pp-classify: 各行に kind を一つ"]
    classify --> resolve["/pp-resolve: kind を行き先へ"]

    resolve -->|code| src[ソースのコメント]
    resolve -->|periplus| log[(.periplus/log.csv)]
    resolve -->|drop| gone[どこにも書かない]
    resolve -->|全行| archive[(.periplus/all.csv)]
```

`/pp` は `/pp-classify` と `/pp-resolve` をこの順で続けて呼ぶ。
`log.csv` から先は [log の行き先](discuss.md)。

## Meaning
- [CONTEXT.md#pre-comment](../L4_ubiquitous/CONTEXT.md#pre-comment)
- [CONTEXT.md#periplus](../L4_ubiquitous/CONTEXT.md#periplus)

## Decisions
- [ADR 0036](../L5_adr/0036-phase-1-belongs-to-the-hook.md) — phase 1 はフックが持つ
- [ADR 0006](../L5_adr/0006-capture-first-filter-last.md) — 先に捕獲し、最後に濾す
- [ADR 0016](../L5_adr/0016-classify-and-resolve-are-separate-commands.md) — classify と resolve を分ける
- [ADR 0033](../L5_adr/0033-pp-runs-all-three-and-the-capture-rule-is-a-skill.md) — `/pp` が続けて呼ぶ
- [ADR 0015](../L5_adr/0015-one-archive-in-the-workspace.md) — 保管は一つ
- [ADR 0018](../L5_adr/0018-sweeps-archive-separately.md) — sweep は別に保管する
- [ADR 0017](../L5_adr/0017-refactor-cuts-instead-of-copying.md) — `/pp-refactor` は複製ではなく切り出す
