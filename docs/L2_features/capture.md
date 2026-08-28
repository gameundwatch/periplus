# capture — 書いている間に溜める

コードを書いている間、コメントを書こうとするたびに、ソースではなく `.periplus/pre.csv`
へ送る。利用者が起動するものではなく、セッション開始時に自動で有効になる。

## できること

- 書く手を止めずに、思いついた記述をその場に残せる
- 迷った記述も捨てずに済む。要否は後でまとめて決める
- ソースがコメントで埋まらない

## Contract
- [completion-unit](../L3_spec/completion-unit.md)
    - 何を書き終えたら濾すか
- [capture](../L3_spec/capture.md)
    - phase 1 が何を書き、何を書かないか
- [hook](../L3_spec/hook.md)
    - 規律がどう届くか

## Design
- [二相の構え](../L3_design/phases.md)
    - なぜ判断を後段に集めるか
