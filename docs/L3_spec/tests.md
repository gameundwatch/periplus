# テスト — 何をどう確かめるか

```
node --test hooks/*.test.js
```

## 観測できること

- **場所**
    - `hooks/periplus-activate.test.js`（61 件）と
      `hooks/periplus-statusline.test.js`（4 件）
- **走らせ方**
    - Node の標準テストランナーだけ。フレームワークも依存も足さない
- **対象**
    - 実行コードは hook の二本しかないので、テストもそこにしか無い
- **散文**
    - `skills/*/SKILL.md` と `hooks/capture.md` はモデルが読む文であり、
      テストで確かめられない。ここが確かめられる範囲の境である

## 散文を縛っている一件

`README.md` の [criteria-table](criteria-table.md) と `DEFAULT_CRITERIA` が同じ kind
集合を持つことだけは、テストが縛っている。文書と実装の食い違いを機械が捕まえる唯一の点。

## 確認

- 依存を足さずに `node --test hooks/*.test.js` が通る

## Design
- [二相の構え](../L3_design/phases.md)
    - 散文で書かれた部分は確かめられないこと
