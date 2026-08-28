# pp — 濾過を一度に走らせる

## 観測できること

- `/pp-classify` と `/pp-resolve` を、この順で続けて呼ぶ
- 自分ではファイルに触れない
- 片方だけで止めない。分類だけで終えると、ソースにコメントが一つも入らない

## 発火しない条件

`.periplus/pre.csv` が無いか、分類すべき行が無いとき。`/pp-classify` が
`Nothing to classify.` と報告して止まる。

## 確認

- 実行後、`.periplus/pre.csv` が空
- 該当があればソースのコメントが増え、`.periplus/log.csv` の件数が増える

## Structures
- [捕獲から行き先まで](../L4_structures/flow.md)
- [構成](../L4_structures/architecture.md)
