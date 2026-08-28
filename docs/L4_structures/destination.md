# destination

```ebnf
destination = "code" | "periplus" | "drop" ;
```

## Meaning
- [CONTEXT.md#criterion](../L4_ubiquitous/CONTEXT.md#criterion)

## Decisions
- [ADR 0003](../L5_adr/0003-periplus-is-a-state-not-a-category.md)
    - periplus を内容の種類ではなく状態として立てる
- [ADR 0002](../L5_adr/0002-configurable-criteria.md)
    - 行き先を設定で切り替える
- [ADR 0014#mechanised-resolution](../L5_adr/0014-the-set-of-kinds-is-closed.md#mechanised-resolution)
    - 切り替えられるのは行き先だけとし、解決を機械化する
- [ADR 0027](../L5_adr/0027-config-json-is-the-authority-for-destinations.md)
    - `config.json` が唯一の権威
