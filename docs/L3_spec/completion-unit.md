# 完成の単位 — 何を書き終えたら濾すか

## 観測できること

- **単位**
    - いま書き終えた一つの変更。タスクではない
- **git との関係**
    - git では commit に一致するが、規律に `commit` とは書かない。periplus は git を知らない
- **門**
    - 「タスクを完了と呼ぶ前」の門を置き換える。二つ目の門は置かない
- **報告**
    - 変更ごとに一度。`periplus: 3 filtered` / `periplus: nothing captured` /
      `periplus: no document, not run` のいずれかを、その変更について言う
- **description**
    - `/pp` の起動条件も同じ単位で書く。スキル一覧は常時読まれるため、
      ここが「タスクの終わり」のままだと注入された文と食い違う

## 確認

一つのタスクの中で報告が複数回出れば単位は動いている。最後に一度だけなら動いていない。
検査は持たず、申告だけを持つ。

## Design
- [二相の構え](../L3_design/phases.md)
    - 相が切り替わる印が 4 番目の欄であること

## Meaning
- [pre-comment](../L4_ubiquitous/pre-comment.md)
    - pre-comment

## Structures
- [捕獲から行き先まで](../L4_structures/flow.md)
