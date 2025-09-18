const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting static build for Firebase Hosting...');

// next.config.tsを一時的に変更
const configPath = path.join(__dirname, 'next.config.ts');
const originalConfig = fs.readFileSync(configPath, 'utf-8');

// 静的エクスポート設定を追加
const staticConfig = originalConfig.replace(
  'const nextConfig: NextConfig = {',
  `const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },`
);

// 設定を一時保存
fs.writeFileSync(configPath, staticConfig);

try {
  // ビルド実行
  console.log('🔨 Building static files...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build successful! Static files are in the "out" directory.');
  console.log('📤 You can now run: firebase deploy');
} catch (error) {
  console.error('❌ Build failed:', error.message);
} finally {
  // 元の設定に戻す
  fs.writeFileSync(configPath, originalConfig);
  console.log('🔄 Restored original configuration');
}