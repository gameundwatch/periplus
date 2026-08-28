# install 入口 — ステータスラインを設定に書く

```
node <plugin>/hooks/periplus-activate.js install
```

## 観測できること

- **書く先**
    - `$CLAUDE_CONFIG_DIR/settings.json`、無ければ `~/.claude/settings.json`。
      親ディレクトリが無ければ作る
- **控え**
    - 書く前に、既存のファイルを `settings.json.periplus-bak` へ写す
- **既にある status line**
    - 消さない。前に置いたまま `; printf ' '; …` を挟んで後ろに足す
- **結果**
    - 三通りを一行で言う。`already`（既に繋がっている・何も変えない）/
      `appended`（既存の後ろに足した）/ `wired`（新しく繋いだ）
- **触らないもの**
    - `statusLine` 以外の設定は変えない

## 入れない条件

自分からは実行しない。セッション開始時に案内を出すだけで、頼まれるまで入れない。
Windows と、実行ファイルのパスにシェルで扱えない文字が含まれる場合は、案内自体を出さない。

## 確認

- `settings.json.periplus-bak` が残り、元の内容と一致する
- `statusLine` 以外のキーが変わっていない

## Design
- [壊れたときの落ち方](../L3_design/failure.md)
    - 入れない条件と、控えを取ること

## Structures
- [構成](../L4_structures/architecture.md)
- [注入](../L4_structures/injection.md)
