# Bàn giao triển khai: yêu thích theo tài khoản

Chưa triển khai lên Render: cần tài khoản có quyền quản trị service hiện có.

## Bản cập nhật cần triển khai

- Backend: thêm `bookmarkedCoaches` vào user; API thêm/bỏ HLV yêu thích có `JwtAuthGuard`.
- Cả giải đấu và HLV dùng MongoDB `$addToSet` / `$pull`, tránh ghi đè khi hai thiết bị cùng thao tác.
- Web: lấy lại `/users/profile` khi mở ứng dụng hoặc quay lại tab. Nếu lưu thất bại, hoàn tác trái tim và báo lỗi. Đăng nhập phải được backend xác thực.
- Không cần chuyển dữ liệu hoặc chạy script ghi vào database. Các trường mảng mới mặc định là rỗng, được tạo khi người dùng lưu lần đầu.

## Cho chủ dự án

1. Đưa các thay đổi backend/shared trong `account-favorites-backend.patch` vào nhánh mà service Render đang theo dõi. Patch được tạo từ HEAD `0a7395c`; kiểm tra `git apply --check deployment/account-favorites-backend.patch` trước khi áp dụng trên checkout chưa có thay đổi này.
2. Build shared: `npm install --prefix packages/shared` rồi `npm run build --prefix packages/shared`.
3. Build backend: `npm ci --prefix apps/backend` rồi `npm run build --prefix apps/backend`.
4. Trên service Render đang dùng `https://courtmate-backend-8t2s.onrender.com`, chọn **Manual Deploy → Deploy latest commit** của đúng nhánh đang cấu hình. Giữ nguyên database, biến môi trường và cấu hình service hiện có. Nếu dùng Docker, Dockerfile hiện tại là `apps/backend/Dockerfile`, build context là gốc repository.
5. Triển khai frontend hiện tại cùng bản cập nhật. `NEXT_PUBLIC_API_URL` phải trỏ tới backend vừa triển khai.

## Kiểm tra sau triển khai

- Không đăng nhập: PUT/DELETE `/users/bookmarks/:id` và `/users/coach-bookmarks/:id` trả về 401.
- Thiết bị A: đăng nhập tài khoản thật, yêu thích một giải đấu và một HLV; các request phải trả về 200, user trong response có ID tương ứng.
- Thiết bị B: mở trình duyệt độc lập, đăng nhập cùng tài khoản; `/users/profile` phải trả về cả `bookmarkedTournaments` và `bookmarkedCoaches`. Mở `/profile?tab=favorites` để xem hai tab.
- Bỏ một mục trên B, quay lại tab A: hồ sơ được đồng bộ lại và mục đó không còn trong danh sách.
- Tài khoản khác không thấy các mục yêu thích của tài khoản A.
- Nếu coach API trả về 404 thì backend mới chưa lên đúng service/nhánh; không coi lưu trong localStorage là đồng bộ thành công.
