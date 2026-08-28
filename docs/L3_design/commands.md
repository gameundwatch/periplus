# コマンドの割り方

五つのコマンドは、**持つ道具**で割れている。

「道具」は語の辞書に項目を持たない。

| コマンド | 読む道具 | 触るファイル |
| --- | --- | --- |
| `/pp` | 無し | 無し |
| `/pp-classify` | [判別木](../L4_structures/kind.md) | `pre.csv` |
| `/pp-resolve` | [config.json](../L4_structures/config.md) | `pre.csv` `log.csv` `all.csv` ソース |
| `/pp-discuss` | [四つの行き先](../L4_structures/discuss.md) | `log.csv` 文書 ソース |
| `/pp-refactor` | 上の三つ | `pre.csv` `swept.csv` ソース |

## 道具が別なので、ファイルも別になる

[構成](../L4_structures/architecture.md)で `config.json` へ矢印が伸びているのは三つで、`/pp-classify` には伸びていない。
[二つの行き先語彙](../L4_structures/vocabularies.md)は、行き先の語が二組あることを示す。重ねると、**`/pp-classify` の文脈には
どちらの行き先語彙も入らない**ことになる。

`/pp-classify` が読むファイルに `code` `periplus` `drop` の語を置かない。判別木は [kind](../L4_ubiquitous/kind.md) の
名前だけで閉じている。

## 止まるのは一箇所だけ

L4 の図のうち、応答を待つノードを持つのは [log の行き先](../L4_structures/discuss.md)の「行き先を一つ提案し、同意を
待つ」だけである。[捕獲から行き先まで](../L4_structures/flow.md)も[保管](../L4_structures/archive.md)も[注入](../L4_structures/injection.md)も、分岐は値だけで決まる。

**待つ実装が要るのは `/pp-discuss` の一箇所に限られる。**残りは入力が揃った時点で最後まで走る。

## `/pp` はファイルを持たない

`/pp` から出る矢印は `/pp-classify` と `/pp-resolve` の二本で、workspace へは一本も伸びて
いない。読むものも書くものも無い。

## Meaning
- [kind](../L4_ubiquitous/kind.md)
    - 種別(kind)
- [criterion](../L4_ubiquitous/criterion.md)
    - 判断基準(criterion)
- [docs](../L4_ubiquitous/docs.md)
    - docs

## Structures
- [構成](../L4_structures/architecture.md)
- [二つの行き先語彙](../L4_structures/vocabularies.md)
- [log の行き先](../L4_structures/discuss.md)
- [kind](../L4_structures/kind.md)
