# Slack App 設定手順（Socket M3. 「Scopes」セクションの「Bot Token Scopes」で以下を追加:
   - `commands` - スラッシュコマンドの使用
   - `chat:write` - メッセージの送信
   - `chat:write.public` - パブリックチャンネルへの書き込み
   - `app_mentions:read` - ボットへのメンション読み取り用）

このプロジェクトではSocket Modeを使用しており、Request URLやngrokが不要です。

## 1. Slack App の作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. App Name: `api4slack` (任意の名前)
5. Workspace: 使用するワークスペースを選択
6. 「Create App」をクリック

## 2. Socket Mode の有効化（重要）

1. 左サイドバーから「Socket Mode」をクリック
2. 「Enable Socket Mode」をオンにする
3. Token Name: `api4slack-app-token` (任意の名前)
4. 「Generate」をクリック
5. 表示された **App-Level Token** をコピー（xapp-で始まる）
   - このトークンは後で使用するため、安全に保存してください

## 3. Bot User の追加とスコープ設定

1. 左サイドバーから「OAuth & Permissions」をクリック
2. 「Scopes」セクションの「Bot Token Scopes」で以下を追加:
   - `commands` - スラッシュコマンドの使用
   - `chat:write` - メッセージの送信
   - `chat:write.public` - パブリックチャンネルへの書き込み

## 4. スラッシュコマンドの作成

1. 左サイドバーから「Slash Commands」をクリック
2. 「Create New Command」をクリック

### /hello コマンド
- Command: `/hello`
- Request URL: **空白のまま**（Socket Modeでは不要）
- Short Description: `挨拶メッセージを表示`
- Usage Hint: `[名前]`

### /time コマンド
- Command: `/time`
- Request URL: **空白のまま**（Socket Modeでは不要）
- Short Description: `現在時刻を表示`
- Usage Hint: (空白)

### /status コマンド
- Command: `/status`
- Request URL: **空白のまま**（Socket Modeでは不要）
- Short Description: `WebSocket接続状態とサーバー情報を表示`
- Usage Hint: (空白)

## 5. Event Subscriptions の設定

1. 左サイドバーから「Event Subscriptions」をクリック
2. 「Enable Events」をオンにする
3. Request URL: **空白のまま**（Socket Modeでは不要）
4. 「Subscribe to bot events」セクションで以下のイベントを追加:
   - `app_mention` - ボットへのメンション処理用

## 6. Interactive Components の設定（ボタン機能用）

1. 左サイドバーから「Interactivity & Shortcuts」をクリック
2. 「Interactivity」をオンにする
3. Request URL: **空白のまま**（Socket Modeでは不要）

## 6. 認証情報の取得

1. 「OAuth & Permissions」ページで「Install to Workspace」をクリック
2. 権限を確認して「Allow」をクリック
3. 「Bot User OAuth Token」をコピー（xoxb-で始まる）
4. 「Basic Information」ページの「App Credentials」から「Signing Secret」をコピー
5. 手順2で取得した「App-Level Token」も確認（xapp-で始まる）

## 7. 環境変数の設定

`.env` ファイルを作成または編集して、取得した認証情報を設定:

```bash
# Bot User OAuth Token
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token

# Signing Secret
SLACK_SIGNING_SECRET=your-actual-signing-secret

# App-Level Token（Socket Mode用）
SLACK_APP_TOKEN=xapp-your-actual-app-token

# ポート番号（Socket Modeでは使用されないが設定可能）
PORT=3000
```

## 8. アプリケーションのテスト

1. アプリケーションを起動:
   ```bash
   npm start
   ```

2. コンソールに「Slack Bot サーバーが Socket Mode で起動しました」と表示されることを確認

3. Slackワークスペースでボットが追加されたチャンネルで以下をテスト:
   - `/hello` または `/hello 太郎`
   - `/time`
   - `/status`
   - `@botname こんにちは` (ボットへのメンション)
   - ボタンクリック機能のテスト

## Socket Mode の利点

- ✅ **HTTPSエンドポイント不要**: ngrokやReverse Proxyが不要
- ✅ **ファイアウォール問題なし**: 外部からの接続を受け入れる必要がない
- ✅ **開発が簡単**: ローカル環境で直接開発・テストが可能
- ✅ **本番環境でも使用可能**: より簡単なデプロイ
- ✅ **URLの変更なし**: 毎回URLを設定し直す必要がない

## 注意事項

- **App-Level Token**は適切に管理してください（.envファイルに含めて、Gitにコミットしないよう注意）
- Socket Modeは比較的新しい機能ですが、小規模から中規模のBotには最適です
- 大規模なアプリケーションや高いパフォーマンスが必要な場合は、HTTP Modeも検討してください

## トラブルシューティング

### 「Socket connection failed」エラーが発生する場合
1. `SLACK_APP_TOKEN`が正しく設定されているか確認
2. Socket Modeが有効になっているか確認
3. App-Level Tokenが正しくコピーされているか確認

### コマンドが反応しない場合
1. `SLACK_BOT_TOKEN`が正しく設定されているか確認
2. Botがワークスペースにインストールされているか確認
3. スラッシュコマンドが正しく作成されているか確認
