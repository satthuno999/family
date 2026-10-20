# family.devbyspark.com

Trang thiệp 20/10 cho gia đình — 1 file `index.html` tĩnh, không build, không phụ thuộc.

- Font + thang xám theo Minimal (devbyspark.com), màu hồng cho 20/10.
- Hiệu ứng chữ "ml5" và album parallax lấy ý tưởng từ trang cưới `satthuno999/wedding`, viết lại bằng CSS/JS thuần.
- `og.png` — ảnh xem trước khi gửi link qua Zalo/Messenger.
- `CNAME` — tên miền cho GitHub Pages.

## Sửa nội dung

Mở `index.html`, tìm `SỬA NỘI DUNG Ở ĐÂY`:

- `FAMILY` — mỗi người một thiệp: `role`, `name`, `to` (dòng mở đầu lời chúc), `wish`, `photo` (vd `photos/me.jpg`; để trống thì hiện bông hoa).
- `PHOTOS` — danh sách ảnh album, vd `['photos/1.jpg', 'photos/2.jpg']`; để trống thì ẩn album.

Ảnh bỏ vào thư mục `photos/` (nên nén ≤ 300 KB/ảnh, ảnh dọc 3:4).

## Xem thử trên máy

```bash
python -m http.server 5520 --directory G:/spark/github/family
```

## Deploy (GitHub Pages, tài khoản satthuno999)

1. Repo public `satthuno999/family`, nhánh `main`, Pages: deploy from branch `main` / root.
2. DNS ở PA Vietnam (devbyspark.com): thêm `CNAME  family  →  satthuno999.github.io.`
3. Khi GitHub cấp xong chứng chỉ: bật "Enforce HTTPS" trong Settings → Pages.

Sửa nội dung sau này: commit + push lên `main`, Pages tự cập nhật sau ~1 phút.
