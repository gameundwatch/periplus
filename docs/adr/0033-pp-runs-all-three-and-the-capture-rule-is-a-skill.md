# `/pp` は三つ全部を通す。捕捉規則は skill になる

## `/pp` が phase 2 だけになっていた

v0.6.1 まで `skills/pp/SKILL.md` は捕捉規則を本文に含んでいた。`/pp` を呼べばファイル全体が
読まれ、phase 1 も一緒に入っていた。README(98bdc50) はそれをこう書いている。

```
- `/pp` — the discipline itself, applied on demand: capture while implementing,
  filter when the code is done. Phase 2 is `/pp-classify` then `/pp-resolve`, and
  `/pp` is both. The session hook normally handles phase 1 for you; invoke `/pp`
  when the hook is not active, in a subagent that did not inherit it, or to
  re-anchor mid-session.
```

v0.7.1 が捕捉規則を `skills/pp/CAPTURE.md` に出したとき、`/pp` は phase 2 だけになった。
**この変更はどこにも記録されていない。** ADR 0032 は「`/pp` は phase 2 であって、捕捉はしない」を
前提として書いているが、それは v0.7.1 が作った状態であって、それ以前の事実ではない。0032 が
扱ったのは重複の解消であり、`/pp` の意味が変わったことは扱っていない。

`skills/pp/SKILL.md` の description は古い約束を残したままだった — 「hook が効いていないときに
`/pp` を呼べ」。呼んでも捕捉規則は入らないので、偽である。

**この ADR が存在する理由の半分は、記録されなかった変更を記録することにある。** 版を分けたのは
軸が違うからだったが(ADR 0031)、軸が違うことは意味が変わったことを書かなくてよい理由にならない。

## 決めたこと

`/pp` は `/pp-capture` → `/pp-classify` → `/pp-resolve` を通す。名前が periplus そのものである
以上、覆うのは規律の全体である。

捕捉規則は `skills/pp-capture/SKILL.md` になる。`skills/` の下で skill でない唯一のファイルが
消え、`/pp` から呼べるようになる。注入される本文は変えない — hook は frontmatter を剥がして
読む。

## `disable-model-invocation` は付けない

付ければモデルの skill 一覧から消え、description の固定費がゼロになる。実際に効くことは
`~/.claude/skills/grill-me` と `grill-with-docs` で確認できる — どちらも一覧に出ず、`Skill`
ツールからの呼び出しが拒否される。

**それを付けると `/pp` から呼べない。**塞ぐのは Skill ツールであり、`/pp` の第一段がそこを通る。

当初は付ける案を採っていた。理由は、呼べる名前を与えると phase 1 が「常時オン」から「必要なとき
に呼ぶもの」に読み替えられうる、というものだった。これは順序が逆である。**単体で呼ばれることの
ほうが想定外で、`/pp` の部品として呼ばれることが本来の用途である。**単体呼び出しを塞ぐために
本来の用途を塞いでいた。

## Considered Options

- **`skills/pp/SKILL.md` に捕捉規則を再掲する** — `/pp` は三つを覆えるが、v0.7.1 が消した
  1,635 字の重複が `/pp` のたびに戻り、文言が二箇所に存在する状態に戻る
- **`/pp` が `skills/pp-capture/SKILL.md` を Read する** — `disable-model-invocation` を残したまま
  三段を通せる。塞がるのは Skill ツールだけで Read は通る。ただし三つのうち一つだけ呼び方が
  違う状態が残り、その理由は「単体呼び出しを塞ぐため」でしかない
- **`CAPTURE.md` のまま `skills/pp/` に置く**(v0.7.1 の形) — ファイルが増えない。`skills/` の下に
  skill でないファイルが一つ残り、`/pp` からは呼べない

## Consequences

`/pp` の description が再び真になる — hook が効いていないとき、それを継がなかったサブエージェント
で、`/pp` を呼べば捕捉規則が入る。実際の穴は狭い。hook は `SessionStart(startup|resume|clear|
compact)` と `SubagentStart` で撃つので、compact もサブエージェントも覆われている。

**`/pp-capture` の description が毎セッションの skill 一覧に載る。** periplus の五つの合計は
2,556 字で、注入される捕捉規則 1,635 字より大きい。六つ目が加わる。この固定費は v0.7.3 が扱う。

モデルが `/pp` と無関係に `/pp-capture` を呼べるようになった。description に「`/pp` の第一段」と
書いてあるだけで、機構では止まらない。ADR 0012 の線どおり、文言で頼んで機構で強制しない。

**`/pp` が三段を名指ししていることを見るテストは無い。** v0.7.1 の変更が通ったのはそのためで、
この版もその穴を塞いでいない。次に同じ壊れ方をしたとき、落ちるものは何も無い。
