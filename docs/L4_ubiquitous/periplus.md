# periplus(航海日誌)

分類の結果、コードにもどこにも属さないと判明した記述が置かれる場所。
pre-comment がすべて一度は通る退避先ではなく、**濾された後に残ったもの**が
行き着く先である。

periplus を分けるのは内容の種類ではなく**決着の有無**である。決着した記述は
code・docs・trash のいずれかで出ていき、決着していない記述(here)は留まる。
恒久的な層(コード・コメント・文書)と同じ内容が periplus に同時に存在する瞬間は
無い。

留まることは失敗ではない。periplus は**文書を書くときの客観的証拠**であり、
溜まった量は、設計が決めずに実装の裁量に落ちた判断がどれだけあるかを示す。出口は
要求しない — here に行き先を決めさせれば、次はその行き先を議論する場が要り、
連鎖は終わらない。

periplus に入る記述は文書の材料である。既定でここに来る種別は
`undocumented-design`・`unspecified-choices`・`why`・`rejected-alternatives`・
`upgrade-triggers` の五つで、いずれもコードが依存する事実ではない。docs が目指す先
だが、四つの行き先は序列ではない。

決定: [ADR 0003](../L5_adr/0003-periplus-is-a-state-not-a-category.md)、[ADR 0023#no-exit-required](../L5_adr/0023-the-log-is-evidence-for-writing-a-document.md#no-exit-required)
