# 二相の構え

periplus は二つの相に分かれる。相の境目は、**判断をどこに集めるか**で引かれている。

- **phase 1（捕獲）**
    - コードを書いている間ずっと有効。[記述](../L4_ubiquitous/CONTEXT.md#pre-comment)を `pre.csv` に足すだけで、
      行き先を決めない
- **phase 2（濾過）**
    - コードが完成した後に一度だけ。溜まった全行に対して行き先を決める

判断を phase 2 に集めることが構えの中心である。phase 1 は判断しないので、迷った記述も
そのまま捕獲でき、捕獲を止める条件が要らない。

## 実行コードは二本しかない

periplus の本体はほぼ全てが散文である。

- `hooks/periplus-activate.js`
    - 規律と件数を注入し、作業場を用意する
- `hooks/periplus-statusline.js`
    - 件数を表示する

phase 1 の規律は `hooks/capture.md` という文であり、phase 2 の手順は `skills/*/SKILL.md`
という文である。どちらも実行するのはモデルであって、コードではない。したがって
**規律が働かない場合の失敗は例外ではなく、読まれなかったという形で現れる。**

この構えの帰結として、文面の設計が実装の設計そのものになる。命令に理由を添えると
反論の足場ができ、規律が弱くなる。

## Meaning
- [CONTEXT.md#pre-comment](../L4_ubiquitous/CONTEXT.md#pre-comment)
    - pre-comment
- [CONTEXT.md#periplus](../L4_ubiquitous/CONTEXT.md#periplus)
    - periplus

## Structures
- [注入](../L4_structures/injection.md)
- [捕獲から行き先まで](../L4_structures/flow.md)
