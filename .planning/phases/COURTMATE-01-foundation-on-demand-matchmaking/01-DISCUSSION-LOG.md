# Phase 1: Foundation & On-Demand Matchmaking - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-18
**Phase:** 1-Foundation & On-Demand Matchmaking
**Areas discussed:** Tech Stack & Language, Routing & Navigation, Map & Matchmaking, Animation & UI Performance

---

## Tech Stack & Language

| Option | Description | Selected |
|--------|-------------|----------|
| JavaScript | Sử dụng JavaScript thông thường cho React Native/Expo | |
| TypeScript | Sử dụng TypeScript với chế độ strict và path aliasing | ✓ |

**User's choice:** TypeScript
**Notes:** Người dùng yêu cầu sử dụng TypeScript để đảm bảo tính an toàn kiểu dữ liệu và nâng cao chất lượng code.

---

## Routing & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| React Navigation | Thư viện React Navigation truyền thống (Stack, Tabs) | |
| Expo Router | File-system routing dựa trên cấu trúc thư mục `app/` | ✓ |

**User's choice:** Expo Router
**Notes:** Sử dụng Expo Router để có cấu trúc định tuyến hiện đại, dễ bảo trì giống Next.js.

---

## Map & Matchmaking

| Option | Description | Selected |
|--------|-------------|----------|
| React Native Maps (Mock) | Hiển thị bản đồ thực tế với tọa độ mock và các markers giả lập | ✓ |
| Static Images / Canvas | Vẽ giao diện bản đồ tĩnh hoặc dùng ảnh chụp để demo | |

**User's choice:** React Native Maps (Mock)
**Notes:** Dùng bản đồ thực với dữ liệu mock để tạo cảm giác trải nghiệm thực tế cho người dùng khi tìm kiếm.

---

## Animation & UI Performance

| Option | Description | Selected |
|--------|-------------|----------|
| Animated API | API Animated mặc định của React Native | |
| React Native Reanimated | Sử dụng Reanimated chạy trực tiếp trên UI Thread để tối ưu hóa hiệu năng | ✓ |

**User's choice:** React Native Reanimated
**Notes:** Đảm bảo hiệu ứng sóng Radar quét mượt mà 60fps/120fps mà không gây lag luồng JS chính.

---

## Styling & Design System

| Option | Description | Selected |
|--------|-------------|----------|
| NativeWind (Tailwind CSS) | Sử dụng đồng nhất NativeWind cho các styles tĩnh, cấm inline style trừ hoạt ảnh động | ✓ |
| Hybrid / StyleSheet | Cho phép kết hợp tự do giữa NativeWind và React Native StyleSheet thông thường | |

**User's choice:** NativeWind (Tailwind CSS)
**Notes:** Ép buộc sử dụng NativeWind để tăng tính đồng nhất giao diện và dễ bảo trì. Sử dụng các kích thước chữ mặc định của Tailwind (text-xs, text-sm, v.v.) thay vì tự định nghĩa tùy chỉnh.

---

## Agent's Discretion

- Quyết định về cấu trúc thư mục chi tiết (components, hooks, constants) và các quy chuẩn viết code chi tiết.
- Các mock coordinates cụ thể cho sân và đối thủ lân cận.

## Deferred Ideas

- Tích hợp API Backend và cổng thanh toán thực tế (hoãn sang v2).
- Các tính năng của Phase 2 (Đặt sân, Group Chat).
