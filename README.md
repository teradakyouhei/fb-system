# FB-System（富士防災システム受注管理）

株式会社富士防災システムの受注管理システム（防災・消防設備関連）

## 🚀 技術スタック

- **フレームワーク**: Next.js 15.5.2 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4.0
- **データベース**: SQLite（開発）→ PostgreSQL（本番予定）
- **ORM**: Prisma 6.15.0
- **認証**: NextAuth.js
- **PWA**: next-pwa（オフライン対応）
- **CSV処理**: PapaParse
- **バリデーション**: Zod
- **フォーム**: React Hook Form
- **アイコン**: Lucide React

## 📱 PWA機能

- **オフライン対応**: Service Workerによるキャッシュ
- **ホーム画面追加**: スマホ・タブレットでネイティブアプリのように使用可能
- **ショートカット**: 受注一覧、新規受注、日程管理への直接アクセス
- **背景同期**: オフライン時のデータ同期（予定）

## 🗄️ データベース構造

### マスター管理
- **ユーザー管理** (`users`): システムアカウント
- **得意先マスター** (`customers`): 顧客情報
- **仕入先マスター** (`suppliers`): 業者情報  
- **商品マスター** (`products`): 商品・部品情報
- **担当者マスター** (`staff`): 社員・営業担当

### 業務管理
- **受注管理** (`orders`): メイン受注情報
- **受注明細** (`order_details`): 商品別明細
- **工事項目** (`construction_items`): 工事作業項目
- **発注管理** (`purchase_orders`): 仕入発注
- **発注明細** (`purchase_order_details`): 発注商品明細
- **請求・入金** (`billings`): 売上・入金管理
- **日程管理** (`schedules`): 作業スケジュール
- **CSV インポートログ** (`import_logs`): データ移行履歴

## 📊 主要機能

### 1. 受注管理
- 受注一覧（検索・絞り込み、CSV出力）
- 受注登録（複雑な明細入力、工事項目管理）
- 金額集計（期間指定集計、詳細レポート）

### 2. 請求・入金管理
- 請求・入金一覧（請求状況管理）
- 売掛金集計（顧客別売掛残高）
- 集金予定表（スケジュール管理）

### 3. 発注管理
- 発注一覧（仕入先別管理）
- 在庫一覧（商品在庫状況）
- 発注登録（発注書作成）

### 4. 日程管理
- 日程一覧（カレンダー表示、作業スケジュール）
- 受注日別（日別受注状況）
- 点検月別（定期点検スケジュール）
- 次年度登録（年度更新機能）

### 5. CSV インポート・エクスポート
- 既存システムからのデータ移行
- Excel/CSV一括出力
- データバリデーション・エラーハンドリング

## 🛠️ セットアップ

### 1. パッケージインストール
```bash
npm install
```

### 2. データベース設定
```bash
# Prismaクライアント生成
npm run db:generate

# データベース作成・マイグレーション
npm run db:push

# サンプルデータ投入
npm run db:seed
```

### 3. 開発サーバー起動
```bash
npm run dev
```

### 4. Prisma Studio（データベース管理）
```bash
npm run db:studio
```

## 🔧 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動  
npm run start

# ESLint実行
npm run lint

# Prismaクライアント生成
npm run db:generate

# データベーススキーマ更新
npm run db:push

# Prisma Studio起動
npm run db:studio

# サンプルデータ投入
npm run db:seed
```

## 📝 初期ログイン情報

### 管理者アカウント
- **ユーザー名**: admin
- **パスワード**: admin123

## 🏗️ プロジェクト構造

```
fb-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── orders/            # 受注管理
│   │   ├── billing/           # 請求・入金
│   │   ├── purchase/          # 発注管理
│   │   ├── schedule/          # 日程管理
│   │   ├── masters/           # マスター管理
│   │   ├── users/             # ユーザー管理
│   │   └── api/               # API Routes
│   ├── components/            # 共通コンポーネント
│   │   ├── ui/               # UIコンポーネント
│   │   ├── forms/            # フォーム関連
│   │   └── tables/           # テーブル関連
│   └── lib/                  # ユーティリティ
│       ├── prisma.ts         # Prismaクライアント
│       └── csv.ts            # CSV処理
├── prisma/
│   ├── schema.prisma         # データベーススキーマ
│   └── dev.db               # SQLiteデータベース
├── public/
│   ├── manifest.json        # PWAマニフェスト
│   └── icons/               # PWAアイコン
└── README.md
```

## 📋 開発フェーズ

### Phase 1: 基盤構築 ✅
1. Next.js プロジェクト初期化
2. Prisma + SQLite セットアップ  
3. PWA設定追加
4. CSV読み込み機能実装

### Phase 2: 認証・基本UI（次回）
1. NextAuth.js認証実装
2. 基本レイアウト・ナビゲーション
3. ダッシュボード作成

### Phase 3: マスター管理
1. ユーザー管理画面
2. 得意先マスター
3. 仕入先マスター  
4. 商品マスター
5. 担当者マスター

### Phase 4: 受注管理
1. 受注一覧・検索
2. 受注登録フォーム
3. 明細入力機能
4. 金額集計機能

### Phase 5: その他機能
1. 発注・日程管理
2. 請求・分析機能
3. PDF出力機能
4. 本番環境移行

## 🚀 デプロイ

### 本番環境準備
1. PostgreSQLデータベース準備
2. Vercel/Railway等へのデプロイ
3. 環境変数設定
4. ドメイン・SSL設定

---

**開発開始準備完了！** 🎉

SQLite + PWA対応で完全無料での開発が可能です。
本番リリース時にPostgreSQL等のクラウドDBに移行予定。