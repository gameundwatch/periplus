# 配布 — プラグインとして何を名乗るか

## 観測できること

- **`.claude-plugin/plugin.json`**
    - `name` は `periplus`、`version`、`description`。
      利用者が入れたものの名前と版がここに出る
- **`.claude-plugin/marketplace.json`**
    - 配布元の名乗り。`owner`、`category`、
      `source` は `./`
- **コマンド**
    - `skills/*/SKILL.md` が一つずつコマンドになる。ディレクトリ名が
      コマンド名になる
- **フック**
    - `hooks/hooks.json` が登録する二イベント
- **持ち込まないもの**
    - 依存パッケージを持たない。実行に要るのは `node` だけ

## 版

`plugin.json` の `version` が唯一の版である。マイルストーンの番号はこれに揃える。

## 確認

- `skills/` のディレクトリ名と、利用者が打てるコマンド名が一致する
- `plugin.json` の `version` と、`L1_milestones/` の最新の版が一致する

## Structures
- [構成](../L4_structures/architecture.md)
