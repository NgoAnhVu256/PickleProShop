# Hướng dẫn triển khai (Deploy) PicklePro lên VPS Linux qua Terminal (HTTP Only)

Tài liệu này hướng dẫn chi tiết từng bước loại bỏ Certbot, cấu hình Nginx chạy cổng 80 (HTTP Only) và kết nối qua Cloudflare (Flexible SSL) cho dự án **PicklePro** (`picklepro.vn`).

---

## BƯỚC 1: Đẩy mã nguồn mới nhất lên GitHub (từ máy cá nhân)

1. Mở Terminal trên máy tính cá nhân của bạn:
   ```bash
   cd d:\PicklePro
   ```
2. Lưu và đẩy mã nguồn lên GitHub:
   ```bash
   git add .
   git commit -m "feat: chuyển đổi sang HTTP Only qua Cloudflare và loại bỏ Certbot"
   git push origin main
   ```

---

## BƯỚC 2: Kết nối VPS và xóa hoàn toàn Certbot

### 1. SSH vào VPS của bạn
```bash
ssh root@<IP_VPS_CUA_BAN>
```

### 2. Xóa chứng chỉ Let's Encrypt cũ
```bash
sudo certbot delete --cert-name picklepro.vn
```

### 3. Gỡ cài đặt hoàn toàn Certbot
Chạy cả hai lệnh này để đảm bảo gỡ sạch phần mềm:
```bash
# Gỡ qua snap nếu cài bằng snap
sudo snap remove certbot

# Gỡ qua apt nếu cài bằng apt-get
sudo apt-get purge -y certbot python3-certbot-nginx
sudo apt-get autoremove -y

# Xóa các thư mục Let's Encrypt còn sót lại
sudo rm -rf /etc/letsencrypt /var/log/letsencrypt /var/lib/letsencrypt
```

---

## BƯỚC 3: Cấu hình Nginx chạy cổng 80 (HTTP Only)

Vì toàn bộ phần SSL/HTTPS sẽ được Cloudflare xử lý ở phía trước, máy chủ VPS của bạn chỉ cần lắng nghe cổng HTTP 80 thông thường.

1. Mở file cấu hình Nginx của website trên VPS:
   ```bash
   sudo nano /etc/nginx/sites-available/picklepro
   # Hoặc nếu bạn đang dùng file default:
   # sudo nano /etc/nginx/sites-available/default
   ```
2. Thay thế toàn bộ nội dung file bằng cấu hình dưới đây:
   ```nginx
   server {
       listen 80;
       listen [::]:80;
       server_name picklepro.vn www.picklepro.vn;

       # Cấu hình cache cho thư mục uploads của PicklePro
       location /uploads/ {
           alias /var/www/picklepro/public/uploads/;
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }

       # Proxy ngược về ứng dụng Next.js chạy cổng 3000
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;

           # Nhận thông tin IP thật và giao thức HTTPS từ Cloudflare gửi về
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
       }
   }
   ```
3. Lưu và thoát trình soạn thảo:
   - Nhấn `Ctrl + O` rồi nhấn `Enter` để lưu.
   - Nhấn `Ctrl + X` để thoát.

4. Kiểm tra cấu hình và khởi động lại Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## BƯỚC 4: Cấu hình Cloudflare Flexible SSL

Bây giờ, bạn cấu hình Cloudflare để chuyển hướng người dùng vào giao thức HTTPS bảo mật:

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) và chọn tên miền `picklepro.vn`.
2. Kiểm tra bản ghi DNS:
   - Bản ghi `A` trỏ về IP của VPS đã được bật đám mây màu cam (**Proxied**).
3. Cài đặt SSL/TLS:
   - Vào **SSL/TLS** -> **Overview** -> Chọn chế độ **Flexible**.
   - Vào **SSL/TLS** -> **Edge Certificates** -> Bật **Always Use HTTPS** lên.

---

## BƯỚC 5: Triển khai ứng dụng (Deploy) trên VPS

Dự án PicklePro của bạn sử dụng PM2 để chạy ngầm và file `deploy.sh` để cập nhật code. Bạn chỉ cần chạy lệnh sau trên VPS để deploy:

```bash
# 1. Di chuyển vào thư mục dự án trên VPS
cd /var/www/picklepro

# 2. Phân quyền thực thi cho file deploy.sh (nếu chưa có)
chmod +x deploy.sh

# 3. Chạy deploy script để cập nhật mã nguồn mới nhất và restart PM2
./deploy.sh
```

---
*Nếu gặp bất kỳ vấn đề gì hoặc web bị lỗi "Can't be reached", vui lòng kiểm tra xem PM2 và Next.js đã khởi chạy thành công ở cổng 3000 chưa bằng lệnh: `pm2 status` hoặc `pm2 logs`.*
