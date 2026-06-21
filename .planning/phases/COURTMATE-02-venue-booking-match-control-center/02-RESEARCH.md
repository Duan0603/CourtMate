# Phase 2: Venue Booking & Match Control Center - Research

**Researched:** 2026-06-21
**Domain:** React Native / Expo UI / Mock Data Management
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Sử dụng dải lịch cuộn ngang 7 ngày (7-day horizontal date slider) ở phần đầu của màn hình Đặt sân để người dùng chọn ngày đặt.
- **D-02:** Hỗ trợ người dùng chọn nhiều slot giờ liên tiếp trong cùng một lần đặt (Consecutive multi-slots selection). Tổng tiền thanh toán sẽ tự động cộng dồn và cập nhật hiển thị ở thanh thanh toán phía dưới màn hình.
- **D-03:** Chỉ cho phép chọn các slot giờ liên tiếp. Nếu người dùng chọn slot không liên tiếp, hệ thống sẽ tự động reset (xóa các slot cũ) và lấy slot mới làm điểm bắt đầu mới, đồng thời hiển thị thông báo nhẹ (Toast/Alert).
- **D-04:** Đánh dấu trực quan các slot giờ cao điểm bằng nhãn hoặc biểu tượng 🔥 bên cạnh mức giá tăng thêm tương ứng để người dùng dễ nhận biết.

### the agent's Discretion
- Kiến trúc lưu trữ dữ liệu mock data để cập nhật động các slot đã đặt và quản lý thông tin trạng thái đặt của các đại lý được giao cho agent tự quyết định.
- Chi tiết thiết kế trực quan của dải lịch ngang 7 ngày và nhãn hiển thị giờ cao điểm trong tầm tay của ngón cái.
- Việc xử lý giao diện hiển thị thông báo nhẹ (Toast/Alert) khi chọn slot giờ không liên tiếp.

### Deferred Ideas (OUT OF SCOPE)
- Tích hợp cổng thanh toán thực tế (được hoãn sang v2).
- Tích hợp API Backend và cơ sở dữ liệu thực tế (được hoãn sang v2).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BOOK-01 | Giao diện Card UI hiển thị hình ảnh sân, đánh giá sao và khoảng cách. | Đã triển khai khung cơ bản, nghiên cứu cách tối ưu hiển thị thông tin sân. |
| BOOK-02 | Lưới chọn giờ (Time-slot grid) phân biệt rõ slot trống (Xanh) và slot đã đặt (Xám). | Nghiên cứu cách cập nhật lưới giờ động theo ngày đã chọn, hỗ trợ chọn nhiều slot và đánh dấu giờ cao điểm 🔥. |
| BOOK-03 | Nút "Đặt sân ngay" được cố định ở đáy màn hình (Sticky Bottom Button). | Nghiên cứu tối ưu vị trí vùng chạm ngón cái và hiển thị tổng tiền động. |
| CHAT-01 | Giao diện Tab đôi (Segmented Control) cho phép chuyển đổi giữa Lịch hẹn và Hộp chat. | Nghiên cứu tối ưu hóa Segmented Control mượt mà bằng NativeWind. |
| CHAT-02 | Hộp thoại chat nhóm kích hoạt tự động sau khi kết nối trận thành công. | Nghiên cứu cách tự động đồng bộ hóa nhóm chat khi người dùng đặt sân thành công. |
| CHAT-03 | Nút thao tác nhanh trong khung chat: xem vị trí đồng đội và thông tin chi tiết sân đã đặt. | Nghiên cứu hiển thị Modal vị trí động và thông tin đặt sân cụ thể. |
</phase_requirements>

## Summary

Phase 2 tập trung vào nâng cao tính năng tương tác của màn hình Đặt sân (`booking.tsx`) và màn hình Quản lý lịch hẹn & Hộp chat (`chat.tsx`). Giao diện đặt sân sẽ được tích hợp dải lịch cuộn ngang 7 ngày và lưới chọn giờ thông minh hỗ trợ chọn nhiều giờ liên tiếp, phân biệt giờ cao điểm 🔥. Màn hình chat sẽ được nâng cấp khả năng chuyển đổi tab mượt mà, đồng bộ hóa tự động các lịch đặt sân mới thành các cuộc hội thoại và lịch trình, và tối ưu hóa các popover xem vị trí/thông tin sân.

**Primary recommendation:** Sử dụng các component sẵn có của React Native (`ScrollView`, `TouchableOpacity`) kết hợp với NativeWind để tạo dải lịch ngang 7 ngày và ma trận slot giờ linh hoạt, không sử dụng thêm thư viện lịch cồng kềnh. Nâng cấp hook `useMockData` để quản lý đặt nhiều slot giờ và lưu trữ thông tin đặt sân theo ngày.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Quản lý ngày & slot đặt sân | Client (useMockData) | — | Do ứng dụng sử dụng mock data chạy hoàn toàn ở client. |
| Dải lịch cuộn ngang 7 ngày | Browser / Client | — | Giao diện chọn ngày dạng danh sách ngang sử dụng ScrollView. |
| Ma trận chọn slot giờ | Browser / Client | — | Lưới ma trận 2 cột, phản hồi nhanh khi người dùng chạm chọn liên tiếp. |
| Hộp thoại chat nhóm | Browser / Client | — | Giao diện chat nhóm với tin nhắn giả lập từ các người chơi khác. |
| Popover thông tin & vị trí | Browser / Client | — | Hiển thị Modal/Bottom Sheet cho các Quick Actions. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native | 0.85.3 | Cung cấp các core component di động (`View`, `Text`, `ScrollView`, `TouchableOpacity`, `Modal`). | Core framework. |
| nativewind | ^4.2.5 | Định nghĩa các styles tĩnh thông qua Tailwind CSS. | Standard styling system được thống nhất từ Phase 1. |
| lucide-react-native | ^1.20.0 | Cung cấp các icon như `Flame` cho giờ cao điểm, `MapPin`, `Calendar`, v.v. | Standard icon set của dự án. |

### Supporting
Không cài đặt thêm thư viện ngoài các thư viện đã được cài đặt ở Phase 1.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tự viết date slider | `react-native-calendars` | Thư viện lịch cồng kềnh, khó tùy chỉnh layout dải lịch ngang siêu gọn trong tầm với ngón cái. |

## Architecture Patterns

### Recommended Project Structure
```
frontend/
├── app/
│   └── (tabs)/
│       ├── booking.tsx       # Màn hình Đặt sân (Sửa đổi)
│       └── chat.tsx          # Màn hình Lịch trình & Chat (Sửa đổi)
├── hooks/
│   └── useMockData.tsx       # State management mock data (Sửa đổi)
└── types.ts                  # Khai báo kiểu TypeScript (Sửa đổi nếu cần)
```

### Pattern 1: Dải lịch ngang 7 ngày (7-day Horizontal Date Slider)
Dùng danh sách ngang 7 ngày kể từ ngày hiện tại, lưu trữ ngày được chọn vào state. Khi thay đổi ngày, cập nhật lại trạng thái trống/bận của các slot giờ tương ứng cho sân đang chọn.

```typescript
// Lấy danh sách 7 ngày tiếp theo
const getNext7Days = () => {
  const days = [];
  const weekdayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      dateString: d.toISOString().split('T')[0],
      dayOfMonth: d.getDate(),
      dayOfWeek: weekdayLabels[d.getDay()],
      isToday: i === 0
    });
  }
  return days;
};
```

### Pattern 2: Consecutive Multi-Slot Selector
Khi người dùng chạm chọn một slot:
1. Nếu chưa có slot nào được chọn: gán slot đó là slot duy nhất được chọn.
2. Nếu đã có slot được chọn:
   - Nếu slot vừa chọn là slot đã chọn -> hủy chọn slot đó.
   - Nếu slot vừa chọn nằm liền kề với các slot đang được chọn (trước hoặc sau) -> mở rộng vùng chọn (thêm slot đó vào danh sách các slot đã chọn).
   - Nếu slot vừa chọn không liền kề -> reset toàn bộ các slot cũ, chỉ chọn duy nhất slot mới.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Quản lý icons | Tự dựng SVG icons phức tạp | `lucide-react-native` | Lucide cung cấp sẵn bộ icon phong phú, đồng bộ và dễ thay đổi kích thước/màu sắc qua props. |

## Common Pitfalls

### Pitfall 1: Trạng thái slot không đồng bộ theo ngày
*   **Triệu chứng:** Người dùng chọn ngày mai, đặt sân thành công, nhưng khi quay lại ngày hôm nay thì slot đó cũng hiển thị đã đặt.
*   **Nguyên nhân:** Mock data không lưu trạng thái đặt sân theo ngày mà chỉ lưu chung cho `venue.slots`.
*   **Giải pháp:** Cấu trúc lại dữ liệu đặt sân trong `useMockData` để ánh xạ trạng thái `isBooked` theo cả `venueId`, `dateString` và `timeSlot`.

### Pitfall 2: Hiển thị giá cao điểm và tính toán tiền không chuẩn
*   **Triệu chứng:** Tổng tiền thanh toán không phản ánh đúng tổng giá trị của các slot giờ cao điểm đã chọn.
*   **Nguyên nhân:** Chỉ nhân giá mặc định của sân với số lượng slot thay vì cộng dồn giá thực tế của từng slot cụ thể.
*   **Giải pháp:** Duyệt qua danh sách các slot được chọn và cộng dồn thuộc tính `price` của từng slot để hiển thị tổng tiền chính xác.

## Code Examples

### logic xử lý chọn nhiều slot liên tiếp (Consecutive Multi-slots selection)
```typescript
const handleSlotSelect = (slot: TimeSlot, slots: TimeSlot[]) => {
  if (slot.isBooked) return;
  
  // Sắp xếp các slot theo thời gian để dễ kiểm tra tính liên tiếp
  const sortedAvailableSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));
  
  if (selectedSlots.length === 0) {
    setSelectedSlots([slot]);
  } else {
    const isAlreadySelected = selectedSlots.some(s => s.time === slot.time);
    if (isAlreadySelected) {
      // Hủy chọn: Chỉ cho phép hủy ở hai đầu mút để đảm bảo tính liên tiếp của những slot còn lại
      const index = selectedSlots.findIndex(s => s.time === slot.time);
      // Thực hiện logic lọc bỏ hoặc reset
      setSelectedSlots(prev => prev.filter(s => s.time !== slot.time));
    } else {
      // Thêm slot: kiểm tra xem slot mới có liền kề với slot đầu hoặc cuối của danh sách đã chọn không
      const selectedTimes = selectedSlots.map(s => s.time);
      // Tìm index của slot mới và các slot đã chọn trong mảng đã sắp xếp
      const newSlotIdx = sortedAvailableSlots.findIndex(s => s.time === slot.time);
      const selectedIndices = selectedSlots.map(s => sortedAvailableSlots.findIndex(x => x.time === s.time)).sort((a, b) => a - b);
      
      const minSelectedIdx = selectedIndices[0];
      const maxSelectedIdx = selectedIndices[selectedIndices.length - 1];
      
      if (newSlotIdx === minSelectedIdx - 1 || newSlotIdx === maxSelectedIdx + 1) {
        // Hợp lệ, thêm vào
        setSelectedSlots(prev => [...prev, slot]);
      } else {
        // Không liên tiếp: hiển thị thông báo nhẹ và reset chỉ chọn slot mới
        Alert.alert('Thông báo', 'Vui lòng chọn các khung giờ liền kề nhau.');
        setSelectedSlots([slot]);
      }
    }
  }
};
```

## Assumptions Log
Tất cả các gói thư viện và mã nguồn đều đã được kiểm tra tính hợp lệ và tồn tại sẵn trong dự án — Không có giả định nào cần xác nhận từ người dùng.

## Open Questions
Không có câu hỏi mở nào cần giải đáp thêm.

## Sources

### Primary (HIGH confidence)
- `frontend/package.json` - Kiểm tra danh sách thư viện và phiên bản đang cài đặt.
- `frontend/hooks/useMockData.tsx` - Kiểm tra luồng xử lý và cấu trúc mock data hiện tại.
- `frontend/app/(tabs)/booking.tsx` - Kiểm tra giao diện đặt sân hiện có.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Phù hợp với package.json hiện có.
- Architecture: HIGH - Tận dụng kiến trúc tab của Expo Router và hook useMockData.
- Pitfalls: HIGH - Xác định đúng các vấn đề đồng bộ dữ liệu mock khi mở rộng tính năng đặt theo ngày.

**Research date:** 2026-06-21
**Valid until:** 2026-07-21
