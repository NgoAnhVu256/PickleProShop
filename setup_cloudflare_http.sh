#!/bin/bash
# ╔══════════════════════════════════════════════════╗
# ║   PicklePro — Script chuyển đổi sang HTTP Only    ║
# ║         Gỡ bỏ Certbot & Cấu hình Nginx           ║
# ╚══════════════════════════════════════════════════╝

set -e

# Đảm bảo chạy dưới quyền root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Vui lòng chạy script này với quyền root (sudo)."
  exit 1
fi

echo "═══════════════════════════════════════════"
echo "  🚀 Bắt đầu chuyển cấu hình PicklePro sang HTTP Only..."
echo "═══════════════════════════════════════════"

# 1. Xóa chứng chỉ Let's Encrypt cũ
echo ""
echo "📦 [1/5] Kiểm tra và xóa chứng chỉ Let's Encrypt..."
if command -v certbot &> /dev/null; then
  echo "   - Đang tìm các chứng chỉ hiện có..."
  # Tìm chứng chỉ liên quan đến picklepro
  CERT_NAME="picklepro.vn"
  if certbot certificates | grep -q "$CERT_NAME"; then
    echo "   - Đang xóa chứng chỉ $CERT_NAME..."
    certbot delete --cert-name "$CERT_NAME" --non-interactive || true
  else
    echo "   - Không tìm thấy chứng chỉ Let's Encrypt cho $CERT_NAME."
  fi

  # Gỡ bỏ phần mềm Certbot
  echo "   - Đang gỡ cài đặt Certbot..."
  if command -v snap &> /dev/null && snap list | grep -q certbot; then
    snap remove certbot || true
  fi
  apt-get purge -y certbot python3-certbot-nginx || true
  apt-get autoremove -y || true
else
  echo "   - Certbot chưa từng được cài đặt hoặc đã được gỡ bỏ."
fi

# Xóa các thư mục rác Let's Encrypt
rm -rf /etc/letsencrypt /var/log/letsencrypt /var/lib/letsencrypt
echo "   ✅ Đã xóa sạch cấu hình Certbot & Let's Encrypt."

# 2. Cấu hình Nginx
echo ""
echo "⚙️ [2/5] Đang cấu hình lại Nginx cho cổng 80 (HTTP Only)..."

# Xác định file cấu hình Nginx
NGINX_CONF="/etc/nginx/sites-available/picklepro"
NGINX_LINK="/etc/nginx/sites-enabled/picklepro"

# Nếu file sites-available/picklepro không tồn tại, kiểm tra default
if [ ! -f "$NGINX_CONF" ]; then
  echo "   - Không tìm thấy /etc/nginx/sites-available/picklepro."
  echo "   - Sử dụng file cấu hình mặc định /etc/nginx/sites-available/default..."
  NGINX_CONF="/etc/nginx/sites-available/default"
fi

# Tạo bản sao lưu cấu hình cũ phòng trường hợp lỗi
BACKUP_CONF="${NGINX_CONF}.backup_$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONF" "$BACKUP_CONF"
echo "   - Đã sao lưu cấu hình cũ tại: $BACKUP_CONF"

# Ghi cấu hình mới vào file Nginx
cat << 'EOF' > "$NGINX_CONF"
server {
    listen 80;
    listen [::]:80;
    server_name picklepro.vn www.picklepro.vn;

    # Cấu hình thư mục uploads công cộng của PicklePro
    location /uploads/ {
        alias /var/www/picklepro/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy về Next.js app đang chạy cổng 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Chuyển tiếp IP thật và giao thức HTTPS từ Cloudflare
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }
}
EOF

# Đảm bảo symlink được liên kết (nếu cấu hình riêng)
if [ "$NGINX_CONF" = "/etc/nginx/sites-available/picklepro" ] && [ ! -L "$NGINX_LINK" ]; then
  ln -s "$NGINX_CONF" "$NGINX_LINK" || true
fi

echo "   ✅ Đã cấu hình xong file Nginx."

# 3. Mở cổng tường lửa UFW
echo ""
echo "🛡️ [3/5] Đang kiểm tra và mở cổng tường lửa..."
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
  ufw allow 80/tcp || true
  ufw reload || true
  echo "   ✅ Đã mở cổng 80 trên tường lửa UFW."
else
  echo "   - UFW không hoạt động hoặc không được cài đặt. Bỏ qua."
fi

# 4. Kiểm tra và khởi động lại Nginx
echo ""
echo "🔄 [4/5] Đang kiểm tra lỗi cú pháp và khởi động lại Nginx..."
if nginx -t; then
  systemctl restart nginx
  echo "   ✅ Khởi động lại Nginx thành công!"
else
  echo "   ❌ Lỗi cú pháp cấu hình Nginx! Đang khôi phục cấu hình cũ..."
  cp "$BACKUP_CONF" "$NGINX_CONF"
  systemctl restart nginx
  exit 1
fi

# 5. Khởi động lại ứng dụng PM2
echo ""
echo "🚀 [5/5] Khởi động lại PM2 ứng dụng PicklePro..."
if command -v pm2 &> /dev/null; then
  pm2 restart all || true
  echo "   ✅ Đã khởi động lại PM2."
else
  echo "   ⚠️ Không tìm thấy pm2 được cài đặt toàn cục, hãy chạy deploy.sh của dự án sau."
fi

echo "═══════════════════════════════════════════"
echo " 🎉 Đã hoàn tất cấu hình trên VPS thành công!"
echo " 🌐 Vui lòng truy cập Cloudflare cấu hình SSL thành 'Flexible' để hoạt động."
echo "═══════════════════════════════════════════"
