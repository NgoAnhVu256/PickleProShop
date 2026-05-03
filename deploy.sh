#!/bin/bash
# ╔══════════════════════════════════════════════════╗
# ║     PicklePro — Safe Deployment Script           ║
# ║     Bảo vệ uploads khi deploy code mới           ║
# ╚══════════════════════════════════════════════════╝

set -e

PROJECT_DIR="/var/www/picklepro"
UPLOAD_DIR="$PROJECT_DIR/public/uploads"
BACKUP_DIR="/tmp/picklepro_uploads_backup"

echo "═══════════════════════════════════════════"
echo "  🚀 PicklePro Deploy — $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════"

cd "$PROJECT_DIR"

# ─── 1. Backup uploads (an toàn) ─────────────
echo ""
echo "📦 [1/7] Sao lưu thư mục uploads..."
if [ -d "$UPLOAD_DIR" ]; then
  rm -rf "$BACKUP_DIR"
  cp -r "$UPLOAD_DIR" "$BACKUP_DIR"
  echo "   ✅ Đã sao lưu $(find $UPLOAD_DIR -type f | wc -l) file vào $BACKUP_DIR"
else
  echo "   ⚠️  Không có thư mục uploads, bỏ qua."
fi

# ─── 2. Pull code mới ────────────────────────
echo ""
echo "📥 [2/7] Kéo code mới từ GitHub..."
git fetch origin main
git reset --hard origin/main
echo "   ✅ Đã cập nhật code"

# ─── 3. Khôi phục uploads ────────────────────
echo ""
echo "🔄 [3/7] Khôi phục thư mục uploads..."
if [ -d "$BACKUP_DIR" ]; then
  # Đảm bảo thư mục tồn tại
  mkdir -p "$UPLOAD_DIR"
  # Copy tất cả file từ backup, giữ nguyên cấu trúc
  cp -r "$BACKUP_DIR/"* "$UPLOAD_DIR/" 2>/dev/null || true
  echo "   ✅ Đã khôi phục uploads"
else
  mkdir -p "$UPLOAD_DIR"
  echo "   ⚠️  Không có backup, tạo thư mục uploads mới"
fi

# ─── 4. Install dependencies ─────────────────
echo ""
echo "📦 [4/7] Cài đặt dependencies..."
npm install --production=false
echo "   ✅ Dependencies OK"

# ─── 5. Generate Prisma ──────────────────────
echo ""
echo "🔧 [5/7] Generate Prisma Client..."
npx prisma generate
echo "   ✅ Prisma Client OK"

# ─── 6. Build ────────────────────────────────
echo ""
echo "🏗️  [6/7] Build production..."
npm run build
echo "   ✅ Build OK"

# ─── 7. Restart PM2 ──────────────────────────
echo ""
echo "🔄 [7/7] Restart PM2..."
pm2 restart all
echo "   ✅ PM2 restarted"

# ─── Cleanup ─────────────────────────────────
echo ""
echo "🧹 Dọn backup tạm..."
rm -rf "$BACKUP_DIR"

# ─── Verify ──────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
UPLOAD_COUNT=$(find "$UPLOAD_DIR" -type f 2>/dev/null | wc -l)
echo "  ✅ Deploy hoàn tất!"
echo "  📁 Uploads: $UPLOAD_COUNT file"
echo "  🌐 Website: https://picklepro.vn"
echo "═══════════════════════════════════════════"
