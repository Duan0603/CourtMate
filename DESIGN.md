# CourtMate Design System (DESIGN.md)

## Quy chuẩn layout web dùng chung

Nguồn thực thi: `apps/web/src/app/globals.css` và `apps/web/src/components/layout/PageContainer.tsx`.

- Khung trang: `PageContainer`, tối đa **1280px**, bao gồm lề trong. Không đặt thêm `max-w-*`, `mx-auto` hoặc `px-*` trên khung này.
- Lề ngang: **16px** dưới 640px, **24px** từ 640px, **40px** từ 1024px. Logo, menu header, nội dung và footer dùng cùng các token `--page-*`.
- Khoảng đầu trang: `page-section`, **28 / 32 / 40px** theo cùng breakpoint; khoảng cuối trang **64px**. `LayoutShell` tự chừa chiều cao header **72px**, trang con không cộng thêm lần nữa.
- Section cần nền tràn màn hình: nền ở wrapper ngoài; nội dung bên trong `PageContainer` hoặc phần tử semantic có class `page-container`.
- Biểu mẫu: `FormContainer`, dùng khung trang chung và giới hạn nội dung bên trong ở **960px**. Đoạn văn, modal và ticket có thể có chiều rộng đọc riêng bên trong khung; không thay đổi lề ngoài của trang.
- Trang đăng nhập/đăng ký tài khoản và bề mặt toàn màn hình như chat giữ bố cục chuyên biệt. Hero trang chủ có thể tràn màn hình; nội dung section thông thường vẫn theo khung chung.
- Khi thêm trang hoặc section, dùng các component/class trên. Chỉ sửa token chung khi cần đổi hệ thống, không thêm breakpoint hoặc chiều rộng riêng cho từng trang.

## Soft Claymorphism — web

The web interface uses molded clay depth on meaningful panels and interactive controls: a bright inner top edge, a darker inner bottom edge and one soft outer shadow. Keep tables, nested content, badges and text flat. Preserve CourtMate branding, existing copy, route structure and behavior.

### Sources of truth

- Material tokens: apps/web/src/styles/tokens.css, imported by globals.css.
- Tailwind semantic colors, radii and elevation: apps/web/tailwind.config.js.
- Ant Design: apps/web/src/lib/antd-theme.tsx. Numeric/color seed values mirror the material tokens because Ant Design derives palettes from literal colors; shadows reference CSS variables directly.
- Native controls: cm-button and cm-control in globals.css. Existing React props and event handlers are unchanged.

### Palette and typography

Primary #1E5AA8; hover #154687; primary tint #E8F1FA. Canvas #F3F7FB, surface white, muted surface #EDF3F9, border #D6E1ED, text #101828, secondary text #475467. Success #15803D, warning #A16207, error #BE123C, info brand blue. Semantic status colors may use Tailwind tonal steps for badges.

Keep Inter, including Vietnamese glyphs. Body 14–16px / 1.5–1.7; labels 12–14px; data tables retain compact legible text and tabular numerals. Page headings 28–36px; larger display type is reserved for marketing sections. Existing Tailwind spacing follows a 4px unit.

### Shape and depth

Small 8px: badges and pagination. Control 12px: buttons, inputs, dropdowns. Card 28px: panels, cards. Feature 36px: authentication, large sections and dialogs. Circular avatars and image favorite controls stay circular.

Subtle: quiet controls/header. Card: meaningful content groups. Elevated: overlays, dropdowns, dialogs. Interactive: primary controls and hover. Pressed: temporary inset feedback. Use shadow-subtle / shadow-card / shadow-elevated / shadow-interactive and token-backed radius classes. Do not add hard black shadows, colored glow, nested raised cards or per-page token sets.

### Interaction

Focus outlines remain visible with keyboard navigation. Disabled controls have reduced contrast and no raised/pressed effects. Error states use semantic error color and existing validation messages. Use short transitions; avoid scale effects and layout shift. Honor prefers-reduced-motion for CSS, entrance animation, cursor tracking and the 3D story (static content and CTA).

Preserve the current header behavior, including its search and home hero transparency at the top, then white background with brand text after scrolling. Header/footer/page edges use the shared page tokens above. The navigation structure changed in a parallel edit during this refactor; its functionality is preserved.

### Existing component APIs

Use Ant Design Button variants through its existing type/danger props, Input, Select, Checkbox, Modal, Drawer, Dropdown, Popover, Tooltip, Tabs, Tag, Table, Pagination, Alert and notification APIs. Their shared provider supplies the visual system. Native buttons/forms keep their existing props and cm-button/cm-control classes. Toasts use cm-toast. Keep native data tables flat inside their enclosing panel.

Web refactoring does not alter the mobile application theme or backend.

### Home surfaces to preserve

Home hero occupies at least one full viewport (`100svh`), with a prominent heading. The user explicitly requested preserving the original two-row animated review carousel, including its original composition and content. Do not replace it with a short static grid or a new pagination interaction. Existing requested removals of the home location badge and tournament promotional paragraph still apply.

3D story headings render as one normal text node, preserving word spacing and responsive wrapping. Animate the whole heading/paragraph, not SplitText-generated word/character DOM. Keep layout centering on wrappers separate from the elements GSAP animates.

### Comparison deck on About

Desktop: left explanatory copy, right overlapping deck. Mobile: copy above deck. Click/Enter/Space flips the active card; horizontal drag or the forward arrow advances; the back arrow appears after advancing and restores the previous card and its face. Arrow keys navigate. The end state supports going back or restarting. Vertical touch scrolling and reduced-motion are preserved. Existing comparison content and brand colors remain.
