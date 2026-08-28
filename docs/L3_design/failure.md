# 壊れたときの落ち方

壊れても規律は落とさない。落とすのは数と設定だけである。

- **作業場が作れない**
    - 読み取り専用のチェックアウトでも規律は注入される。置き場が
      無いだけで、捕獲の規則自体は届く
- **`config.json` が壊れている**
    - 壊れた[判断基準](../L4_ubiquitous/CONTEXT.md#criterion)のキーだけが無視され、残りは適用される。無視した
      ことは表の後ろに並ぶので、黙って既定に戻ることは無い
- **`config.json` が無い**
    - 問題として報告しない。既定で動く
- **行の引用が壊れている**
    - その行は件数から漏れる。検査していないため、壊れた行は
      見えないまま残る
- **ステータスラインが繋がっていない**
    - 案内を一度だけ出す。勝手には入れない。
      Windows では入れる経路自体が無い

最後の一つだけ、他と性質が違う。**壊れた行は静かに消える**ので、数が合わないことに
気づく手掛かりが無い。他の失敗はすべて画面に出る。

## Meaning
- [CONTEXT.md#criterion](../L4_ubiquitous/CONTEXT.md#criterion)
    - 判断基準(criterion)
- [CONTEXT.md#kind](../L4_ubiquitous/CONTEXT.md#kind)
    - 種別(kind)

## Structures
- [config.json](../L4_structures/config.md)
- [row](../L4_structures/row.md)
- [行き先の権威](../L4_structures/authority.md)
