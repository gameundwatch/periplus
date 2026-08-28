# row

`pre.csv` / `log.csv` / `all.csv` / `swept.csv` が共有する行の形。ヘッダ行は無い。

形に合わない行がどうなるかは定めていない。

```ebnf
row       = timestamp "," file "," line "," [ kind ] "," note ;

timestamp = year "-" month "-" day "T" hour ":" minute ;
file      = { character - "," } ;
line      = { digit } ;
note      = '"' { character | '""' } '"' ;
```

`timestamp` は ISO 8601 を分まで。`note` は中身に関わらず常に引用し、内側の `"` は
`""` に倍化する。[`kind`](../L4_ubiquitous/kind.md) は捕獲の時点では空で、`/pp-classify` が埋める。

[一行は一つのことだけを述べる](../L5_adr/0013-split-to-one-kind-at-capture.md)。二つ述べる[記述](../L4_ubiquitous/pre-comment.md)は二行になる。

## Meaning
- [pre-comment](../L4_ubiquitous/pre-comment.md)
- [kind](../L4_ubiquitous/kind.md)

## Decisions
- [ADR 0024](../L5_adr/0024-the-working-files-are-csv.md)
    - 作業ファイルは CSV
- [ADR 0013](../L5_adr/0013-split-to-one-kind-at-capture.md)
    - 捕獲の時点で kind 一つまで割る
- [ADR 0025](../L5_adr/0025-splitting-presumes-two.md)
    - 分割は推定有罪、すべての行が主語を持つ
