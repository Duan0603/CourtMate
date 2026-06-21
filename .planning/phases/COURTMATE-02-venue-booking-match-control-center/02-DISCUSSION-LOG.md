# Phase 2: Venue Booking & Match Control Center - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 2-Venue Booking & Match Control Center
**Areas discussed:** Booking Customization

---

## Booking Customization

### Cơ chế chọn ngày đặt sân
| Option | Description | Selected |
|--------|-------------|----------|
| Dải lịch cuộn ngang 7 ngày (7-day horizontal date slider) | Dễ dùng bằng một tay, trực quan cho các kèo thể thao trong tuần | ✓ |
| Lịch tháng đầy đủ dạng Modal (Full Calendar Picker) | Cho phép đặt lịch xa hơn 7 ngày | |
| Chỉ cho đặt trong ngày hôm nay (Today-only) | Tối giản tối đa cho bản thử nghiệm v1 | |

**User's choice:** Dải lịch cuộn ngang 7 ngày (7-day horizontal date slider)

---

### Cơ chế chọn slot giờ
| Option | Description | Selected |
|--------|-------------|----------|
| Đặt nhiều slot giờ liên tiếp (Consecutive multi-slots selection) | Người dùng có thể chọn nhiều giờ liền kề nhau và hệ thống tự động cộng dồn giá tiền | ✓ |
| Chỉ chọn duy nhất 1 slot giờ cố định (Single slot selection) | Mỗi khung giờ trong danh sách đã được chia sẵn (ví dụ 1.5 hoặc 2 tiếng cố định) | |

**User's choice:** Đặt nhiều slot giờ liên tiếp (Consecutive multi-slots selection)

---

### Quy tắc chọn các slot không liên tiếp
| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ cho phép chọn liên tiếp | Nếu chọn slot không liền kề, tự động xóa các slot đã chọn trước đó và coi slot mới chọn là slot bắt đầu mới, kèm thông báo nhẹ | ✓ |
| Cho phép đặt bất kỳ slot nào (kể cả không liên tiếp) | Hệ thống sẽ gom tất cả các slot đó vào chung một hóa đơn đặt sân duy nhất | |

**User's choice:** Chỉ cho phép chọn liên tiếp

---

### Hiển thị giá giờ cao điểm
| Option | Description | Selected |
|--------|-------------|----------|
| Đánh dấu trực quan slot cao điểm bằng nhãn hoặc icon nhỏ | Ví dụ biểu tượng 🔥 hoặc chữ 'Peak' bên cạnh giá tiền tăng thêm để người dùng dễ nhận biết | ✓ |
| Giữ giá cố định cho tất cả các slot giờ | Không phân biệt giờ cao điểm hay giờ thường về mặt hiển thị và giá cả | |

**User's choice:** Đánh dấu trực quan slot cao điểm bằng nhãn hoặc icon nhỏ (biểu tượng 🔥)

---

## the agent's Discretion

- Thiết kế giao diện chi tiết cho thanh dải lịch cuộn ngang 7 ngày.
- Quản lý trạng thái và tính toán giá tiền cộng dồn của nhiều slot.
- Hiển thị Toast/Alert khi chọn các slot giờ không liên tiếp.

## Deferred Ideas

- Tích hợp cổng thanh toán thực tế (hoãn sang v2).
- Tích hợp API Backend và cơ sở dữ liệu thực tế (hoãn sang v2).
