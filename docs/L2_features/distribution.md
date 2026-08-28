# distribution — プラグインとして配る

marketplace から入れて使う。依存は持たず、要るのは `node` だけ。

## できること

- 入れた版が何かを名乗りで確かめられる
- `skills/` のディレクトリ名がそのままコマンド名になる
- 依存を足さずにテストを走らせられる

## Contract
- [distribution](../L3_spec/distribution.md)
    - 名乗りと、コマンド名の対応
- [tests](../L3_spec/tests.md)
    - 何が確かめられ、何が確かめられないか

## Design
- [二相の構え](../L3_design/phases.md)
    - 実行コードが二本しかないこと
