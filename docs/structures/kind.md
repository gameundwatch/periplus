# kind

pre-comment 一件が持つ、ちょうど一つの分類。閉じた集合であり、十三個で全てになる。

## 集合

`external-facts` / `contracts` / `current-limits` / `label` /
`undocumented-design` / `unspecified-choices` / `why` / `rejected-alternatives` /
`upgrade-triggers` / `default` / `tautology` / `doc-restatement` / `test-intent`

各語の意味は [ubiquitous/CONTEXT.md](../ubiquitous/CONTEXT.md) にある。
どの kind に落ちるかを決める木は `skills/pp-classify/SKILL.md` が持つ。

## 行き先

行き先は `code`・`periplus`・`drop` の三つ。kind から行き先への対応は多対一で、
リポジトリごとに `.periplus/config.json` が差し替える。

現在の対応表は `README.md` が持つ。既定値の原本は
`hooks/periplus-activate.js` の `DEFAULT_CRITERIA` で、README の表はそこから生成される。
