# Overview

リポジトリにおける、情報参照の順序を決める。
矢印は参照の方向。

```mermaid
flowchart TD

    subgraph L1[version-and-milestones]
        milestone[milestone: milestones/*]
    end

    subgraph L2[features]
        feature[features: features/*]
    end

    subgraph L3[solutions]
        design[design: design/*]
        contract[contract: spec/*]
    end

    subgraph L4[domains]
        ubiquitous[ubiquitous: ubiquitous/*]
        model[model: model/*]
    end

    subgraph L5[decisions]
        adr[adr: adr/*]
    end

    subgraph L6[sources]
        code[code: src/*]
        test[test: test/*]
    end

    milestone --> feature
    feature --> design
    feature --> contract
    contract --> design
    design --> ubiquitous
    design --> model
    contract --> ubiquitous
    contract --> model
    model --> ubiquitous
    ubiquitous --> adr
    model --> adr
    adr --> code
    adr --> test

```

## 各ノード

- **milestone** — 版の単位。その版が触れた feature を指す
- **feature** — 機能の単位。利用者が名指しできるものを一つとする
- **contract** — 要件を満たす what。外から観測できる約束と、その検証
- **design** — 要件に対する how。実装の中身
- **model** — 型や schema など、構造そのもの
- **ubiquitous** — 語の辞書。語の意味を一項目ずつ説明する
- **adr** — 決定とその理由
- **code** / **test** — 実装と検証

## リポジトリごとの適用

この図は一般構造であり、使う層はリポジトリが選ぶ。periplus 自身では次の通り。

- **code** — `skills/*` と `hooks/*`
- **model** — kind の構造。名前の一覧と ubiquitous への参照を持つ
- **test** — 工程はあるが、ファイルとして残していない
