# 判断基準(criterion)

種別を行き先(code・periplus・drop)に対応づける規則。設定ファイルが持つのはこの
対応表であって、種別そのものではない。

この表の行き先と、periplus に着いた記述の行き先(code・docs・here・trash)は別の語彙で
ある。docs は合意を要する作業であり種別から機械的には引けないこと、および既存の
設定ファイルの値を壊さないことによる。

固定ではなくリポジトリごとに切り替えられる。既定では設計・方針・why はコードに残す
側に倒す。切り替えられるのは行き先だけであり、種別の集合は閉じたままである。

決定: [ADR 0002](../L5_adr/0002-configurable-criteria.md)、[ADR 0027](../L5_adr/0027-config-json-is-the-authority-for-destinations.md)
