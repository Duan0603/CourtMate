# Phase 2: Venue Booking & Match Control Center - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Thiết kế chi tiết giao diện Đặt sân (Venue Booking Screen) dạng Card UI và lưới chọn ma trận Slot giờ, và Giao diện tab đôi Lịch hẹn & Hộp chat nhóm (Chat Screen) kèm các nút thao tác nhanh.
</domain>

<decisions>
## Implementation Decisions

### Booking Customization (Chọn ngày & Đặt nhiều slot giờ)
- **D-01:** Sử dụng dải lịch cuộn ngang 7 ngày (7-day horizontal date slider) ở phần đầu của màn hình Đặt sân để người dùng chọn ngày đặt.
- **D-02:** Hỗ trợ người dùng chọn nhiều slot giờ liên tiếp trong cùng một lần đặt (Consecutive multi-slots selection). Tổng tiền thanh toán sẽ tự động cộng dồn và cập nhật hiển thị ở thanh thanh toán phía dưới màn hình.
- **D-03:** Chỉ cho phép chọn các slot giờ liên tiếp. Nếu người dùng chọn slot không liên tiếp, hệ thống sẽ tự động reset (xóa các slot cũ) và lấy slot mới làm điểm bắt đầu mới, đồng thời hiển thị thông báo nhẹ (Toast/Alert).
- **D-04:** Đánh dấu trực quan các slot giờ cao điểm bằng nhãn hoặc biểu tượng 🔥 bên cạnh mức giá tăng thêm tương ứng để người dùng dễ nhận biết.

### the agent's Discretion
- Kiến trúc lưu trữ dữ liệu mock data để cập nhật động các slot đã đặt và quản lý thông tin trạng thái đặt của các đại lý được giao cho agent tự quyết định.
- Chi tiết thiết kế trực quan của dải lịch ngang 7 ngày và nhãn hiển thị giờ cao điểm trong tầm tay của ngón cái.
- Việc xử lý giao diện hiển thị thông báo nhẹ (Toast/Alert) khi chọn slot giờ không liên tiếp.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications
- [.planning/PROJECT.md](file:///d:/EXE101/.planning/PROJECT.md) — Định nghĩa mô hình, giá trị cốt lõi và các quyết định công nghệ tổng thể.
- [.planning/REQUIREMENTS.md](file:///d:/EXE101/.planning/REQUIREMENTS.md) — Yêu cầu chi tiết chức năng cho BOOK và CHAT.
- [.planning/ROADMAP.md](file:///d:/EXE101/.planning/ROADMAP.md) — Tiêu chí thành công của Phase 2 và danh sách các plan.
- [.planning/STATE.md](file:///d:/EXE101/.planning/STATE.md) — Trạng thái hiện tại của dự án.
- [.planning/phases/COURTMATE-01-foundation-on-demand-matchmaking/01-CONTEXT.md](file:///d:/EXE101/.planning/phases/COURTMATE-01-foundation-on-demand-matchmaking/01-CONTEXT.md) — Ngữ cảnh đã lưu từ Phase 1.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/hooks/useMockData.ts`: Hook cung cấp danh sách sân thể thao (`venues`), lịch hẹn (`userMatches`), hộp thoại chat (`activeConversations`), và các hàm cập nhật như `bookVenueSlot` và `sendChatMessage`. Cần nâng cấp hook này để hỗ trợ đặt nhiều slot, lọc theo ngày và đánh giá giờ cao điểm.
- `frontend/constants/MockData.ts`: Chứa danh sách các môn thể thao (`SPORTS_LIST`) và các hằng số dữ liệu khác.

### Established Patterns
- Thiết kế giao diện sử dụng **NativeWind (Tailwind CSS)** cho styling.
- Thiết kế **Dark Mode** chủ đạo kết hợp màu Neon Green/Lime Green (mã màu đại diện `#39FF14` hoặc lớp CSS Tailwind tương ứng).
- Sử dụng **lucide-react-native** cho các biểu tượng (như `Star`, `MapPin`, `Calendar`, `Clock`, `Check`, v.v.).

### Integration Points
- `frontend/app/(tabs)/booking.tsx`: Màn hình đặt sân hiện tại. Cần sửa đổi để thêm dải lịch ngang 7 ngày, cập nhật lưới chọn slot giờ hỗ trợ đặt nhiều slot liên tiếp, xử lý reset khi chọn không liên tiếp, hiển thị biểu tượng cao điểm 🔥 và tính toán tổng tiền thanh toán động.
- `frontend/app/(tabs)/chat.tsx`: Màn hình lịch trình và chat nhóm hiện tại.

</code_context>

<specifics>
## Specific Ideas
- Khi chạm chọn slot giờ cao điểm 🔥, giá trị tiền tương ứng sẽ hiển thị tăng thêm và hiển thị ở phần Bottom Bar.
- Dải lịch cuộn ngang 7 ngày hiển thị Thứ/Ngày (ví dụ: T2 - 22, T3 - 23...) và làm nổi bật ngày đang chọn bằng màu Neon Green.
</specifics>

<deferred>
## Deferred Ideas
- Tích hợp cổng thanh toán thực tế (được hoãn sang v2).
- Tích hợp API Backend và cơ sở dữ liệu thực tế (được hoãn sang v2).
</deferred>

---

*Phase: 2-Venue Booking & Match Control Center*
*Context gathered: 2026-06-21*
