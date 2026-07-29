# periplus は Skill 単体ではなく plugin + SessionStart hook として実装する

periplus の規律は「コメントを書きたくなったすべての瞬間」に効く必要があるが、Skill
はモデルが呼ぶべきだと判断したときにしか読まれないため、常時効く規律を Skill で表現
することは原理的にできない。ponytail の実装を確認したところ、常時オンの正体は
`SessionStart` (startup|resume|clear|compact) と `SubagentStart` によるルール全文の
コンテキスト注入であり、`PostToolUse` によるコード検査は一切使っていなかった。
periplus も同じ構造を採り、常時注入される規律と、明示呼び出しの Skill(日誌の棚卸し・
ADR 昇格)の2枚組にする。

## Considered Options

- **プロジェクト `CLAUDE.md`** — hook もプラグインも不要でファイル1枚。ただし配布でき
  ず、サブエージェントへの到達も保証されない。
- **`~/.claude/CLAUDE.md`** — 自分の全プロジェクトに効くが、日誌を持たないリポでも規律
  が発火してノイズになる。
- **output style** — 常時適用されるが応答スタイルと排他になり、ponytail と併用できない。

配布可能性とサブエージェントへの到達を優先し、plugin 形態を選んだ。

## Consequences

hook はインストールした全プロジェクトで発火するため、periplus を使わないリポでの
挙動を別途決める必要がある(規律の有効化条件)。ponytail は規律が自己完結している
ためこの問題を持たないが、periplus は日誌ファイルという外部の実体に依存する。
