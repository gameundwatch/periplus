# hook — 規律を毎セッション届ける

## 観測できること

- **登録**
    - `SessionStart`（`startup` / `resume` / `clear` / `compact`）と
      `SubagentStart` の二イベント。いずれも制限時間 5 秒
- **場所**
    - 対象は `CLAUDE_PROJECT_DIR`、無ければ実行時のカレントディレクトリ
- **作業場**
    - `.periplus/` が無ければ作る。既にあれば何もしない
- **無視行**
    - 作業場を初めて作ったときだけ、リポジトリの `.gitignore` に `/.periplus/`
      を足す。git 管理下でなければ足さない。既に同じ行があれば足さない
- **設定**
    - `.periplus/config.json` が無ければ作る。あれば欠けた kind だけ足し、
      他のキーは触らない
- **注入**
    - 規律と `log.csv` の件数。`SessionStart` にはさらに `pre.csv` の未配送件数と
      ステータスラインの案内が付く
- **node が無い環境**
    - Windows では `node` が見つからなければ何もしない

## 失敗しても続くこと

作業場も設定も作れない場合（読み取り専用のチェックアウトなど）、規律だけは注入される。

## 確認

- セッション開始時に `PERIPLUS ACTIVE — <N> in the log` が出る
- 未配送があれば、その件数と内訳が同じ行に続く
- サブエージェントには未配送件数が出ない

## Design
- [二相の構え](../L3_design/phases.md)
    - 規律は文であり、実行コードは二本しかない

## Meaning
- [CONTEXT.md#periplus](../L4_ubiquitous/CONTEXT.md#periplus)
    - periplus

## Structures
- [注入](../L4_structures/injection.md)
- [config.json](../L4_structures/config.md)
- [構成](../L4_structures/architecture.md)
