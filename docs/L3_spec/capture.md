# capture — phase 1 の約束

コードを書いている間、コメントの代わりに[記述](../L4_ubiquitous/CONTEXT.md#pre-comment)を
溜める。

## 観測できること

- **書く先**
    - `.periplus/pre.csv` に一行追記する。ヘッダ行は作らない
- **書く形**
    - [row](../L4_structures/row.md) の文法。四番目の欄は空
- **書かない先**
    - ソースには一行も書かない。`.gitignore` にも触れない
- **範囲**
    - テストと設定ファイルを含む、あらゆるファイル
- **粒度**
    - 一つのことを述べる単位で一行。二つ述べる記述は二行になる
- **迷った記述**
    - 捨てずに書く。要否の判断は phase 2 に送る

## 発火しない条件

背後に文書が無い作業では発火しない。利用者が止めたときも発火しない。それ以外に条件は
無く、不確かでも発火する。

## 確認

- `.periplus/pre.csv` の行数が増える
- 同じ作業でソースのコメントが増えない
- セッション開始時の注入に、未配送の件数が出る

## Design
- [二相の構え](../L3_design/phases.md)
    - 判断を後段に集めるので、捕獲は判断しない

## Meaning
- [CONTEXT.md#pre-comment](../L4_ubiquitous/CONTEXT.md#pre-comment)
    - pre-comment

## Structures
- [row](../L4_structures/row.md)
- [注入](../L4_structures/injection.md)
- [捕獲から行き先まで](../L4_structures/flow.md)
