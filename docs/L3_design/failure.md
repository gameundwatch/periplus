# 壊れたときの落ち方

L4 の図はどれも、壊れた部分だけを外して残りを動かす形をしている。外れたことが出る場所は
一様ではない。

| 壊れたもの | 外れる範囲 | 外れたと出る場所 |
| --- | --- | --- |
| `config.json` のキー一つ | そのキーだけ | [表の後ろ](../L4_structures/authority.md) |
| `config.json` の他のキー | 何も外れない | — |
| 作業場が作れない | `.periplus/` を使う経路だけ | — |
| ステータスラインが繋がっていない | 件数の出口が一つ | [起動時の案内](../L4_structures/injection.md) |
| **書式の崩れた行** | **その行** | **どこにも出ない** |

## 落ちるのは値であって、ファイルではない

[config.json](../L4_structures/config.md) は、知らない [kind](../L4_ubiquitous/kind.md) と行き先でない値について「そのキーだけが無視される。
ファイル全体は適用される」と定める。[行き先の権威](../L4_structures/authority.md)は、無視されたキーが表の後ろに並ぶ
ことを示す。重ねると、**設定の故障は部分的であり、かつ画面に出る**と言える。

設定を読む処理は例外で抜けない。キー単位で捨てて、残りを返す。

## 規律は作業場より先に届く

[注入](../L4_structures/injection.md)の四つの入口のうち、`install` と `criteria` は `.periplus/` に触らない。残る二つは
作業場の用意を経るが、規律の注入はその後ろに直列で並んでいる。**置き場が無いことと、規則が
届かないことは別である。**

## 件数の出口は二つある

[構成](../L4_structures/architecture.md)で `periplus-statusline.js` は件数を自分で数えず、`periplus-activate.js` から
借りている。[注入](../L4_structures/injection.md)の `SessionStart` も同じ件数を出す。**同じ数に出口が二つあり、片方が
繋がっていなくても、もう片方は出る。**

`install` はその二つ目を繋ぐためだけの入口で、`.periplus/` には触らない。

<a id="silent-row"></a>
## 崩れた行だけが、黙って外れる

[row](../L4_structures/row.md) は行の形を定めるが、形に合わない行がどうなるかを定めていない。[構成](../L4_structures/architecture.md)では
`periplus-activate.js` が `pre.csv` と `log.csv` の件数を読む。読めない行は件数に入らない。

**表の後ろにも、件数にも出ない。**上の表で最後の一行だけが空欄なのはこのためである。

## Meaning
- [criterion](../L4_ubiquitous/criterion.md)
    - 判断基準(criterion)
- [kind](../L4_ubiquitous/kind.md)
    - 種別(kind)

## Structures
- [config.json](../L4_structures/config.md)
- [行き先の権威](../L4_structures/authority.md)
- [注入](../L4_structures/injection.md)
- [row](../L4_structures/row.md)
- [構成](../L4_structures/architecture.md)
