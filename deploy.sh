#!/bin/bash
# ══════════════════════════════════════════════════════════
#  PicklePro — Safe Deploy Script
#  Bảo vệ thư mục uploads khi update code mới
#  Chạy: bash deploy.sh
# ══════════════════════════════════════════════════════════

set -e

APP_DIR="/var/www/picklepro"
UPLOADS_SAFE="/var/www/picklepro-uploads"   # Thư mục uploads an toàn (ngoài project)

echo ""
echo "═══════════════════════════════════════════"
echo "  🚀 PicklePro Deploy - Bắt đầu..."
echo "═══════════════════════════════════════════"

cd "$APP_DIR"

# ─── Bước 1: Bảo vệ uploads ─────────────────────────────
echo ""
echo "📦 Bước 1: Bảo vệ uploads..."

# Lần đầu tiên: di chuyển uploads ra ngoài
if [ -d "$APP_DIR/public/uploads" ] && [ ! -L "$APP_DIR/public/uploads" ]; then
    echo "  → Phát hiện uploads trong project, di chuyển ra ngoài..."
    
    # Tạo thư mục an toàn nếu chưa có
    mkdir -p "$UPLOADS_SAFE"
    
    # Copy toàn bộ nội dung (giữ nguyên file gốc)
    cp -rn "$APP_DIR/public/uploads/"* "$UPLOADS_SAFE/" 2>/dev/null || true
    
    # Xóa thư mục cũ
    rm -rf "$APP_DIR/public/uploads"
    
    echo "  ✅ Đã di chuyển uploads → $UPLOADS_SAFE"
fi

# Đảm bảo thư mục an toàn tồn tại
mkdir -p "$UPLOADS_SAFE"

# ─── Bước 2: Pull code mới ──────────────────────────────
echo ""
echo "📥 Bước 2: Pull code mới từ GitHub..."
git fetch origin main
git reset --hard origin/main
echo "  ✅ Code đã cập nhật"

# ─── Bước 3: Khôi phục symlink uploads ──────────────────
echo ""
echo "🔗 Bước 3: Tạo lại symlink uploads..."

# Xóa nếu git tạo lại thư mục uploads
rm -rf "$APP_DIR/public/uploads" 2>/dev/null || true

# Tạo symlink
ln -sf "$UPLOADS_SAFE" "$APP_DIR/public/uploads"
echo "  ✅ Symlink: public/uploads → $UPLOADS_SAFE"

# ─── Bước 4: Install dependencies ───────────────────────
echo ""
echo "📦 Bước 4: Cài đặt dependencies..."
npm install --production=false
echo "  ✅ Dependencies đã cài"

# ─── Bước 5: Generate Prisma ────────────────────────────
echo ""
echo "🔧 Bước 5: Generate Prisma Client..."
npx prisma generate
echo "  ✅ Prisma Client đã generate"

# ─── Bước 6: Build ──────────────────────────────────────
echo ""
echo "🏗️  Bước 6: Build production..."
npm run build
echo "  ✅ Build hoàn thành"

# ─── Bước 7: Restart PM2 ────────────────────────────────
echo ""
echo "🔄 Bước 7: Restart PM2..."
pm2 restart all
echo "  ✅ PM2 đã restart"

# ─── Kiểm tra ───────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ DEPLOY HOÀN TẤT!"
echo "═══════════════════════════════════════════"
echo ""
echo "  📁 Uploads an toàn tại: $UPLOADS_SAFE"
echo "  🔗 Symlink: public/uploads → $UPLOADS_SAFE"

# Đếm file uploads
UPLOAD_COUNT=$(find "$UPLOADS_SAFE" -type f | wc -l)
echo "  📊 Tổng file uploads: $UPLOAD_COUNT"
echo ""
echo "  🌐 Website: https://picklepro.vn"
echo ""
