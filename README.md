# Carrow — Digital Marketing Agency Website

A modern React + TypeScript website for a digital marketing agency featuring public pages, authenticated client accounts, a checkout flow, and a full admin dashboard backed by Convex.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** with custom design system
- **Zustand** for state management
- **Convex** for database, auth, file storage, and backend functions
- **Framer Motion** for animations
- **Recharts** for analytics charts
- **React Router 7** for navigation
- **Lucide React** for icons

## Features

### Public Pages
- **Home** — Hero, marquee, expertise, process, portfolio, plans, FAQ
- **Our Work** — Filterable portfolio with project categories
- **Services** — Detailed service offerings
- **About** — Team, values, stats
- **Plan Details** — Individual plan pages with reviews and FAQ
- **Checkout** — Business details form + WhatsApp integration

### Client Accounts
- Sign up / Sign in with email + password
- Profile & plan management
- Performance analytics dashboard
- Media & files storage
- Help & support with WhatsApp contact

### Admin Panel
- Dashboard with key metrics
- User management with plan activation
- Order management with status tracking
- Plans editor (CRUD)
- Portfolio editor (CRUD)
- Site settings editor
- Analytics view

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
npm run preview
```

### Type Checking

```bash
npm run lint
```

## Authentication

- Authentication is powered by Convex Auth with password provider.
- Admin privileges are role-based and enforced server-side.
- Admin routes in the UI are additionally guarded by authenticated user role.

## Project Structure

```
src/
  components/
    common/       — FadeIn, ErrorBoundary
    home/         — Hero, Marquee, Expertise, Process, PlansPreview, FAQ
    layout/       — Layout, Footer
    modals/       — AuthModal
    ui/           — Button, Card, Globe, AnimatedTextCycle, ExpandCards
  contexts/       — AppContext (auth modal state + cart)
  hooks/          — useLocalStorage
  lib/            — store (Zustand), utils
  pages/          — Home, PlanDetail, OurWork, Services, About,
                    Account, Checkout, PrivacyPolicy, Terms,
                    Admin, and admin sub-pages
```

## Environment Variables

Create a `.env.local` file for sensitive configuration:

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CONVEX_SITE_URL=https://your-project.convex.site
ADMIN_EMAIL=admin@carrow.com
SENTRY_AUTH_TOKEN=<build-token>
```

Never commit secret values to git.

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `brand-white` | `#FFFFFF` | Primary background |
| `brand-off-white` | `#F7F7F7` | Secondary background |
| `brand-black` | `#000000` | Primary text, accents |
| `brand-dark-grey` | `#A3A3A3` | Secondary text |
| `brand-mid-grey` | `#6B6B6B` | Tertiary text |
| `brand-border` | `#E5E5E5` | Borders and dividers |

### Typography
- **Serif:** Cormorant Garamond (headings)
- **Sans:** DM Sans (body text)

## Known Limitations

- Checkout still finalizes onboarding over WhatsApp (no integrated payment gateway yet)
- WhatsApp links require valid business number in settings
- No real payment processing — checkout redirects to WhatsApp


## Future Improvements

- [ ] Payment integration (Stripe)
- [ ] Email verification for sign-up
- [ ] Email notifications for order status changes
- [ ] File upload with cloud storage (S3/Cloudinary)
- [ ] Real-time admin notifications
- [ ] A/B testing for conversion optimization
- [ ] CMS integration for content management
