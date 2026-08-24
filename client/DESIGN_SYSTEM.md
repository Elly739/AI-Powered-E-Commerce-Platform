# Aster & Co. Design System

## Product Direction

Aster & Co. is a considered commerce experience with a real transactional loop: discovery, account, wishlist, cart, checkout, orders, admin catalog, and AI guidance should feel connected. The UI should be editorial and tactile, but still built for shopping decisions: product identity, price, stock, save state, cart actions, and next steps stay visible without depending on hover.

The app should not read as a generic SaaS template or a basic Tailwind storefront. Use restrained commerce density, real editorial imagery, strong typography, compact metadata, and familiar icon-led controls to make the experience feel intentional.

## Visual Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `ink` | `#141917` | Primary text, navigation, strong controls |
| `paper` | `#f6f3ec` | Global canvas |
| `surface` | `#fffdf8` | Forms, summaries, framed content |
| `accent` | `#c65332` | Primary action, selected state, meaningful emphasis |
| `accent-dark` | `#9d3d25` | Accent hover and pressed state |
| `moss` | `#617464` | Profile, account, and quiet identity surfaces |
| `plum` | `#5b3f4d` | Rich secondary highlight for saved/account surfaces |
| `gold` | `#b88735` | Ratings and review sentiment |
| `muted` | `#667068` | Supporting text |
| `line` | `rgba(20, 25, 23, .16)` | Dividers and field borders |
| `success` | `#4f704d` | Available/in-stock state |
| `danger` | `#a83f2d` | Validation and destructive feedback |

Use color to establish hierarchy, not decoration. Accent is reserved for primary actions, selected states, and meaningful emphasis. Avoid one-note beige, blue, purple, or clay-only screens by balancing warm paper with ink, moss, plum, gold, and real imagery.

### Typography

- Display: `Georgia`, `Times New Roman`, serif
- Interface: `Inter`, `Arial`, sans-serif
- Display headings: regular weight, tight line height, no negative letter spacing beyond the existing editorial treatment
- Interface labels: 10-13px, uppercase only for short metadata labels
- Body copy: 13-16px, line height 1.5-1.6

### Shape and Depth

- Primary action radius: pill
- Content framing: 8px radius or less, never nested cards
- Dividers: 1px using `line`
- Shadows: reserved for elevated forms, summaries, and key visual compositions; avoid shadow on every card
- Stable media: use `aspect-ratio` for product visuals and thumbnails
- Product and hero surfaces must use real/editorial bitmap imagery or product media, not abstract placeholder art

### Spacing

Use a 4px base scale: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96`.

Page gutters:

- Desktop: 24px minimum, max content width 1180px
- Mobile: 16px minimum
- Section rhythm: 64-96px desktop, 40-60px mobile

## Component Contracts

Build shared UI in `client/src/components/ui/` before adding more page-specific patterns:

- `Button`: `variant`, `disabled`, `loading`, `leadingIcon`, `trailingIcon`
- `Input`: `label`, `hint`, `error`, `type`, `required`
- `ProductCard`: product identity, price, availability, rating, wishlist action, primary link
- `ProductGrid`: loading, empty, error, responsive columns
- `Badge`: availability, order status, category metadata
- `Skeleton`: fixed dimensions to prevent layout shift
- `EmptyState`: short context plus one clear next action
- `Toast`: success, error, and neutral feedback with dismiss action
- `Modal` / `Drawer`: focus containment, Escape close, labelled title, mobile-friendly layout

Components own states and accessibility. Pages compose them and should not recreate their visual rules inline.

## Interaction Rules

- Every async action has idle, loading, success, and failure feedback.
- Disabled actions explain their state through nearby text or a status label.
- Product cards make name, price, availability, and primary destination visible without hover.
- Product cards include stock, rating, save affordance, and visible price metadata.
- Wishlist uses a persistent selected state, not a transient click-only response.
- Cart count is visible in the global header on every viewport.
- Search, filter, and sort controls preserve the current result context.
- Use familiar icons for search, menu, cart, wishlist, quantity, delete, dashboard, and forward actions.
- Never use color alone to communicate availability or validation.
- Focus rings must remain visible for keyboard users.

## Responsive Layout

- Desktop: two-column editorial compositions and three-column product grids.
- Tablet: preserve hierarchy while reducing gaps; avoid collapsing controls into unlabeled icons.
- Mobile: one-column product flow, full-width primary actions, search below page heading, cart rows reorganized into readable blocks.
- All interactive targets are at least 44px high on touch layouts.

## Screen Sequence

1. Global navigation and search
2. Product discovery with filters, sorting, availability, ratings, and wishlist state
3. Product detail with media, purchase controls, reviews, related products, and contextual recommendations
4. Cart with totals always visible
5. Checkout steps: shipping, review, payment, confirmation
6. Customer dashboard: overview, orders, wishlist, profile, addresses, settings
7. Admin studio with catalog and inventory controls
8. AI assistant embedded in shopping context, with linked products and evidence-based explanations

## Definition Of Done

### Visual

- Shared tokens and components are used across screens
- Desktop, tablet, and mobile layouts are intentional
- Typography, spacing, color, and action states are consistent
- Loading skeletons reserve final layout space
- Empty, error, disabled, and success states are designed

### UX

- The current location and next action are obvious
- Cart and wishlist state remain visible and understandable
- Checkout never hides subtotal or total
- Dashboard sections are discoverable without competing with shopping
- Async feedback confirms what changed

### Accessibility

- Semantic headings and landmarks
- Labels for all form controls
- Keyboard navigation and visible focus
- Sufficient contrast for text and controls
- Meaningful image alternative text
- No interaction depends on hover alone

## Implementation Order

1. Tokens and shared primitives
2. Global navigation and responsive shell
3. Product card/grid states
4. Product details and purchase actions
5. Cart and checkout states
6. Dashboard information architecture
7. Admin and AI surfaces

The design system is the decision record for the UI/UX phase. New patterns should be added here before they are repeated in a page.
