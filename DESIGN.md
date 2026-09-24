# CourtMate Design System (DESIGN.md)

> Bản quy chuẩn thiết kế UI/UX và Hệ thống Design Tokens dành cho dự án **CourtMate** (Web Landing Page & Mobile React Native App).  
> Giúp đồng bộ giao diện 100% giữa Web, App Mobile và tất cả các thành phần giao diện (Components).

---

## 1. 🌟 Triết lý Thiết kế (Design Philosophy)

* **Sporty Premium & Modern Organic**: Kết hợp năng lượng thể thao sôi nổi với nét hiện đại, sang trọng, mềm mại (bo tròn hữu cơ, góc bo cắt tinh tế).
* **Mobile-First & Single-Hand Touch Target**: Tất cả nút tương tác chính (CTA) có kích thước tối thiểu `48px`, hình hạt đậu/viên thuốc (`rounded-full`), nằm trong tầm với ngón cái.
* **Tương phản & Độ rõ ràng (High Legibility)**: Sử dụng chữ cực đậm (`font-black` / `font-bold`) trên nền sáng dịu mắt, khoảng thở rộng rãi (`padding/gap` phóng khoáng).
* **Chuyển động có mục đích (Purposeful Motion)**: Sử dụng GSAP & CSS keyframes tạo hiệu ứng nổi nhẹ (`float`), hiệu ứng kính mờ (`glassmorphism`) và phản hồi lập tức khi chạm/hover.

---

## 2. 🎨 Hệ thống Design Tokens (Color Palette)

### 2.1 Bảng màu chính (Brand & Surface Colors)

| Token | Mã HEX | HSL / Opacity | Công dụng & Mô tả |
| :--- | :--- | :--- | :--- |
| `color-primary` | `#1E5AA8` | `hsl(215, 69.6%, 38.8%)` | **Royal Sporty Blue**: Màu thương hiệu chính, nút CTA chính, active state, logo accent. |
| `color-primary-hover` | `#154687` | `hsl(215, 73.1%, 30.8%)` | Trạng thái Hover / Press của nút chính. |
| `color-primary-light` | `#E8F1FA` | `rgba(30, 90, 168, 0.1)` | Nền Badge, Tag highlight, Active Tab. |
| `color-bg-lp` | `#FFFBF7` | `hsl(33, 100%, 98.4%)` | **Warm Soft Off-White**: Màu nền Landing Page (ấm áp, dịu mắt). |
| `color-bg-app` | `#F8FAFC` | `hsl(210, 40%, 98%)` | **Cool Neutral Light**: Màu nền App Shell & Dashboard. |
| `color-surface` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Nền Card, Modal, Header, Thẻ thông tin. |
| `color-surface-subtle`| `#F2F4F7` | `hsl(216, 20%, 95.9%)` | Khung ảnh minh họa, Placeholder container. |

### 2.2 Bảng màu Văn bản (Typography Colors)

| Token | Mã HEX | Tailwind Class | Công dụng |
| :--- | :--- | :--- | :--- |
| `text-main` | `#101828` | `text-[#101828]` | Tiêu đề H1, H2, H3, Logo, Văn bản quan trọng nhất. |
| `text-muted` | `#475467` | `text-[#475467]` | Đoạn văn mô tả (Body text), Subtitle, Footer link, Helper text. |
| `text-inverse` | `#FFFFFF` | `text-white` | Văn bản trên nền xanh hoặc nền tối. |

---

## 3. ✍️ Typography & Font System

* **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
* **Scale & Hierarchy**:

| Style Name | Size (Web / Mobile) | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | `clamp(2.5rem, 5.5vw, 5.5rem)` | `900` (`font-black`) | `1.15` | `-0.03em` |
| **Section Title (H2)**| `36px - 48px` (`text-4xl`/`5xl`) | `900` (`font-black`) | `1.1` | `-0.02em` |
| **Card Title (H3)** | `20px - 24px` (`text-xl`/`2xl`) | `700` (`font-bold`) | `1.25` | `-0.01em` |
| **Body Large** | `18px - 20px` (`text-lg`/`xl`) | `500` (`font-medium`)| `1.6` | `0` |
| **Body Regular** | `14px - 16px` (`text-sm`/`base`)| `400` / `500` | `1.5` | `0` |
| **Badge / Label** | `12px - 14px` (`text-xs`/`sm`) | `700` (`font-bold`) | `1.0` | `0.15em uppercase` |

---

## 4. 🔲 Bo tròn, Đổ bóng & Hiệu ứng (Shape, Shadows & Effects)

### 4.1 Corner Radii (Bo tròn)
* **Pill / Fully Rounded**: `9999px` (`rounded-full`) — Dùng cho nút CTA, Badge, Input tìm kiếm tròn.
* **Large Card Radius**: `32px` (`rounded-[32px]`) — Dùng cho Thẻ tính năng, Banner minh họa.
* **Section / Modal Radius**: `40px` (`rounded-[40px]`) — Dùng cho Khối CTA lớn, Modal chính.
* **Organic Cut-Corner**: Đường cắt góc lõm mượt ở Header / Card nổi bật (`nav-right-block::before`).

### 4.2 Elevation & Shadows (Đổ bóng)
* **Card Elevation**: `0 32px 80px rgba(0,0,0,0.08)` — Bóng đổ mỏng rộng tạo cảm giác bồng bềnh nhẹ.
* **Primary Button Shadow**: `0 10px 25px rgba(30, 90, 168, 0.25)` — Glossy Blue Glow cho nút CTA.
* **Floating Header Shadow**: `0 4px 40px rgba(0,0,0,0.03)`.

### 4.3 Glassmorphism (Hiệu ứng kính mờ)
```css
.glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
```

---

## 5. 🧩 Quy chuẩn Component (Component Specifications)

### 5.1 Nút bấm (Button Variants)

1. **Primary Button (Nút chính)**:
   - Style: `bg-[#1E5AA8] text-white px-8 py-4 rounded-full font-bold shadow-md hover:bg-[#154687] hover:scale-[1.02] transition-all`
   - Kích thước Touch Target: Chiều cao tối thiểu `48px` - `56px`.

2. **Secondary Button (Nút phụ / Ghost)**:
   - Style: `bg-white text-[#1E5AA8] border border-[#1E5AA8]/20 px-6 py-3 rounded-full font-bold hover:bg-[#1E5AA8]/5 transition-colors`

3. **CTA Floating Button (Mobile & Final Call-to-Action)**:
   - Style: `bg-white text-[#1E5AA8] px-10 py-5 rounded-full font-bold text-lg hover:scale-105 shadow-xl`

### 5.2 Thẻ thông tin (Card Specs)
- Background: `#FFFFFF` hoặc `#F2F4F7`
- Border-radius: `32px`
- Overflow: `hidden`
- Padding: `2rem` (32px) cho nội dung bên trong

### 5.3 Badge / Tag
- Style: `px-4 py-1.5 bg-[#1E5AA8]/10 text-[#1E5AA8] rounded-full text-xs font-bold tracking-[0.15em] uppercase inline-block`

---

## 6. 🎬 Hiệu ứng Chuyển động (Motion & Animation Rules)

* **Hero Floating Icons Animation**:
  - `floatY`: Di chuyển từ dưới lên 100vh trong 15s - 25s, opacity 0.06.
  - `floatX`: Xoay lắc nhẹ từ -15deg đến 15deg.
* **Scroll-driven Entrance**:
  - Sử dụng GSAP `ScrollTrigger` với `duration: 1`, `ease: 'power3.out'`.
  - Giảm thiểu chuyển động khi người dùng bật `prefers-reduced-motion`.

---

## 7. 📱 Quy chuẩn React Native / Mobile App

Để ứng dụng di động đồng bộ 100% với Web Landing Page:

```typescript
export const Theme = {
  colors: {
    primary: '#1E5AA8',
    primaryPressed: '#154687',
    primaryLight: 'rgba(30, 90, 168, 0.1)',
    background: '#FFFBF7',
    backgroundApp: '#F8FAFC',
    surface: '#FFFFFF',
    textMain: '#101828',
    textMuted: '#475467',
  },
  radii: {
    full: 9999,
    card: 32,
    modal: 40,
  },
  typography: {
    fontFamily: 'Inter',
  },
};
```

---

> **Lưu ý thực thi:** Mọi component mới được tạo trên Web hoặc App Mobile cần đọc trực tiếp từ bộ Design Tokens trên để đảm bảo trải nghiệm người dùng nhất quán tuyệt đối!
