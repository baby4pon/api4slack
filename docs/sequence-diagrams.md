# Slack Bot システム シーケンス図

このドキュメントでは、api4slack Slack Botの主要な動作フローをMermaidシーケンス図で説明します。

## 1. システム全体の概要図

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Slack as Slack API
    participant Bot as Slack Bot (Socket Mode)
    participant WS as WebSocket接続

    Note over Bot,WS: アプリケーション起動
    Bot->>WS: WebSocket接続開始
    WS-->>Bot: 接続確立 (open event)
    Bot->>Bot: 接続状態監視開始
    
    Note over User,Bot: スラッシュコマンド実行
    User->>Slack: /hello [名前]
    Slack->>Bot: コマンドイベント受信
    Bot->>Bot: ack() - 受信確認
    Bot->>Bot: レスポンス生成
    Bot->>Slack: respond() - 応答送信
    Slack->>User: メッセージ表示

    Note over User,Bot: ボットメンション
    User->>Slack: @bot こんにちは
    Slack->>Bot: app_mention イベント
    Bot->>Bot: メンション処理
    Bot->>Slack: say() - インタラクティブメッセージ送信
    Slack->>User: ボタン付きメッセージ表示

    Note over User,Bot: ボタンクリック
    User->>Slack: ボタンクリック (check_time)
    Slack->>Bot: action イベント受信
    Bot->>Bot: ack() - アクション確認
    Bot->>Bot: 時刻データ生成
    Bot->>Slack: say() - 時刻情報送信
    Slack->>User: 時刻メッセージ表示

    Note over Bot,WS: 定期監視
    loop 30秒ごと
        Bot->>Bot: 接続状態チェック
        Bot->>Bot: 接続時刻更新
    end
```

## 2. スラッシュコマンド詳細フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Slack as Slack API
    participant Bot as Slack Bot
    participant Handler as コマンドハンドラー

    Note over User,Handler: /hello コマンド
    User->>Slack: /hello 太郎
    Slack->>Bot: command event (hello)
    Bot->>Handler: command handler 呼び出し
    Handler->>Handler: await ack() - 受信確認
    Handler->>Handler: command.text から名前取得
    Handler->>Handler: レスポンスメッセージ作成
    Handler->>Slack: await respond(message)
    Slack->>User: "こんにちは、太郎！" 表示
    Handler->>Handler: ログ出力

    Note over User,Handler: /time コマンド  
    User->>Slack: /time
    Slack->>Bot: command event (time)
    Bot->>Handler: time handler 呼び出し
    Handler->>Handler: await ack()
    Handler->>Handler: 現在時刻取得・フォーマット
    Handler->>Handler: ブロック形式でメッセージ作成
    Handler->>Slack: await respond(timeMessage)
    Slack->>User: 時刻情報ブロック表示

    Note over User,Handler: /status コマンド
    User->>Slack: /status
    Slack->>Bot: command event (status)
    Bot->>Handler: status handler 呼び出し
    Handler->>Handler: await ack()
    Handler->>Handler: サーバー稼働時間計算
    Handler->>Handler: 接続状態情報取得
    Handler->>Handler: ステータスブロック作成
    Handler->>Slack: await respond(statusMessage)
    Slack->>User: サーバー状態表示

    Note over Handler: エラーハンドリング
    alt エラー発生時
        Handler->>Handler: console.error()
        Handler->>Slack: エラーメッセージ送信
        Slack->>User: "申し訳ございません..." 表示
    end
```

## 3. アプリメンション・ボタンインタラクション詳細フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Slack as Slack API
    participant Bot as Slack Bot
    participant MentionHandler as メンションハンドラー
    participant ActionHandler as アクションハンドラー

    Note over User,ActionHandler: ボットメンション処理
    User->>Slack: @bot こんにちは
    Slack->>Bot: app_mention event
    Bot->>MentionHandler: mention handler 呼び出し
    MentionHandler->>MentionHandler: event.text.toLowerCase()
    
    alt 挨拶メッセージの場合
        MentionHandler->>MentionHandler: ボタン付きメッセージ作成
        MentionHandler->>Slack: say() - インタラクティブメッセージ
        Slack->>User: ボタン表示 ("時刻を確認", "ヘルプ")
    else 時刻問い合わせの場合
        MentionHandler->>MentionHandler: 現在時刻取得
        MentionHandler->>Slack: say() - 時刻メッセージ
        Slack->>User: "現在時刻は..." 表示
    else その他の場合
        MentionHandler->>Slack: say() - ヘルプメッセージ
        Slack->>User: コマンド一覧表示
    end

    Note over User,ActionHandler: ボタンクリック処理
    User->>Slack: "時刻を確認" ボタンクリック
    Slack->>Bot: action event (check_time)
    Bot->>ActionHandler: check_time handler 呼び出し
    ActionHandler->>ActionHandler: await ack() - アクション確認
    ActionHandler->>ActionHandler: 詳細時刻フォーマット
    ActionHandler->>ActionHandler: ブロック形式メッセージ作成
    ActionHandler->>Slack: say() - 時刻情報送信
    Slack->>User: 詳細時刻表示

    User->>Slack: "ヘルプ" ボタンクリック  
    Slack->>Bot: action event (show_help)
    Bot->>ActionHandler: show_help handler 呼び出し
    ActionHandler->>ActionHandler: await ack()
    ActionHandler->>ActionHandler: ヘルプブロック作成
    ActionHandler->>Slack: say() - ヘルプ情報送信
    Slack->>User: 詳細ヘルプ表示

    Note over ActionHandler: エラーハンドリング
    alt エラー発生時
        ActionHandler->>ActionHandler: console.error()
        Note over ActionHandler: ユーザーには通知なし（サイレント失敗）
    end
```

## 4. WebSocket接続管理フロー

```mermaid
sequenceDiagram
    participant App as アプリケーション
    participant SlackApp as Slack App Instance
    participant WS as WebSocket接続
    participant Monitor as 接続監視

    Note over App,Monitor: アプリケーション初期化
    App->>SlackApp: new App(config) 作成
    App->>SlackApp: socketMode: true 設定
    App->>SlackApp: socketModeOptions 設定
    
    Note over App,Monitor: イベントハンドラー設定
    App->>SlackApp: client.on('open') 設定
    App->>SlackApp: client.on('close') 設定  
    App->>SlackApp: client.on('error') 設定

    Note over App,Monitor: アプリケーション起動
    App->>SlackApp: await app.start()
    SlackApp->>WS: WebSocket接続開始
    WS-->>SlackApp: 接続確立
    SlackApp-->>App: open event 発火
    App->>App: console.log("接続確立")
    App->>Monitor: connectionStatus.isConnected = true
    App->>Monitor: connectionStatus.lastConnected 更新

    Note over App,Monitor: 定期監視開始
    App->>Monitor: setInterval(30秒) 開始
    loop 30秒ごと
        Monitor->>Monitor: 接続状態チェック
        alt 接続中の場合
            Monitor->>Monitor: lastConnected 更新
        end
    end

    Note over App,Monitor: 接続断絶時
    WS-->>SlackApp: 接続切断
    SlackApp-->>App: close event 発火
    App->>App: console.log("接続切断")
    App->>Monitor: 再接続処理開始

    Note over App,Monitor: エラー発生時
    WS-->>SlackApp: エラー発生
    SlackApp-->>App: error event 発火
    App->>App: console.error("接続エラー")
    App->>Monitor: connectionStatus.reconnectCount++

    Note over App,Monitor: 再接続処理
    SlackApp->>SlackApp: 自動再接続試行
    Note over SlackApp: 設定: retries=5, factor=1.5
    SlackApp->>WS: 再接続試行
    alt 再接続成功
        WS-->>SlackApp: 接続再確立
        SlackApp-->>App: open event 発火
        App->>Monitor: 接続状態リセット
    else 再接続失敗
        SlackApp-->>App: 最大試行回数到達
        App->>App: アプリケーション終了
    end

    Note over App,Monitor: グローバルエラーハンドリング
    App->>App: process.on('unhandledRejection')
    App->>App: process.on('uncaughtException')
    alt 未処理エラー発生
        App->>App: console.error() 
        App->>App: process.exit(1)
    end
```

## 5. システム設計のポイント

### Socket Mode の利点
- HTTPSエンドポイント不要（ngrok、Reverse Proxy不要）
- ファイアウォール問題なし
- リアルタイムWebSocket通信
- 開発環境で直接テスト可能

### エラーハンドリング戦略
- 各ハンドラーでの try-catch
- WebSocket接続の自動再試行
- グローバルエラーハンドラー
- 詳細なログ出力

### 接続監視機能
- 30秒間隔での接続状態チェック
- 再接続回数の記録
- 稼働時間の追跡
- `/status` コマンドでの状態確認

これらのシーケンス図は、システムの理解と保守性向上、新機能追加時の参考資料として活用してください。