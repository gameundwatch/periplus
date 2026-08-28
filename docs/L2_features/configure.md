# configure — 行き先をリポジトリごとに変える

`.periplus/config.json` を書き換えると、種別ごとの行き先が変わる。種別そのものは増やせない。

## できること

- 「設計や why をコードに残すか」の線を、リポジトリの都合で動かせる
- 今の設定がどうなっているかを表で確かめられる
- 設定を壊しても、壊れたキーだけが無視されて動き続ける

## Contract
- [criteria-entry](../L3_spec/criteria-entry.md)
    - 設定を当てた表を出す入口
- [criteria-table](../L3_spec/criteria-table.md)
    - その表の書式が README にあること

## Design
- [壊れたときの落ち方](../L3_design/failure.md)
    - 設定が壊れても規律が落ちないこと
