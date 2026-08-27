# 状態の置き方

コマンドは状態を持たない。状態は全て `.periplus/` のファイルにある。

## 中断点を表に出す

`/pp-classify` と `/pp-resolve` が別のコマンドであることで、途中の状態がファイルの形で
残る。**kind を持ちながら `pre.csv` に居る行**がそれで、分類は済んだが配送されていない
ことを意味する。

この中断点は数えられる。`pre.csv` の行数が未配送、そのうち四番目の欄が空のものが未分類で、
差が「分類済みだが置き去り」である。セッション開始時の注入とステータスラインが、
この二つの数をそのまま出す。

## 再実行で壊れない

- `/pp-classify` は、既に kind を持つ行に触らない
- `/pp-resolve` は一行ずつ配送して一行ずつ消す。最後にまとめて消さないので、
  途中で止まっても配送済みの行が二度届かない
- 保管は追記のみで、編集も排出もされない

## Meaning
- [CONTEXT.md#pre-comment](../ubiquitous/CONTEXT.md#pre-comment) — pre-comment
- [CONTEXT.md#kind](../ubiquitous/CONTEXT.md#kind) — 種別(kind)

## Structures
- [row](../structures/row.md)
- [保管](../structures/archive.md)
- [捕獲から行き先まで](../structures/flow.md)
