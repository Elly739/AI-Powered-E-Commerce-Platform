# Aster & Co. Design System

## Product Direction

Aster & Co. is a considered commerce experience: warm, editorial, useful, and easy to scan. The interface should feel personal without becoming precious. Product information and actions stay clear even when the visual language is expressive.

## Visual Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `ink` | `#17241f` | Primary text, navigation, strong controls |
| `paper` | `#f4f0e8` | Global canvas |
| `surface` | `#fffdf8` | Forms, summaries, framed content |
| `clay` | `#d56743` | Accent, primary action, status emphasis |
| `clay-dark` | `#b95031` | Accent hover |
| `sage` | `#d7ddd0` | Secondary visual field, quiet highlights |
| `muted` | `#59655e` | Supporting text |
| `line` | `rgba(23, 36, 31, .18)` | Dividers and field borders |
| `success` | `#71866e` | Available/in-stock state |
| `danger` | `#b95031` | Validation and destructive feedback |

Use color to establish hierarchy, not decoration. Clay is reserved for actions, selected states, and meaningful emphasis.

### Typography

- Display: `Georgia`, `Times New Roman`, serif
- Interface: `Arial`, sans-serif
- Display headings: regular weight, tight line height, no negative letter spacing beyond the existing editorial treatment
- Interface labels: 10-13px, uppercase only for short metadata labels
- Body copy: 13-16px, line height 1.5-1.6

### Shape and Depth

- Primary action radius: pill
- Content framing: square or subtle radius, never nested cards
- Dividers: 1px using `line`
- Shadows: reserved for elevated forms and key visual compositions; avoid shadow on every card
- Stable media: use `aspect-ratio` for product visuals and thumbnails

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
- Wishlist uses a persistent selected state, not a transient click-only response.
- Cart count is visible in the global header on every viewport.
- Search, filter, and sort controls preserve the current result context.
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
