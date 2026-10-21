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

## Sports print / neo-brutalism — web

The user explicitly replaced claymorphism with flat saturated color blocks, thick black outlines, hard displaced black shadows, chunky display type and physical button presses. This is the visual authority for all web routes. Preserve CourtMate content, data, navigation and responsive page frames.

### Sources of truth

- Material and palette tokens: apps/web/src/styles/tokens.css.
- Shared print components, typography and navigation: apps/web/src/styles/print.css, imported by globals.css.
- Tailwind colors, radii, default border width and shadow aliases: apps/web/tailwind.config.js.
- Ant Design seed and component tokens: apps/web/src/lib/antd-theme.tsx; print.css supplies outlined popup, table, input and button treatments.
- Scoped comparison, favorites, coaches and 3D overlay CSS inherit the same tokens.

### Palette and type

Canvas, header, footer and page backgrounds are pure white #FFFFFF. Neutral ink/outline is #111111 and secondary text #3F3F3F. The only decorative accents are tan #D2B48C, baby blue #8FD9FB and dark blue #1848FF (the existing review action blue). Use white text on dark blue and ink text on tan/baby blue. Do not add yellow, green, coral, purple, red or tinted page canvases. Status meanings must remain explicit in labels/icons rather than relying on extra colors. Photography, 3D materials and official sign-in provider artwork retain their content colors.

Headings and display labels use Be Vietnam Pro 800/900, self-hosted by next/font, with Vietnamese glyphs. Body and data retain Inter; shared buttons use 14px and actions/fields use 16px. Line heights vary by component. Use balanced headings and letter spacing no tighter than -0.03em. Keep dense labels readable rather than making every line display type.

### Outlines and elevation

Controls and tags: 2px solid black. Feature panels: 3px solid black. Small/control/card/feature radii: 4/6/10/14px. Portrait images may remain round. Tables and internal rows stay flat.

All shadows are opaque #111 rectangles with zero blur and zero spread: subtle 2px 2px, action 4px 4px, card 6px 6px, overlay 8px 8px. Mobile cards/overlays reduce to 4px/5px. Never reintroduce inner highlights, inset shading, blurred elevation, colored glows or frosted glass. Image readability overlays can use one flat translucent black layer; carousel edge masks are functional fades, not surface materials.

Shared raised buttons shift by the same offset as their shadow when pressed; their shadow collapses to zero. Header buttons and the sports-overlay CTA use a 2px press, while shared raised actions use 4px. Use CSS translate independently of transforms so existing GSAP, card flips and centering transforms remain intact. Disabled buttons have no lift and no translation. Reduced motion removes press translation and nonessential animation. Keep visible focus rings and input errors.

### Surface application

Home: full-viewport white hero, dark-blue primary CTA, white secondary CTA and black/dark-blue display heading. Shared header and footer stay white with ink rules. The active route uses a baby-blue sticker. Header, footer and pages use the shared page tokens above. At widths up to 380px, the header hides the logo wordmark and uses an 8px container gap to preserve space for the 44px controls.

About: stat and founder cards use baby blue, tan or white. Comparison cards have baby-blue fronts, dark-blue backs, flip transforms and hard token shadows. The completion card has a 3px dashed black border and baby-blue fill. Preserve vertical touch scrolling and reduced motion.

Favorites: category selector sits separately at the right, with a baby-blue outlined indicator that slides between the two categories. The selector is at most 360px wide. Reduced motion removes indicator transitions and results arrival animation.

Directory, detail, profile, authentication, chat, organizer and admin pages inherit outlined controls and paper panels. Keep native and Ant Design APIs, loading states, validation and backend actions unchanged. This system targets the web app; it does not restyle the separate mobile application.

### Forms, overlays and chat

All native and Ant Design inputs, selects, number fields, popups, modals and drawers use white surfaces, black 2–3px outlines and opaque zero-blur offset shadows. Popups use only the shared accents. Modals constrain width and scroll their body on short/mobile screens. Remove blurred decorative blobs and text halos, including on empty states and authentication backgrounds.

Chat uses a white canvas and white panels, dark-blue outgoing bubbles and baby-blue incoming bubbles. Below 768px, show either the contacts pane or the conversation pane, with a labeled back control. Preserve unread state when the conversation is hidden and scroll only the message stream, not the page. Composer controls have 44px+ targets and 16px input text.

`npm run test:styles --prefix apps/web` checks all web route/component source for non-palette color utilities, the exact white/three-accent tokens and legacy clay blur/inset shadows.

### Authentication dialogs
Login and registration open over the current page, with the same form available from direct /login and /register links. Desktop pairs a baby-blue sports panel with a white form; mobile reduces the panel to the brand row. Required marks and inline form errors use #B42318, an explicit user-requested semantic exception to the three-accent palette. Password criteria update while typing; new registrations require 8+ characters, a letter, uppercase, number and special character. Existing account passwords remain valid for login. Organizer registration requires an uploaded image certificate and at least one supported sport; these are saved with the account.
