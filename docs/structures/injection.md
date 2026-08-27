# 注入

`periplus-activate.js` は四つの入口を持ち、注入する内容が入口ごとに違う。

```mermaid
flowchart TD
    ev{{argv の event}}
    ev -->|install| ins[settings.json にステータスラインを書く]
    ev -->|criteria| crit[criteria 表を stdout に出す]
    ev -->|SessionStart| ensure
    ev -->|SubagentStart| ensure

    ensure[".periplus/ と config.json を用意する"] --> ctx[規律 + log の件数]
    ctx -->|SessionStart| s1["+ pre.csv の未処理件数<br>+ ステータスライン案内<br>生の stdout"]
    ctx -->|SubagentStart| s2["hookSpecificOutput の封筒"]
```

| | SessionStart | SubagentStart |
| --- | --- | --- |
| phase 1 の規律 | ○ | ○ |
| `log.csv` の件数 | ○ | ○ |
| `pre.csv` の未処理件数 | ○ | × |
| ステータスライン案内 | ○ | × |
| 出力形式 | 生の stdout | `hookSpecificOutput` |

`install` と `criteria` は `.periplus/` に触れない。作業場の用意が失敗しても規律は注入される。

## Meaning
- [CONTEXT.md#pre-comment](../ubiquitous/CONTEXT.md#pre-comment) — pre-comment
- [CONTEXT.md#periplus](../ubiquitous/CONTEXT.md#periplus) — periplus

## Decisions
- [ADR 0036](../adr/0036-phase-1-belongs-to-the-hook.md) — phase 1 はフックが持つ
- [ADR 0007](../adr/0007-inject-only-the-capture-rule.md) — 注入するのは捕獲の規律だけ
- [ADR 0028](../adr/0028-subagents-get-the-discipline-not-the-parents-backlog.md) — サブエージェントに親の未処理は渡さない
- [ADR 0011](../adr/0011-ask-for-the-status-line-never-install-it-unasked.md) — ステータスラインは頼まれない限り入れない
