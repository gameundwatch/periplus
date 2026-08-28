# pp-discuss — log を一件ずつ行き先へ送る

## 観測できること

- **読む** — `.periplus/log.csv`、`.periplus/config.json`（無くても報告しない）、
  このリポジトリが持つ文書
- **順序** — 古い順に一件ずつ。複数をまとめて出さない
- **提示** — 記述と、それが指すコードを見せてから行き先を言う
- **同意** — 一件ごとに待つ。一括の承認は次の一件に効かない
- **行き先** — `code` / `docs` / `here` / `trash` の四つ。
  [`here`](../L4_ubiquitous/CONTEXT.md#here) だけが log に残る
- **出力** — 末尾に `<N> to code, <M> to docs, <K> trashed, <R> held here.`
- 同じ主題が二度目に落ちていたら、そう言って文書を名前で提案する

## 発火しない条件

`.periplus/log.csv` が空のとき。ソースを走査してコメントを探しに行かない。

## 確認

**完了は log.csv を端から端まで走査し終えたこと**であって、空になることではない。
`here` に留まった件数だけ残るのが正常な終わり方である。

## Meaning
- [CONTEXT.md#here](../L4_ubiquitous/CONTEXT.md#here) — here
- [CONTEXT.md#docs](../L4_ubiquitous/CONTEXT.md#docs) — docs
- [CONTEXT.md#trash](../L4_ubiquitous/CONTEXT.md#trash) — trash

## Structures
- [log の行き先](../L4_structures/discuss.md)
- [二つの行き先語彙](../L4_structures/vocabularies.md)
