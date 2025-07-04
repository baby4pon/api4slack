# api4slack

Node.js と Slack Bolt フレームワークを使用した WebSocket 対応 Slack Bot サーバー

## 概要

このプロジェクトは、WebSocket (Socket Mode) を使用したリアルタイム Slack Bot サーバーの実装です。従来の HTTP Request URL を必要とせず、WebSocket接続により高速で安定した通信を実現します。

## 機能

### スラッシュコマンド
- `/hello [名前]` - 挨拶メッセージを表示
- `/time` - 現在時刻を表示
- `/status` - WebSocket接続状態とサーバー情報を表示

### リアルタイム機能
- **ボットメンション対応**: @botname でボットと対話
- **インタラクティブボタン**: ボタンクリックによる操作
- **WebSocket接続監視**: 接続状態の自動監視と再接続
- **エラーハンドリング**: 詳細なエラー情報と復旧手順の表示

## 技術スタック

- Node.js
- @slack/bolt (WebSocket対応)
- dotenv
- debug (WebSocket接続デバッグ用)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` ファイルをコピーして `.env` ファイルを作成し、Slack App の認証情報を設定:

```bash
cp .env.example .env
```

`.env` ファイルに実際の値を設定:

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
```

**注意**: WebSocket (Socket Mode) を使用するため、`SLACK_APP_TOKEN` が必須です。

### 3. Slack App の設定

詳細な設定手順は [SLACK_SETUP.md](./docs/SLACK_SETUP.md) を参照してください。

### 4. アプリケーションの起動

```bash
# 本番モード
npm start

# 開発モード（ファイル変更監視）
npm run dev

# デバッグモード（詳細ログ出力）
npm run debug

# WebSocket接続デバッグモード
npm run websocket-test
```

## WebSocket (Socket Mode) の利点

- **Request URL不要**: ngrok などの外部トンネルが不要
- **リアルタイム通信**: 低遅延でのイベント処理
- **安定した接続**: 自動再接続機能
- **セキュリティ**: Slack側からの発信接続のため安全

## 開発環境での注意点

WebSocket (Socket Mode) を使用するため、従来の ngrok 設定は不要です。Slack App の設定で Socket Mode を有効にし、App-Level Token を取得してください。

## プロジェクト構造

```
api4slack/
├── app.js                        # メインアプリケーションファイル
├── package.json                  # 依存関係とスクリプト
├── .env                         # 環境変数（Git管理外）
├── .gitignore                   # Git除外設定
├── docs/                        # ドキュメントフォルダ
│   ├── SLACK_SETUP.md          # Slack App 設定手順
│   ├── sequence-diagrams.md    # システムシーケンス図
│   ├── user-interaction-flow.md # ユーザーインタラクション図
│   ├── system-architecture.md  # システムアーキテクチャ図
│   └── mermaid-guide.md        # Mermaid図利用ガイド
└── README.md                    # このファイル
```

## システム設計図

このプロジェクトでは、システムの理解を深めるためのMermaidシーケンス図を提供しています：

- **[システムシーケンス図](./docs/sequence-diagrams.md)** - 詳細な処理フローとコンポーネント間の相互作用
- **[ユーザーインタラクション図](./docs/user-interaction-flow.md)** - ユーザー視点での機能使用フロー
- **[システムアーキテクチャ図](./docs/system-architecture.md)** - 全体的なシステム構成と設計原則
- **[Mermaid図利用ガイド](./docs/mermaid-guide.md)** - 図の表示方法と更新手順

これらの図は以下の用途に活用できます：
- 新しい開発者のオンボーディング
- システムの保守・拡張時の参考資料
- 技術仕様書としてのドキュメント

## 使用方法

### スラッシュコマンド
Slackワークスペースで以下のコマンドを使用:

- `/hello` - 一般的な挨拶
- `/hello 太郎` - 名前を指定した挨拶  
- `/time` - 現在時刻の表示
- `/status` - WebSocket接続状態とサーバー情報

### インタラクティブ機能
- **ボットメンション**: `@botname こんにちは` でボットと対話
- **ボタン操作**: メッセージ内のボタンをクリックして操作
- **リアルタイム応答**: WebSocket接続による即座のレスポンス

### 接続状態の確認
```bash
# ログでWebSocket接続状態を確認
tail -f アプリケーションログ

# または /status コマンドでSlack内で確認
```

## ライセンス

MIT