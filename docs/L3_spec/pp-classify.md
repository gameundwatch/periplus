# pp-classify — 各行に kind を一つ与える

## 観測できること

- **読む**
    - `.periplus/pre.csv` だけ。`.periplus/config.json` は読まない
- **書く**
    - 同じファイルの四番目の欄だけ。他の欄も他のファイルも変えない
- **割る**
    - [kind](../L4_ubiquitous/kind.md) が一つに定まる最小単位まで割る。
      割った行は元の一行を置き換えるので、行数は増えることがある
- **再実行**
    - 既に kind を持つ行には触らない
- **順序**
    - 名前を付ける前に割る

## 発火しない条件

ファイルが無いか、四番目の欄が空の行が無いとき。`Nothing to classify.` と報告して止まる。

## 確認

- `.periplus/pre.csv` の全行の四番目が埋まる
- 行数は減らない
- ソースは変わらない

## Design
- [コマンドの割り方](../L3_design/commands.md)
    - 分類の文脈に行き先語彙が入らないこと
- [状態の置き方](../L3_design/state.md)
    - 途中の状態が欄で数えられること

## Meaning
- [kind](../L4_ubiquitous/kind.md)
    - 種別(kind)
- [pre-comment](../L4_ubiquitous/pre-comment.md)
    - pre-comment

## Structures
- [kind](../L4_structures/kind.md)
- [row](../L4_structures/row.md)
