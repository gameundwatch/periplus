# criteria 入口 — コマンド間の契約

人が打つコマンドではない。`/pp-resolve` が行き先を引くために呼ぶ。

```
node <plugin>/hooks/periplus-activate.js criteria
```

## 観測できること

- **読む**
    - `CLAUDE_PROJECT_DIR`（無ければカレント）配下の `.periplus/config.json` と、
      プラグインの README.md
- **出す**
    - [criteria-table](criteria-table.md) の区画に、そのリポジトリの行き先を
      当てた表。続けて、無視したキーを `config.json: <理由>` の形で並べる
- **作らない**
    - `.periplus/` も `config.json` も、この入口では作らない。
      無ければ既定の表が出る
- **終了**
    - 標準出力に書いて終わる。ファイルは一つも変えない

## 呼べなかったとき

`/pp-resolve` は `.periplus/config.json` を直接読む経路を持つ。この入口は近道であって、
唯一の経路ではない。

## 確認

- 出力の `goes to` 列が `config.json` の値と一致する
- 実行前後で `.periplus/` の中身が変わらない

## Design
- [コマンドの割り方](../L3_design/commands.md)
    - `config.json` を読むコマンドと読まないコマンド

## Meaning
- [criterion](../L4_ubiquitous/criterion.md)
    - 判断基準(criterion)

## Structures
- [行き先の権威](../L4_structures/authority.md)
- [config.json](../L4_structures/config.md)
- [注入](../L4_structures/injection.md)
