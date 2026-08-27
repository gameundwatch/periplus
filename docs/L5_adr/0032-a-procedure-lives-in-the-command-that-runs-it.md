# 手順は、それを実行するコマンドのファイルが持つ

ADR 0031 は手順書から理由を落とした。落とし切った後も残った脂肪は、文言ではなく**置き場所**
だった。三つある。

**捕捉規則が `/pp` の文脈に二度入っていた。** hook がセッション開始時に注入し、その後 `/pp` が
`skills/pp/SKILL.md` を丸ごと読む。`/pp` は phase 2 であって、捕捉はしない。0031 後の実測で
1,634 字を、`/pp` を呼ぶたびに二度払っていた。

**分類器の道具が分類器の外にあった。** kind 表と読む順は `/pp-classify` の道具である。しかし
`skills/pp-classify/SKILL.md` は「表は `skills/pp/SKILL.md` にある」と外を指しており、単独で
呼ばれるたびに別ファイルを開かせていた。`/pp-refactor` も同じ経路を通っていた。

**四ファイル表は参照であって手順ではなかった。** 0031 が README を説明書と決めており、README は
既に同じ表を持っていた。`skills/pp/SKILL.md` の側は重複でしかない。

## 決めたこと

- **捕捉規則は `skills/pp/CAPTURE.md` が単独で持つ。** hook はこのファイルを丸ごと注入する
- **kind 表と読む順は `skills/pp-classify/SKILL.md` が持つ**
- **四ファイル表は README のものだけにする**
- **`/pp` は skill として残す。** 残ったのは 55 行で、中身は phase 2 の二コマンド、言語の規則、
  行形式だけになった。それでも捕捉規則が `invoke /pp` を指している以上、呼べる名前が要る

## ADR 0007 の根拠は弱まらず、強くなる

0007 は「文言は SKILL.md から切り出しているため、常時の規則と `/pp` の本文が別々の規律に分かれる
ことはない」と書いた。切り出しは**同じ文言が二箇所に存在すること**を前提にした対策である。

この版では文言が一箇所にしか無い。分かれる先が無いので、drift は起きない。

テストもそう書き換えた。`the injected capture rule is lifted verbatim from the skill` は
`the injected capture rule is the whole of the file it comes from` になり、注入と
`CAPTURE.md` の全文が一致することを見る。加えて `no other file restates the capture rule` を
足し、README と四つの SKILL.md のどれもが規則の一行目を持たないことを見る。**複写が起きない
ことを直接検査する方が、複写が一致していることを検査するより強い。**

## `delivered × 3 < skill` は消える

`session start carries the capture rule only, not the filter machinery` は、注入が skill 本体の
一部であることを長さの比で担保していた。捕捉規則が skill の外に出た以上、比べる二つに関係が
無くなる。この一行だけを消し、残る四つの表明 — `pre.csv` を指していること、phase 2 は指すだけで
展開しないこと、kind 表が入らないこと、kind 名が漏れないこと — はそのまま残す。**この四つが
テスト名の言っていることであり、比率はその代理でしかなかった。**

0031 の作業後、この比率の余裕は 5,691 字から 1,532 字まで縮んでいた。本文をあと 500 字削れば
落ちる状態で、落ちたときに壊れているのは規律ではなく代理指標のほうだった。

## Considered Options

- **`skills/pp/SKILL.md` に捕捉規則を残したまま、hook が読む箇所だけ切り出す**(0031 までの形) —
  ファイルが増えない。`/pp` が phase 1 の規則を読み続ける
- **kind 表を `skills/pp/SKILL.md` に残す** — `/pp` の総量は変わらない。移しても `/pp` は三ファイル
  とも読むためで、得をするのは `/pp-classify` 単独と `/pp-refactor` だけである。それでも、道具を
  使わない者に持たせておく理由が無い
- **`/pp` を廃し、`/pp-classify` と `/pp-resolve` だけにする** — 55 行の skill が消える。ただし
  捕捉規則が `invoke /pp` を指しており、ADR 0016 は二つを分けたが `/pp` を消していない
- **`CAPTURE.md` を `skills/` の外に置く** — skill のディレクトリに skill でないファイルが入るのを
  避けられる。ただし `/pp` から見て phase 1 がどこにあるかが遠くなる

## Consequences

`skills/pp/SKILL.md` は 168 行から 55 行になった。`skills/pp-classify/SKILL.md` は 145 行から
206 行に増えている — kind 表と読む順が移ってきたためで、**この版で唯一行数が増えるファイルで
ある。**

`hooks/periplus-activate.js` は読む先を三つに分けた。`readDiscipline` は
`skills/pp/SKILL.md`、`readKinds` は `skills/pp-classify/SKILL.md`、`captureRule` は
`skills/pp/CAPTURE.md`。`ALWAYS_RE` と `always` マーカーは消えた。

**README の三箇所を直した。** `:73` の「`skills/pp/SKILL.md` が規律の単一の出所」は捕捉規則の
移動で偽になり、`:128` の「表は `skills/pp/SKILL.md` にある」は kind 表の移動で偽になる。この二つは
**この版が壊した記述**であり、直さなければ README が存在しない構成を説明することになる。

三つ目の `:89`「rows whose kind sent them to periplus」は元からあった。ADR 0031 が①として名指し
した言い方そのもので、この版の移動とは無関係である。**同じ表の中で直すほうが安いので一緒に
直した** — 「rows sent to the `periplus` destination」。kind が送るのではなく、kind から引かれた
行き先が `periplus` だという言い方に変わる。

0031 が README を範囲外と決めたのは理由の削除についてであって、移動が壊した記述の後始末は
この版に属する。
