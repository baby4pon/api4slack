# Mermaid図 利用ガイド

このドキュメントでは、api4slack プロジェクトで提供されているMermaid図の活用方法を説明します。

## 📊 提供されている図の種類

### 1. [システムシーケンス図](./sequence-diagrams.md)
**用途**: 詳細な処理フロー理解、デバッグ、機能拡張時の参考

**含まれる図**:
- システム全体の概要図
- スラッシュコマンド詳細フロー  
- アプリメンション・ボタンインタラクション詳細フロー
- WebSocket接続管理フロー

**こんな時に使用**:
- 新機能追加時の影響範囲確認
- バグ調査時の処理フロー確認
- コードレビュー時の仕様確認

### 2. [ユーザーインタラクション図](./user-interaction-flow.md)
**用途**: ユーザー体験の理解、UI/UX改善、操作手順書作成

**含まれる図**:
- メインユーザーフロー
- 機能一覧表
- 技術仕様概要

**こんな時に使用**:
- ユーザー向けドキュメント作成
- サポート対応時の操作説明
- 新機能のユーザビリティ検討

### 3. [システムアーキテクチャ図](./system-architecture.md)
**用途**: 全体設計理解、インフラ構成検討、技術的意思決定

**含まれる図**:
- システム構成図
- データフロー図
- 接続・エラーハンドリング図
- セキュリティ・認証フロー

**こんな時に使用**:
- システム設計変更時の影響分析
- セキュリティ要件の確認
- パフォーマンス改善の検討

## 🛠️ Mermaidの表示方法

### GitHub上での表示
GitHubは標準でMermaidをサポートしているため、リポジトリ上で直接図を確認できます。

### ローカルでの表示

#### VS Code拡張機能
```bash
# Mermaid Preview 拡張機能をインストール
code --install-extension bierner.markdown-mermaid
```

#### オンラインエディタ
- [Mermaid Live Editor](https://mermaid.live/)
- [GitHub Mermaid Editor](https://github.dev)

#### CLI ツール
```bash
# Mermaid CLIのインストール
npm install -g @mermaid-js/mermaid-cli

# 図をPNG/SVGに変換
mmdc -i docs/sequence-diagrams.md -o output/diagrams.png
```

## 📝 図の更新・メンテナンス

### 機能追加時の更新手順

1. **新しいハンドラー追加時**
   ```mermaid
   # sequence-diagrams.md の該当セクションに追加
   User->>Slack: /new-command
   Slack->>Bot: command event (new-command)
   Bot->>Handler: new command handler
   ```

2. **新しいボタンアクション追加時**
   ```mermaid
   # user-interaction-flow.md の機能一覧テーブルに追加
   | 新機能 | 説明 | 使用例 |
   ```

3. **システム構成変更時**
   ```mermaid
   # system-architecture.md のシステム構成図を更新
   subgraph "New Component"
       NewService[新サービス]
   end
   ```

### 図の一貫性確保

- **命名規則**: 日本語とローマ字の統一
- **色分け**: 同じ種類のコンポーネントは同じ色
- **フロー方向**: 左から右、上から下の統一
- **詳細レベル**: ターゲットユーザーに応じた情報量調整

## 🔍 トラブルシューティング

### よくある表示問題

1. **図が表示されない**
   - Mermaid記法の構文エラーを確認
   - GitHub上でMarkdownプレビューを確認

2. **図が崩れる**
   - ノード名に特殊文字が含まれていないか確認
   - 矢印の記法が正しいか確認

3. **日本語が文字化け**
   - ファイルエンコーディングがUTF-8か確認
   - ブラウザの文字エンコーディング設定を確認

### 図の最適化

```mermaid
# 複雑な図は段階的に分割
sequenceDiagram
    participant A
    participant B
    
    Note over A,B: フェーズ1
    A->>B: ステップ1
    
    Note over A,B: フェーズ2  
    A->>B: ステップ2
```

## 📚 Mermaid記法リファレンス

### よく使用される記法

```mermaid
# シーケンス図
sequenceDiagram
    participant A as エンティティA
    A->>B: 同期メッセージ
    A-->>B: 非同期メッセージ
    B-->>A: レスポンス
    
    alt 条件分岐
        A->>C: 処理A
    else
        A->>D: 処理B
    end

    loop ループ処理
        A->>A: 繰り返し
    end

# フローチャート
flowchart TD
    A[開始] --> B{判定}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[終了]
    D --> E

# 状態図
stateDiagram-v2
    [*] --> State1
    State1 --> State2 : 遷移条件
    State2 --> [*]
```

## 🎯 まとめ

これらのMermaid図は以下の価値を提供します：

- **ドキュメントの可視化**: テキストだけでは理解困難な処理フローを図解
- **コミュニケーション改善**: チーム内での技術仕様共有を効率化
- **保守性向上**: システム理解の促進により保守コストを削減
- **品質向上**: 設計の可視化により設計品質を向上

定期的に図を更新し、実装との整合性を保つことで、プロジェクトの技術ドキュメントとしての価値を維持できます。