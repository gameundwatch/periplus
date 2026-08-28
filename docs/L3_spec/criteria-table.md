# criteria-table — README が持つ表の契約

`/pp-resolve` が出す表は、README.md の一区画を雛形として読む。README の書式がコードの
前提になっている。

## 観測できること

- **区画**
    - `<!-- criteria-table:start -->` と `<!-- criteria-table:end -->` で挟む。
      この二行は出力に含まれない
- **行の形**
    - `| \`<kind>\` | … | … | … |`。一列目は必ずバックティックで囲んだ kind 名
- **列**
    - kind / which is / example / goes to の四列
- **置換**
    - 最後から二つ目のセル、すなわち `goes to` 列が、そのリポジトリの
      [行き先](../L4_structures/destination.md)で置き換わる。列は増えない
- **区画外**
    - 表以外の行はそのまま通る
- **区画が無い場合**
    - 表は空になり、問題の行だけが出る

## 壊れる形

一列目のバックティックが外れた行、列数が違う行は、置換されずにそのまま出る。**出荷時の
既定が実行時の値であるかのように並ぶ**ので、区画の書式を変えるときはここを見る。

## 確認

テストが README.md と `DEFAULT_CRITERIA` を同じ kind 集合に縛っている。README に
kind を足して実装に足さなければ、あるいはその逆でも、テストが落ちる。

## Structures
- [行き先の権威](../L4_structures/authority.md)
- [destination](../L4_structures/destination.md)
- [kind](../L4_structures/kind.md)
