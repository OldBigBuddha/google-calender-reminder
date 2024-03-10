# Google Calender Notification on Discord Bot

毎朝 Discord で Google Calender に登録されている今日の予定を教えてくれます。

## Setup

このスクリプトを動かすためには Google 社が開発している [clasp](https://github.com/google/clasp) が必要です。以下のコマンドを実行する前に公式ドキュメントを参考にインストールしてください。以下のコマンドで clasp がログイン情報を保持している前提で説明します。

```
$ clasp login
```

1. このリポジトリを clone します
2. `clasp create --type standalone` を実行し、GAS プロジェクトを作成します
3. `.clasp.json` が作成されていることを確認してから `clasp push` を実行してください
4. `clasp open` で GAS のエディタ画面が開きますので、下記のプロパティを設定画面から登録してください
5. 最後に好きなタイミングのトリガーを設定したら準備完了です

### Required properties

このスクリプトを実行する前に、以下の Script Properties を登録してください。

| プロパティ名 | 説明 |
| ---------- | --- |
| `WEBHOOK_URL` | Discord Channel の Webhook URL |
| `CALENDAR_ID` | Google Calendar の Calendar ID |

### Required actions for the first time

本スクリプトを実行するには権限を手動で付与する必要があります。上記のプロパティを設定したら**必ず**一回は `main()` を手動で実行してください。

Discord へ通知が送信されればOKです。

## LICENSE

[LICENSE](./LICENSE)

Code owner: OldBigBuddha<contact(at)oldbigbuddha.net>