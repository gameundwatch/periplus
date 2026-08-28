# pp-classify — 各行に kind を一つ与える

## 観測できること

- **読む** — `.periplus/pre.csv` だけ。`.periplus/config.json` は読まない
- **書く** — 同じファイルの四番目の欄だけ。他の欄も他のファイルも変えない
- **割る** — [kind](../L4_ubiquitous/CONTEXT.md#kind) が一つに定まる最小単位まで割る。
  割った行は元の一行を置き換えるので、行数は増えることがある
- **再実行** — 既に kind を持つ行には触らない
- **順序** — 名前を付ける前に割る

## 発火しない条件

ファイルが無いか、四番目の欄が空の行が無いとき。`Nothing to classify.` と報告して止まる。

## 確認

- `.periplus/pre.csv` の全行の四番目が埋まる
- 行数は減らない
- ソースは変わらない

## Meaning
- [CONTEXT.md#kind](../L4_ubiquitous/CONTEXT.md#kind) — 種別(kind)
- [CONTEXT.md#pre-comment](../L4_ubiquitous/CONTEXT.md#pre-comment) — pre-comment

## Structures
- [kind](../L4_structures/kind.md)
- [row](../L4_structures/row.md)
