# Docs

Docにおける、情報参照の順序を決める。
上流が下流の内容をリンクで参照するルール。循環しないようにする。

```mermaid
flowchart TD

    milestone[milestone: loadmaps/*]
    plan[plan: feature/*]
    design[design: design/*]
    contract[contract: spec/*]
    adr[adr: adr/*]
    code[code: src/*]
    test[test: test/*]
    
    milestone --> plan
    plan--> design
    plan --> contract
    design --> adr
    contract --> adr
    adr --> code
    adr --> test

```
