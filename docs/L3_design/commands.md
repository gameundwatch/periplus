# コマンドの割り方

五つのコマンドは、**合意が要るかどうか**と**中断できるかどうか**で割れている。

- `/pp`
    - 自分では何もせず、`/pp-classify` と `/pp-resolve` を順に呼ぶだけ。
      ファイルに触らない
- `/pp-classify`
    - 読むのは `pre.csv` だけ。行き先を知らないまま [kind](../L4_ubiquitous/kind.md) を決める
- `/pp-resolve`
    - kind を行き先に解決し、配送し、`pre.csv` を空にする
- `/pp-discuss`
    - log の一件ごとに提案し、同意を待つ。一括の承認は次の一件に効かない
- `/pp-refactor`
    - 既存のコメントを切り出して同じ経路に乗せる。保管だけ別

## 分類は行き先を見ない

`/pp-classify` が `config.json` を読まないことは、この構えの要である。行き先を知って
いると、行き先の都合で kind が選ばれる。kind は[記述](../L4_ubiquitous/pre-comment.md)が何についてかを指す語であって、
それをどう扱うかの語ではない。

同じ理由で、二つの行き先語彙が同じ文脈に同居することを避けている。

## 合意の要る操作だけを分ける

`/pp-resolve` は機械的に解決するので確認を求めない。`/pp-discuss` は文書を書く作業で、
どの[文書](../L4_ubiquitous/docs.md)に足すかはリポジトリごとに違い、機械には引けない。だから別のコマンドになり、
一件ずつ止まる。

## Meaning
- [kind](../L4_ubiquitous/kind.md)
    - 種別(kind)
- [criterion](../L4_ubiquitous/criterion.md)
    - 判断基準(criterion)
- [periplus](../L4_ubiquitous/periplus.md)
    - periplus
- [docs](../L4_ubiquitous/docs.md)
    - docs

## Structures
- [構成](../L4_structures/architecture.md)
- [二つの行き先語彙](../L4_structures/vocabularies.md)
- [log の行き先](../L4_structures/discuss.md)
