# filter — 溜めたものを一度に濾す

`/pp` で起動する。溜まった記述に一つずつ種別を与え、種別ごとの行き先へ送る。

## できること

- コードが完成してから、必要なコメントだけをソースに残せる
- 残らなかった記述は消えずにログへ回る
- 分類だけで止めて、行き先を見る前に種別を直せる

## Contract
- [pp](../L3_spec/pp.md)
    - 二つを続けて呼ぶこと
- [pp-classify](../L3_spec/pp-classify.md)
    - 種別を与える側の約束
- [pp-resolve](../L3_spec/pp-resolve.md)
    - 行き先へ送る側の約束

## Design
- [コマンドの割り方](../L3_design/commands.md)
    - なぜ二つに割れているか
- [状態の置き方](../L3_design/state.md)
    - 中断点がどこに残るか
