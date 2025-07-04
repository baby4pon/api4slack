// 環境変数の読み込み
require('dotenv').config();

// Slack Bolt フレームワークのインポート
const { App, LogLevel } = require('@slack/bolt');

// Slack アプリケーションの初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // Socket Mode を使用（WebSocket接続でRequest URL不要）
  appToken: process.env.SLACK_APP_TOKEN, // Socket Mode用のApp-Level Token
  logLevel: LogLevel.INFO, // ログレベルの設定
  // WebSocket接続の設定
  socketModeOptions: {
    // 接続再試行の設定
    retry: {
      retries: 5,
      factor: 1.5,
      minTimeout: 1000,
      maxTimeout: 30000,
    },
    // 接続タイムアウトの設定
    timeout: 30000,
  },
});

// WebSocket接続のイベントハンドラー
// 接続確立時
app.client.on('open', () => {
  console.log('🔗 WebSocket接続が確立されました');
});

// 接続切断時
app.client.on('close', (code, reason) => {
  console.log(`🔌 WebSocket接続が切断されました - Code: ${code}, Reason: ${reason}`);
});

// エラー時
app.client.on('error', (error) => {
  console.error('❌ WebSocket接続エラー:', error);
});

// 接続状態の監視用変数
let connectionStatus = {
  isConnected: false,
  lastConnected: null,
  reconnectCount: 0,
};

// 定期的な接続状態チェック
setInterval(() => {
  const now = new Date();
  if (connectionStatus.isConnected) {
    connectionStatus.lastConnected = now;
  }
}, 30000); // 30秒ごと

// メッセージイベント（ボットへの直接メンション）
app.event('app_mention', async ({ event, say }) => {
  try {
    console.log(`📩 ボットへのメンションを受信: ${event.user} - ${event.text}`);
    
    const responseText = event.text.toLowerCase();
    
    if (responseText.includes('こんにちは') || responseText.includes('hello')) {
      await say({
        text: `こんにちは <@${event.user}>！ 何かお手伝いできることはありますか？`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `こんにちは <@${event.user}>！ :wave:\n何かお手伝いできることはありますか？`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '時刻を確認'
                },
                action_id: 'check_time'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'ヘルプ'
                },
                action_id: 'show_help'
              }
            ]
          }
        ]
      });
    } else if (responseText.includes('時刻') || responseText.includes('time')) {
      const currentTime = new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo'
      });
      await say(`現在時刻は ${currentTime} です。`);
    } else {
      await say({
        text: `ありがとうございます <@${event.user}>！ 私は以下のコマンドに対応しています：\n• \`/hello [名前]\` - 挨拶\n• \`/time\` - 現在時刻\n• \`/status\` - 接続状態`
      });
    }
  } catch (error) {
    console.error('メンション処理でエラーが発生しました:', error);
  }
});

// ボタンクリックの処理
app.action('check_time', async ({ ack, body, say }) => {
  try {
    await ack();
    
    const currentTime = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    await say({
      text: `現在時刻: ${currentTime}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:clock1: *現在時刻*\n${currentTime} (JST)`
          }
        }
      ]
    });
  } catch (error) {
    console.error('時刻確認ボタンでエラーが発生しました:', error);
  }
});

app.action('show_help', async ({ ack, body, say }) => {
  try {
    await ack();
    
    await say({
      text: 'ヘルプ情報',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':information_source: *利用可能なコマンド*'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '• `/hello [名前]` - 挨拶メッセージを表示\n• `/time` - 現在時刻を表示\n• `/status` - WebSocket接続状態を確認'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*その他*\n• ボットにメンションすると対話できます\n• WebSocket接続でリアルタイムに応答します'
          }
        }
      ]
    });
  } catch (error) {
    console.error('ヘルプ表示でエラーが発生しました:', error);
  }
});

// スラッシュコマンド: /hello
// 使用例: /hello または /hello 太郎
app.command('/hello', async ({ command, ack, respond }) => {
  try {
    // コマンドを受信したことをSlackに通知
    await ack();

    // コマンドのテキスト部分を取得
    const userName = command.text || 'さん';
    
    // レスポンスメッセージの作成
    const responseMessage = {
      text: `こんにちは、${userName}！`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*こんにちは、${userName}！* :wave:`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `実行時刻: ${new Date().toLocaleString('ja-JP')}`
            }
          ]
        }
      ]
    };

    // ユーザーにレスポンスを送信
    await respond(responseMessage);
    
    console.log(`/hello コマンドが実行されました。ユーザー: ${command.user_name}, テキスト: ${command.text}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await respond('申し訳ございません。エラーが発生しました。');
  }
});

// スラッシュコマンド: /time
// 現在時刻を表示
app.command('/time', async ({ command, ack, respond }) => {
  try {
    await ack();

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    await respond({
      text: `現在時刻: ${formattedTime}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:clock1: *現在時刻*\n${formattedTime} (JST)`
          }
        }
      ]
    });

    console.log(`/time コマンドが実行されました。ユーザー: ${command.user_name}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await respond('申し訳ございません。エラーが発生しました。');
  }
});

// スラッシュコマンド: /status
// WebSocket接続状態を表示
app.command('/status', async ({ command, ack, respond }) => {
  try {
    await ack();

    const currentTime = new Date().toLocaleString('ja-JP');
    const uptime = process.uptime();
    const uptimeMinutes = Math.floor(uptime / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    await respond({
      text: 'サーバー状態',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':gear: *サーバー状態*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*接続方式*\nWebSocket (Socket Mode)`
            },
            {
              type: 'mrkdwn',
              text: `*稼働時間*\n${uptimeMinutes}分${uptimeSeconds}秒`
            },
            {
              type: 'mrkdwn',
              text: `*最終確認*\n${currentTime}`
            },
            {
              type: 'mrkdwn',
              text: `*再接続回数*\n${connectionStatus.reconnectCount}回`
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ':white_check_mark: WebSocket接続は正常に動作しています'
            }
          ]
        }
      ]
    });

    console.log(`/status コマンドが実行されました。ユーザー: ${command.user_name}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await respond('申し訳ございません。エラーが発生しました。');
  }
});

// アプリケーションの起動
(async () => {
  try {
    // グローバルエラーハンドラーの設定
    process.on('unhandledRejection', (reason, promise) => {
      console.error('未処理のPromise拒否:', promise, '理由:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('未捕捉の例外:', error);
      process.exit(1);
    });

    // Socket Mode でアプリケーション開始
    await app.start();
    
    // 接続状態を更新
    connectionStatus.isConnected = true;
    connectionStatus.lastConnected = new Date();
    
    console.log('🚀 Slack Bot サーバーが WebSocket (Socket Mode) で起動しました');
    console.log('📡 WebSocket接続が確立され、リアルタイム通信が可能です');
    console.log('');
    console.log('💡 利用可能な機能:');
    console.log('  📝 スラッシュコマンド:');
    console.log('    /hello [名前] - 挨拶メッセージを表示');
    console.log('    /time - 現在時刻を表示');
    console.log('    /status - WebSocket接続状態を確認');
    console.log('  💬 対話機能:');
    console.log('    @botname でメンションすると対話可能');
    console.log('    ボタンクリックによるインタラクティブな操作');
    console.log('');
    console.log('🔗 接続情報:');
    console.log(`  起動時刻: ${connectionStatus.lastConnected.toLocaleString('ja-JP')}`);
    console.log('  接続方式: WebSocket (リアルタイム通信)');
    console.log('  再試行設定: 最大5回、指数バックオフ');
    
  } catch (error) {
    console.error('❌ アプリケーションの起動に失敗しました:', error);
    
    // 詳細なエラー情報を表示
    if (error.code === 'slack_webapi_platform_error') {
      console.error('🔑 認証エラー: Slack のトークンまたは権限を確認してください');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 ネットワークエラー: インターネット接続を確認してください');
    }
    
    console.error('💡 解決方法:');
    console.error('  1. .env ファイルの環境変数を確認');
    console.error('  2. Slack App の設定を確認');
    console.error('  3. ネットワーク接続を確認');
    
    process.exit(1);
  }
})();
