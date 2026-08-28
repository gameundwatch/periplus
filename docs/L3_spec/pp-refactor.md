# pp-refactor — 既存のコメントを同じ経路に乗せる

## 観測できること

- **範囲**
    - 先に尋ねるか、利用者が名指したものだけ。リポジトリ全体を自分から取らない
- **申告**
    - 始める前に、対象のファイル数とコメント数を言う。多ければ小さい第一歩を提案する
- **設計文書**
    - 何が設計かを同じ場で尋ねる。「無い」は答えであって欠落ではない
- **単位**
    - 一ファイルずつ、切り出し → 分類 → 配送 を終えてから次へ
- **切り出し**
    - そのファイルのコメントと docstring を全て消し、
      [`pre.csv`](../L4_structures/row.md) に書く。今の場所に収まっているものも含めて全部
- **保管**
    - `.periplus/swept.csv`。`all.csv` には混ぜない
- **書き戻し**
    - `code` に回った行は、復元ではなく持っている事実まで短く書き直す。
      言語は行のまま。書き直しは翻訳ではない
- **出力**
    - 末尾に `<N> to code, <M> to periplus, <K> dropped, across <F> files.`

## しないこと

- コードを書き換えない。動かすのはコメントだけ
- `pre.csv` を通っていないコメントを消さない

## 確認

- 対象ファイルからコメントが消え、`.periplus/pre.csv` が空になる
- `.periplus/swept.csv` の行数が切り出した数だけ増え、`all.csv` は増えない
- 空にならなければ、残り行数が報告になる

## Design
- [コマンドの割り方](../L3_design/commands.md)
    - 三つの道具を全部持つこと

## Meaning
- [pre-comment](../L4_ubiquitous/pre-comment.md)
    - pre-comment
- [language](../L4_ubiquitous/language.md)
    - 記述の言語

## Structures
- [保管](../L4_structures/archive.md)
- [捕獲から行き先まで](../L4_structures/flow.md)
