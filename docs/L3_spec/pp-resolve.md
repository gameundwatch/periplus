# pp-resolve — kind を行き先へ送る

## 観測できること

- **読む**
    - `.periplus/pre.csv` の kind を持つ行と、`.periplus/config.json`
- **解決**
    - kind から[行き先](../L4_structures/destination.md)を引く。確認は求めない
- **配送**
    - `code` はソースの `file:line` へ、`periplus` は `.periplus/log.csv` へ、
      `drop` はどこにも書かない
- **保管**
    - 行き先に関わらず全行を保管へ無変更で追記する。既定は `.periplus/all.csv`
- **排出**
    - 一行ずつ配送して一行ずつ消す。最後にまとめて消さない
- **出力**
    - 一行につき `<file>:<line> [<kind>] → <code|periplus|drop> — …`、
      末尾に `<N> to code, <M> to periplus, <K> dropped. pre.csv empty.`

## 発火しない条件

kind を持つ行が無いとき。`.periplus/config.json` が無い場合は既定で動く。

## 確認

- `.periplus/pre.csv` が空になる
- 保管の行数が、配送した行数だけ増える
- 空にならなかった場合、その旨が報告に出る

## Design
- [状態の置き方](../L3_design/state.md)
    - 一行ずつ配送して一行ずつ消す形
- [コマンドの割り方](../L3_design/commands.md)
    - 機械的に解決するので確認を求めない

## Meaning
- [criterion](../L4_ubiquitous/criterion.md)
    - 判断基準(criterion)
- [code](../L4_ubiquitous/code.md)
    - code

## Structures
- [destination](../L4_structures/destination.md)
- [config.json](../L4_structures/config.md)
- [保管](../L4_structures/archive.md)
- [行き先の権威](../L4_structures/authority.md)
