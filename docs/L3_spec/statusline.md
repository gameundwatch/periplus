# status-line — 二つの件数を常時出す

## 観測できること

- **出す形**
    - 両方空なら `[PERIPLUS]`、log 三件・未配送二件なら `[PERIPLUS:3!2]`。
      `:` が log、`!` が `pre.csv`
- **数の意味**
    - 行数そのもの。閾値も警告も持たない
- **出さない条件**
    - `.periplus/` が無いリポジトリでは何も出さない
- **設置**
    - 頼まれるまで入れない。セッション開始時に案内を出すだけ
- **設置の副作用**
    - `~/.claude/settings.json` に書く前に
      `settings.json.periplus-bak` へ写す。既にある status line は残し、後ろに足す

## 確認

- 画面の二つの数が、`.periplus/log.csv` と `.periplus/pre.csv` の行数と一致する
- 設置しても他の設定が変わらない

## Design
- [状態の置き方](../L3_design/state.md)
    - 中断点を数えられる形で出す
- [壊れたときの落ち方](../L3_design/failure.md)
    - 繋がっていないときの振る舞い

## Meaning
- [periplus](../L4_ubiquitous/periplus.md)
    - periplus

## Structures
- [注入](../L4_structures/injection.md)
- [構成](../L4_structures/architecture.md)
