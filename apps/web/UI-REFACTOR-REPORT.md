# CourtMate Soft Claymorphism refactor

## Scope and audit (2026-10-21)

Existing Next.js 14.2.35 App Router / React 18 / Tailwind 3 / Ant Design 5 frontend. No UI framework added. The installed Next.js package has no `dist/docs` directory; this change uses existing layout and styling conventions rather than introducing new framework APIs.

The repository has 19 page route patterns. Existing roles are Guest, Player, Organizer, Regional Admin and Super Admin. Traveler, Agency, Tour Guide, Moderator, cart and a dedicated OTP route are not implemented and were not added.

Before: Tailwind primary `#0077FF` conflicted with Ant Design/most pages `#1E5AA8`; pages repeated literal colors, arbitrary shadows and large radii; About had hard offset black shadows; coaches had a separate palette; custom dialogs lacked shared focus/scroll handling; motion preferences did not cover GSAP and the 3D story.

## Implementation phases

1. Audit: inventoried all routes, layouts, shared components, CSS modules, utility configuration, authentication pages and role dashboards.
2. Foundation: `src/styles/tokens.css` defines semantic colors, four radius levels, layered elevations, motion and spacing unit. Tailwind maps existing classes and semantic names to these variables. Inter and shared PageContainer/FormContainer/page-section rules remain.
3. Shared components: Ant Design provider covers Button, Input, Select, Card, Modal, Dropdown, Popover, Table, Tabs, Pagination, Alert and notifications. Existing Checkbox/Tag/Tooltip/Drawer inherit global tokens. Native controls use `cm-button`/`cm-control`; FavoriteButton retains its circular material. Toasts, navigation, footer, authentication, tournament cards/filters/detail modal, feedback, guest prompts, favorites, avatars, loading/skeleton and notification surfaces were migrated.
4. Page migration: every existing route inherits the shared foundation; 18 page files have explicit token/class migrations, and `/coaches` uses its migrated CSS module. No business handler, API contract, authentication/authorization policy or backend was intentionally changed. Existing demo data was preserved; no new records were created to fill the UI.
5. Validation: production compilation, typecheck, route/viewport smoke checks, screenshots and interaction checks. Detailed results below distinguish coverage from full business-flow acceptance.

## Route coverage

| Route | Migration | Browser scenario |
| --- | --- | --- |
| `/` | Hero, existing content, CTA materials; reduced-motion static story | Guest; header top/scroll; static story |
| `/about` | Shared surfaces, soft shadows instead of hard offsets | Guest content |
| `/login` | AuthCard, controls, Google width, accessible names | Guest form, password reveal/focus |
| `/register` | Shared auth tokens and controls | Guest registration form |
| `/tournaments` | Search, filters, pagination, card/list surfaces | Guest list/loading/error as backend responds |
| `/tournaments/[id]` | Detail panels, actions, related components | Missing-ID fallback; real successful detail remains unverified |
| `/tournaments/[id]/register` | Registration form/panels/controls | Guest/missing-ID entry; actual registration unverified |
| `/tournaments/create` | Form sections and controls | Existing entry/guard state; submission unverified |
| `/matches` | Search/filter/list/card surfaces | Guest list/loading state |
| `/matches/[id]` | Match panels, buttons and dialog | Missing-ID fallback; real successful detail remains unverified |
| `/coaches` | CSS module uses shared palette/radii/shadows | Existing demo list, search, empty, filters, guest favorite prompt |
| `/coaches/[id]` | Profile, courses and booking surfaces | Existing `coach-1`; actual booking unverified |
| `/coaches/register` | Form panels and native/Ant controls | Existing form/guest state; submission unverified |
| `/profile` | Panels, tabs, favorites and fields | Guest entry/guard state; authenticated content unverified |
| `/chat` | Existing split layout, thread and empty surfaces | Guest entry/guard state; messaging unverified |
| `/ticket/[id]` | Ticket surface and actions | Missing-ID/guest state; issued ticket unverified |
| `/payment/return` | Payment result surface and status controls | Missing payment params; successful payment unverified |
| `/organizer` | Summary panels, tabs, flat tables, controls | Available shell/loading/guest state; privileged actions unverified |
| `/admin` | Summary panels, tabs, flat tables, controls | Available shell/loading/guest state; privileged actions unverified |

Shared `loading.tsx` and error boundary inherit updated loading components and foundation. No existing route is excluded from the material migration. Business states listed as unverified still require a valid existing account and records.

## Maintenance and reproduction

Read `DESIGN.md` for the shared contract. Do not create per-page material palettes. Ant Design literal seed colors mirror CSS tokens because its palette generator requires color values; elevation references the CSS variables directly.

`next.config.js` accepts optional `COURTMATE_BUILD_DIR` so a production check does not overwrite an active development server's `.next` output. Default behavior is unchanged. For the QA build, PowerShell:

```powershell
$env:COURTMATE_BUILD_DIR='.tmp/clay-build'
npm run build --prefix apps/web
```

Run the production server from `apps/web` with the same variable and `npx next start -p 3011`. Playwright CLI scripts `scripts/check-clay-browser.js` and `scripts/check-clay-interactions.js` expect that origin. They do not submit payments, create accounts or mutate backend records. Screenshots and CLI output are local in `.playwright-cli/`.

## Validation results

- Final isolated production build: PASS, including compilation, type validation and generation of every page pattern.
- Route sweep: 19 route patterns × 1440/768/390px = 57 successful document responses (HTTP 200), no uncaught page exceptions, and the shared `20px` card token present on every route. This checks the guest/rendered entry states, not successful authenticated flows.
- One overflow was found in the coach registration certificate row at 390px. Fixed by stacking its fields on mobile and allowing the desktop flex input to shrink. Focused confirmation PASS on the rebuilt output: viewport width 390px, document scrollWidth 390px, form opacity 1 with reduced-motion.
- Interaction checks PASS: coach search empty state; filter drawer opening/Escape; guest favorite login dialog and Escape from a focused control; mobile navigation expansion; password reveal/hide; visible input focus outline; reduced-motion story content with zero canvas elements; header transparent at top and white after scroll.
- Feedback modal PASS: opens with its existing content and closes using Escape from its focused close control, without sending feedback.
- Screenshots inspected: coaches desktop/mobile, auth mobile (including Google button fit), dashboard shell and home. Automated screenshots exist for every route/viewport. This is not a claim of manual visual review of every screenshot or authenticated data state.
- Limitations: Google OAuth rejects the test origin on port 3011; missing tournament IDs can produce a backend 500. These are external/configuration responses, not proof of a UI regression. Authenticated authorization, account creation/login success, OTP, booking, actual payment, moderation and message delivery are not certified by guest route rendering.
- A parallel edit replaced the navigation structure during this session. Its search and transparent/scrolled behavior were preserved and aligned to shared colors, shadow and page frame; it was not reverted to the earlier organic navigation block.

This report does not claim full acceptance of unverified authenticated business flows.

## Follow-up: molded clay and comparison deck

The About comparison section now has explanatory copy on the left and one overlapping deck on the right at desktop widths. On tablet/mobile the deck follows the copy. Each of the three original comparisons retains its text, with click/Enter/Space to flip, horizontal pointer drag or forward arrow to advance, a back arrow after advancing, retained flip state on return, an end state and restart. Left/right arrow keys also navigate; `touch-action: pan-y` preserves vertical touch scrolling. Hidden cards are excluded from the tab order/accessibility tree.

Shared material tokens now use 28px card / 36px feature radii and the requested three-shadow construction: bright inner highlight, darker inner bottom shading and soft outer drop shadow. Existing brand/semantic colors are unchanged. Ant Design large radii are synchronized.

Validated on 1440/768/390px: desktop column order, mobile stack, no resting horizontal overflow, click flip, forward/back, restored face, keyboard arrows, actual mouse drag, completion/restart and reduced-motion. No uncaught exceptions in this check. Physical mobile touch input has not been tested. Reproduction: `scripts/check-comparison-deck.js` against the preview at port 3013; screenshots `.playwright-cli/comparison-deck-*.png`.

## Follow-up: CTA alignment and simpler task entry

- Fixed the 3D story CTA alignment by separating the CSS centering anchor from the `.story-cta` element animated by GSAP. Previously GSAP's `y: 0` replaced the same element's centering translation. Desktop confirmation after scrolling: card center 450px in a 900px viewport, matching the anchor center. On narrow viewports the character is centered above the compact CTA, rather than placed offscreen at the desktop X coordinate.
- Home now names the two main tasks and provides direct `Tìm bạn chơi` (`/matches`) and `Xem giải đấu` (`/tournaments`) links on the first screen. Removed the location badge, long generic introduction, floating decorative icons and nonfunctional scroll hint.
- Tournament list goes directly from `Giải đấu` to search and filters. Removed the requested promotional paragraph. Match-list copy uses plain terms and keeps a short explanation of the useful filters.
- Removed the repeated auth tagline, coach-registration eyebrow, duplicate About team eyebrow, CTA slogan and unsupported decorative `100+` review/stock-avatar header. Existing content and data selection inputs such as time, price, location and skill level remain.
- Feedback is a static, readable grid of three existing reviews with `Xem thêm đánh giá` to show three more, and a visible `Viết đánh giá` action. Removed duplicated moving rows, hover-speed animation and pointer styling on noninteractive review cards. All fetched reviews remain accessible progressively; submission/API behavior is unchanged.
- Header retains transparent-at-top / white-after-scroll behavior, with brand-colored controls readable on the light hero. Removed the dark scrim, decorative feedback ping and footer marketing claim.
- Production build and typecheck pass. A sub-five-second understanding target informs these choices; it has not been established by a timed study across age groups.
- Browser confirmation at 1440/768/390px: both home actions remain on the first 900px screen and have 52px target heights; no home horizontal overflow; review disclosure changes 3 cards to 6; the write-review modal opens and closes by keyboard; tournament search starts at 196/188/180px respectively. No uncaught page exceptions in this check. Reproduction: `scripts/check-clear-ui.js` on port 3013.
- Normal-motion mobile story confirmation: on 390×900, the centered mascot is fully visible above the CTA; card bounds are x=19.5–370.5, y=554.4–705.6. The CTA is visibility-hidden until its animation entrance, so its hidden button cannot receive keyboard focus. Screenshots: `.playwright-cli/cta-alignment-desktop.png` and `.playwright-cli/cta-alignment-mobile.png`.

## User correction: preserve review carousel and full hero

This correction supersedes the earlier static-feedback and compact-hero choices. Restored the original two animated feedback tracks and full review header/content. Restored the review-card widths for that layout. The hero now fills at least `100svh`, with larger responsive display type and its main actions; the explicitly unwanted location badge stays removed.

Restored the original full descriptions/titles of the 3D story cards. Headings now render one joined text node with real spaces, and whole heading/paragraph animation replaces SplitText DOM mutation. Feature cards also use separate layout anchors to preserve centering and stay within narrow viewports. No additional content cuts were made after this correction.

The broader remaining-page pass made before this correction shortened repeated form/dashboard copy, removed duplicate create links, a hard-coded online statistic, an export button that only displayed an alert, a nonfunctional password-reset link, repeated profile advice and unsupported generic payment/refund assurances. Price/deposit/eligibility details and real submit handlers remain. Shared native/Ant controls now have 44px secondary targets and 48px form/primary targets; inputs use 16px text. That wider pass is not yet fully accepted across authenticated business states.

Correction confirmation on a clean production session: 1920×900, 1440×900 and 390×844 hero heights equal the viewport heights; both original review tracks render (100 duplicated cards for their continuous loop); no horizontal overflow. All three story headings contain normal word spaces and zero generated word/character elements. No uncaught page exceptions in this production check. Build and typecheck pass.
