# CryptoVault Pro - Complete Documentation

---

## 🔑 Demo Access
To explore the platform immediately, use the following demo credentials:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `[EMAIL_ADDRESS]` | `admin123` |
| **Test User** | `user@example.com` | `password123` |
**main  admain** | `[EMAIL_ADDRESS]` | `Cui@59191` |

---

## 🏗️ Project Architecture & Structure

The **CryptoVault Pro** ecosystem is built on a robust, scalable micro-architecture using modern full-stack technologies.

### 🔙 Backend (`cryptovault-backend`)
Built with **Node.js**, **Express**, and **TypeScript**, the backend serves as the core intelligence of the platform.
- **`src/controllers/`**: Orchestrates request-response cycles, ensuring data is correctly handled and routed.
- **`src/services/`**: The business logic layer. It handles complex operations, database interactions via **Prisma ORM**, and integrations with third-party APIs.
- **`src/routes/`**: Defines a clean RESTful API surface for the frontend to consume.
- **`src/middleware/`**: Implements critical security layers including **JWT Authentication**, role-based access control (RBAC), and request validation.
- **`src/websocket/`**: Manages real-time data flow for live market tickers and instant transaction notifications.
- **`prisma/`**: Contains the database schema (`schema.prisma`) and seeding scripts for quick deployment.

### 🎨 Frontend (`cryptovault-frontend`)
A high-performance Single Page Application (SPA) built with **Angular 19**.
- **`src/app/core/`**: Houses singleton services, authentication guards, and HTTP interceptors that manage the application's global state.
- **`src/app/features/`**: Modular architecture where each major functionality (Market, Wallet, Dashboard, Admin) is isolated for better maintainability.
- **`src/app/shared/`**: Contains reusable UI components, pipes, and directives used across the entire application.
- **`src/styles/`**: Implements a premium design system using **SCSS** with CSS variables for dynamic theming (Dark/Light modes).

---

## 🚀 Core Functionalities

### 1. 🔐 Secure Authentication System
- **Advanced Auth**: JWT-based authentication with secure refresh token rotation.
- **Multi-Factor security**: Integrated 2FA setup via authenticator apps.
- **RBAC**: Strict role-based access ensuring users only see what they are authorized to.

### 2. 💰 Multi-Chain Crypto Wallet
- **Asset Management**: Securely store and manage BTC, ETH, SOL, and various ERC-20 tokens.
- **Transactions**: Seamlessly Send, Receive, and Swap assets with real-time fee calculation.
- **History**: Comprehensive transaction ledger with explorer links and status tracking.

### 3. 📊 Real-time Market Analytics
- **Live Data**: Integration with high-fidelity market APIs for real-time price updates.
- **Interactive Charts**: Professional-grade trading charts with multiple timeframes and technical indicators.
- **Global Stats**: Market-wide insights including dominance, volume, and Fear & Greed index.

### 4. 📈 Intelligent Portfolio Tracking
- **Visual Analytics**: Dynamic allocation charts (Donut/Pie) and performance line graphs.
- **P&L Reporting**: Automatic calculation of daily and total profits/losses.
- **ROI Tracking**: Detailed metrics on investment performance across all assets.

### 5. 🛠️ Comprehensive Admin Control
- **User Management**: Tools to monitor user activity, manage KYC levels, and handle account statuses.
- **System Monitoring**: Real-time health checks for APIs, database, and blockchain nodes.
- **Transaction Oversight**: Ability to review, flag, and manage system-wide transactions.

---

# 🎨 CryptoVault Pro – Complete Design System

> **Production-Ready Design Specifications** for all 35 pages of the CryptoVault Pro crypto wallet platform.

---

## ðŸŒˆ Global Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0A0E17` | Main background (Deep Dark Blue) |
| `--bg-secondary` | `#111827` | Card backgrounds |
| `--bg-surface` | `#1F2937` | Elevated surfaces, inputs |
| `--accent-primary` | `#3B82F6` | Primary buttons, links, highlights (Electric Blue) |
| `--accent-secondary` | `#10B981` | Success states, profits (Neon Green) |
| `--danger` | `#EF4444` | Errors, warnings, sell actions (Red) |
| `--warning` | `#F59E0B` | Caution states (Amber) |
| `--success` | `#22C55E` | Success confirmations (Green) |
| `--text-primary` | `#FFFFFF` | Main headings, important text |
| `--text-secondary` | `#9CA3AF` | Descriptions, labels |
| `--border` | `#374151` | Dividers, borders |

### Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 | Inter | 700 | 32px | 40px |
| H2 | Inter | 700 | 24px | 32px |
| H3 | Inter | 600 | 20px | 28px |
| Body | Inter | 400 | 14-16px | 24px |
| Small | Inter | 400 | 12px | 18px |
| Monospace | JetBrains Mono | 400 | 14px | 20px |

### Components

#### Cards
- **Style**: Glassmorphism
- **Backdrop**: `blur(10px)`
- **Background**: `rgba(17, 24, 39, 0.8)`
- **Border**: 1px solid `#374151`
- **Border Radius**: 20px
- **Shadow**: `0 8px 32px rgba(0, 0, 0, 0.3)`

#### Buttons
- **Primary**: Gradient from `#3B82F6` to `#2563EB`, rounded-full, hover scale 1.02
- **Secondary**: Border only, `#374151` border, rounded-full
- **Danger**: `#EF4444` background, rounded-full
- **Ghost**: Transparent, text only with hover background

#### Inputs
- **Background**: `#1F2937`
- **Border**: 1px solid `#374151`
- **Border Radius**: 12px (rounded-lg)
- **Focus**: Blue glow (`box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3)`)
- **Placeholder**: `#6B7280`

#### Sidebar (User)
- **Position**: Fixed left
- **Width**: 260px
- **Background**: Glass effect with `blur(20px)`
- **Border Right**: 1px solid `#374151`

#### Navbar
- **Position**: Top fixed
- **Height**: 70px
- **Background**: Glass effect with `blur(10px)`
- **Z-Index**: 50

---

## ðŸ“„ All 35 Pages Design Specifications

---

### ðŸŒ PUBLIC (1 page)

#### 1. Home Page (`/`)

**Sections:**
1. **Hero Section**
   - Full-width gradient background
   - Main headline: "Secure Crypto Management Made Simple"
   - Subheadline with trust badges
   - CTA buttons: "Get Started" (primary), "Learn More" (secondary)
   - Live market ticker banner

2. **Features Grid** (4 columns desktop, 2 tablet, 1 mobile)
   - Secure Wallet Storage
   - Instant Transactions
   - Portfolio Analytics
   - Multi-Chain Support
   - Each with icon, title, description

3. **Market Preview**
   - Mini table showing top 5 cryptocurrencies
   - Live price updates animation
   - 24h change indicators (green/red)

4. **Security Section**
   - Security badges/certifications
   - "Bank-Level Security" messaging
   - 2FA, encryption, cold storage icons

5. **Footer**
   - 4-column layout: Product, Company, Resources, Legal
   - Social media links
   - Copyright & disclaimer

---

### ðŸ” AUTHENTICATION (5 pages)

#### 2. Login (`/auth/login`)

**Layout**: Centered card, max-width 420px

**Elements:**
- Logo at top
- "Welcome Back" heading
- Email input with icon
- Password input with toggle visibility
- "Remember me" checkbox
- "Forgot password?" link
- Primary "Sign In" button
- Divider with "or continue with"
- Social login buttons (Google, Apple)
- "Don't have an account? Register" link

**States:**
- Loading spinner on submit
- Error message for invalid credentials
- Success redirect animation

#### 3. Register (`/auth/register`)

**Layout**: Centered card, max-width 480px

**Elements:**
- "Create Account" heading
- Full name input
- Email input
- Password input with strength meter
- Confirm password input
- Password requirements checklist
- Terms & conditions checkbox
- "Create Account" button
- Social signup options
- "Already have an account? Login" link

**Password Strength Meter:**
- Weak (red): < 8 chars
- Fair (yellow): 8+ chars
- Good (blue): 8+ chars + number
- Strong (green): 8+ chars + number + symbol

#### 4. Forgot Password (`/auth/forgot-password`)

**Elements:**
- "Reset Password" heading
- Email input
- "Send Reset Link" button
- Back to login link
- Success state: "Check your email" message

#### 5. Reset Password (`/auth/reset-password`)

**Elements:**
- "Set New Password" heading
- New password input
- Confirm password input
- Requirements list (8+ chars, 1 number, 1 symbol)
- "Reset Password" button
- Success state with redirect countdown

#### 6. Email Verification (`/auth/verify-email`)

**States:**
1. **Waiting State**
   - Email icon with pulsing animation
   - "Verify Your Email" heading
   - Sent to email display
   - "Resend Email" button (with cooldown timer)
   - "Change Email" link

2. **Success State**
   - Checkmark animation
   - "Email Verified!" heading
   - "Continue to Dashboard" button

---

### ðŸ‘¤ USER DASHBOARD (19 pages)

#### 7. Dashboard (`/user/dashboard`)

**Layout**: Sidebar + Main Content (3-column grid)

**Sections:**
1. **Stats Cards Row** (4 cards)
   - Total Balance (with eye toggle)
   - Today's P&L (with percentage)
   - Active Wallets count
   - Pending Transactions

2. **Portfolio Chart** (2/3 width)
   - Line chart showing 30-day performance
   - Time range selector (1D, 1W, 1M, 1Y)
   - Hover tooltip with values

3. **Quick Actions** (1/3 width)
   - Send, Receive, Buy, Swap buttons
   - Icon + label style

4. **Asset Table**
   - Coin icon, Name, Balance, Price, 24h Change, Value
   - Sortable columns
   - "View All" link

5. **Recent Transactions**
   - Last 5 transactions
   - Type icon, Asset, Amount, Status, Time

#### 8. Wallet (`/user/wallet`)

**Sections:**
1. **Main Wallet Card**
   - Large balance display
   - Wallet address with copy button
   - QR code display
   - Action buttons: Send, Receive, Buy

2. **Multi-Wallet Grid**
   - Cards for each wallet (BTC, ETH, SOL, USDT)
   - Balance + USD value
   - Make default toggle
   - Settings (â‹®) menu

3. **Private Key Section** (collapsed by default)
   - Warning banner
   - Reveal button with password confirmation
   - Copy + Download options

#### 9. Send Crypto (`/user/send`)

**3-Step Wizard:**

**Step 1: Recipient**
- Address input with QR scanner icon
- Address book dropdown
- Network selector (auto-detect)
- Validation indicator

**Step 2: Amount**
- Amount input with max button
- USD equivalent display
- Fee selector (Slow/Normal/Fast)
- Total calculation
- Insufficient balance warning

**Step 3: Confirm**
- Review card with all details
- From/To addresses (truncated)
- Amount, Fee, Total
- "Confirm & Send" button
- 2FA input (if enabled)

**Success Modal:**
- Animation: Paper plane flying
- "Transaction Sent!"
- Transaction hash with explorer link
- "View in History" button

#### 10. Receive Crypto (`/user/wceive`)

**Elements:**
- Large QR code display
- Wallet address with copy
- "Copy Address" button
- Share options (social/email)
- "Request Specific Amount" expandable section
- Warning box: "Only send [COIN] to this address"
- Recent receive history (last 5)

#### 11. Transactions (`/user/transactions`)

**Elements:**
- **Filters Bar**
  - Type dropdown (All, Send, Receive, Swap, Buy, Sell)
  - Coin selector
  - Status selector
  - Date range picker
  - Search input

- **Table**
  - Columns: Type, Asset, Amount, From/To, Status, Date, Actions
  - Status badges: Pending (yellow), Completed (green), Failed (red)
  - Hover: Highlight row
  - Click: Open detail modal

- **Detail Modal**
  - Transaction hash with explorer link
  - Full addresses
  - Fee breakdown
  - Block confirmations (if applicable)
  - Status timeline

- **Pagination**: 10/25/50 per page options

#### 12. Market (`/user/market`)

**Layout**: Main table + Sidebar

**Elements:**
- **Stats Banner**
  - Global market cap
  - 24h volume
  - BTC dominance
  - Fear & Greed index

- **Search Bar** with filters

- **Coins Table**
  - Rank, Coin (icon + name + symbol), Price, 24h %, 7d %, Market Cap, Volume, Sparkline
  - Favorite star toggle
  - Click: Navigate to coin detail

- **Trending Sidebar**
  - Top gainers (24h)
  - Trending searches
  - Recently added

- **Coin Detail View** (modal or expand)
  - Large price display
  - Price change badges
  - Chart (selectable timeframes)
  - Stats: Market cap, Volume, Supply, ATH
  - Buy/Sell buttons

#### 13. Portfolio (`/user/portfolio`)

**Sections:**
1. **Summary Header**
   - Total portfolio value (large)
   - 24h change (amount + %)
   - All-time high / low
   - ROI percentage

2. **Allocation Chart** (Pie/Donut)
   - Color-coded by asset
   - Hover: Show percentage + value
   - Legend below

3. **Performance Chart** (Line)
   - Portfolio value over time
   - Benchmark comparison (optional)
   - Date range selector

4. **Allocation Table**
   - Coin, Balance, Price, Value, % of Portfolio, P&L
   - Sortable

5. **Key Metrics Cards**
   - Best performer
   - Worst performer
   - Total invested
   - Realized gains

#### 14. Profile (`/user/profile`)

**Layout**: Tabs or sections

**Elements:**
- **Avatar Section**
  - Large circular avatar with upload overlay
  - Current level/status badge
  - "Change Photo" button

- **Profile Form**
  - Full name
  - Email (with verified badge)
  - Phone number
  - Country selector
  - Timezone selector
  - "Save Changes" button

- **Account Status Card**
  - KYC level indicator (0-2)
  - Verification status
  - Upgrade button

- **Danger Zone**
  - "Delete Account" button (red, requires confirmation)

#### 15. Security (`/user/security`)

**Sections:**
1. **Security Score Card**
   - Circular progress indicator (0-100)
   - "Your security is Strong/Good/Fair/Weak"
   - Checklist of enabled features

2. **Two-Factor Authentication**
   - Current status (Enabled/Disabled)
   - Toggle switch
   - "Change 2FA Method" button
   - Backup codes section

3. **Password**
   - Last changed date
   - "Change Password" button

4. **Login History Table**
   - Device, Location, IP, Time, Status
   - "Log out all other sessions" button

5. **Active Sessions**
   - Current device (highlighted)
   - Other devices with revoke button

6. **Whitelist Addresses**
   - Enabled toggle
   - Add address form
   - Saved addresses list

#### 16. Settings (`/user/settings`)

**Tabs:**

**Tab 1: General**
- Language selector
- Currency preference
- Date format
- Time format

**Tab 2: Notifications**
- Email alerts toggle
- Push notifications toggle
- SMS alerts toggle
- Per-event toggles (transactions, security, price alerts, news)

**Tab 3: Appearance**
- Theme selector (Dark/Light/System)
- Accent color picker
- Compact mode toggle

**Tab 4: API**
- API key display (masked)
- Webhook URL setting
- Rate limit info

#### 17. Notifications (`/user/notifications`)

**Elements:**
- **Header**
  - "Notifications" title
  - "Mark All as Read" button
  - Unread count badge

- **Tabs**
  - All, Unread, Transaction, Security, System

- **Notification Cards**
  - Icon (type-based)
  - Title
  - Message preview
  - Timestamp
  - Unread indicator (blue dot)
  - Delete on hover (Ã—)

- **Load More** button

- **Empty State**
  - Bell icon illustration
  - "No notifications yet"

#### 18. Buy Crypto (`/user/buy`)

**Layout**: 2-column (widget + info)

**Elements:**
- **Buy Widget**
  - "You pay" input with fiat selector
  - "You receive" with coin selector
  - Exchange rate display
  - Fee breakdown
  - Total calculation
  - Payment method selector (cards/bank)
  - "Buy Now" button

- **Order Summary Sidebar**
  - Selected coin info
  - Price chart (mini)
  - Delivery time estimate

- **Purchase History Table**
  - Date, Coin, Amount, Fiat Amount, Status, Actions

#### 19. Swap (`/user/swap`)

**Elements:**
- **Swap Widget** (centered card)
  - From: Coin selector + amount input
  - Swap direction button (â†“)
  - To: Coin selector (auto-calculated)
  - Exchange rate display
  - Price impact warning (if >2%)
  - Slippage tolerance selector
  - Route info (if multi-hop)
  - "Preview Swap" button

- **Confirmation Modal**
  - Full breakdown
  - Accept terms checkbox
  - "Confirm Swap" button

- **Recent Swaps Table**
  - Date, From, To, Rate, Status

- **Supported Routes**
  - Expandable list of available trading pairs

#### 20. Staking (`/user/staking`)

**Sections:**
1. **Summary Cards**
   - Total staked value
   - Total rewards earned
   - Current APY (weighted average)
   - Active positions count

2. **Available Pools Table**
   - Coin, APY, Lock period, Min stake, Total staked, Action
   - "Stake" button per row
   - Recommended tag on best APY

3. **Your Positions Table**
   - Pool, Staked amount, Start date, End date, Rewards earned, Status
   - "Compound" button
   - "Unstake" button (with warning if early)

4. **Staking Calculator**
   - Coin selector
   - Amount input
   - Duration selector
   - Estimated rewards calculation
   - Projection chart

#### 21. Referral (`/user/referral`)

**Sections:**
1. **Referral Link Card**
   - Large referral URL display
   - Copy button
   - QR code for mobile sharing
   - Social share buttons

2. **Stats Cards**
   - Total referrals
   - Conversion rate
   - Commission earned
   - Pending commission

3. **Referred Users Table**
   - Email (masked), Signup date, Status, Volume generated, Commission earned

4. **Commission History**
   - Date, Referral, Volume, Rate, Commission, Status

5. **Withdraw Commission**
   - Available balance display
   - Withdrawal method selector
   - Amount input
   - "Withdraw" button

#### 22. Withdraw (`/user/withdraw`)

**Tabs: Crypto / Fiat**

**Crypto Tab:**
- Coin selector
- Address input (with address book)
- Amount input (with max)
- Network selector
- Fee display
- Total deduction
- Address whitelist check

**Fiat Tab:**
- Currency selector
- Bank account selector (or add new)
- Amount input
- Fee + processing time
- Compliance notice

**History:**
- Recent withdrawals table
- Status tracking

**Address Book:**
- Saved addresses list
- Add/Edit/Delete

#### 23. API Keys (`/user/api-keys`)

**Elements:**
- **Keys Table**
  - Name, Key (masked), Permissions, IP Whitelist, Last used, Status, Actions
  - Status toggle
  - Revoke button

- **Create Key Modal**
  - Name input
  - Permissions checkboxes (Read, Trade, Withdraw, Webhook)
  - IP whitelist input
  - Expiration date
  - "Create" button

- **New Key Display** (after creation)
  - Warning: "Copy now - won't show again"
  - API Key visible
  - API Secret visible
  - Download option

- **Webhook Configuration**
  - URL input
  - Event subscriptions
  - Secret key for verification
  - Test webhook button

#### 24. 2FA Setup (`/user/2fa-setup`)

**3-Step Wizard:**

**Step 1: Method Selection**
- Options: Authenticator App, SMS, Email
- Recommendation badge on Authenticator

**Step 2: QR Code** (for Authenticator)
- Large QR code
- Manual key entry fallback
- "Can't scan?" link

**Step 3: Verify**
- 6-digit code input
- Backup codes download option
- "Verify & Enable" button

**Success Page:**
- Checkmark animation
- "2FA Enabled Successfully"
- Return to Security settings button

#### 25. Activity Log (`/user/activity`)

**Elements:**
- **Filters**
  - Action type dropdown
  - Date range
  - Device filter

- **Activity Table**
  - Time, Action, Device, IP, Location, Details
  - Expandable rows for more info
  - Suspicious activity highlight (red border)

- **Stats Cards**
  - Total activities (7d)
  - Unique devices
  - Login locations

- **Export Button**
  - CSV/PDF options

---

### ðŸ§‘â€ðŸ’¼ ADMIN PANEL (8 pages)

#### 26. Admin Dashboard (`/admin/dashboard`)

**Layout**: Admin sidebar + 4-column stats + charts

**Sections:**
1. **Stats Cards** (4-column)
   - Total Users (with growth %)
   - Total Transactions (today)
   - Total Volume (24h)
   - Active Wallets

2. **User Growth Chart**
   - Line chart: New users over time
   - Signups vs Active

3. **Volume Chart**
   - Bar chart: Transaction volume by day

4. **Activity Feed**
   - Real-time recent activities
   - User signup, large transaction, KYC submission

5. **System Status**
   - API status indicators
   - Blockchain node status
   - Database health

#### 27. Admin Login (`/admin/login`)

**Elements:**
- Separate admin portal branding
- Admin email input
- Password input
- 2FA code input (required)
- "Admin Sign In" button
- "Back to user login" link

#### 28. Manage Users (`/admin/users`)

**Elements:**
- **Advanced Filters**
  - Search (name/email)
  - Status selector (Active, Suspended, Banned)
  - KYC level filter
  - Date range (signup)
  - Country filter

- **Bulk Actions Bar**
  - Select all checkbox
  - Suspend selected
  - Export selected
  - Delete selected

- **Users Table**
  - Checkbox, ID, Avatar+Name, Email, Status, KYC, Balance, Joined, Last Login, Actions
  - Quick action buttons: View, Edit, Suspend
  - Status badges

- **Pagination**: 25/50/100 per page

#### 29. User Detail (`/admin/users/:id`)

**Layout**: Profile header + tabs

**Header:**
- Large avatar + name
- Status badge + KYC badge
- Quick actions: Edit, Suspend, Impersonate, Delete
- Summary stats: Balance, Transactions, Joined date

**Tabs:**
1. **Overview**
   - Contact info
   - Security score
   - Recent activity preview

2. **Wallets**
   - All wallets table with balances

3. **Transactions**
   - Full transaction history
   - Risk score indicators

4. **Security**
   - 2FA status
   - Login history
   - Active sessions

5. **KYC**
   - Current level
   - Submitted documents
   - Approve/Reject buttons

6. **Activity**
   - Full activity log

7. **Settings**
   - Withdrawal limits
   - Fee tier
   - Notes (admin only)

#### 30. Admin Transactions (`/admin/transactions`)

**Elements:**
- **Summary Cards**
  - Today's volume
  - Pending count
  - Flagged count
  - Failed count

- **Advanced Filters**
  - Type, Status, Coin
  - Amount range
  - User search
  - Risk score range
  - Flagged only toggle

- **Transactions Table**
  - All columns + Risk score + Flagged status
  - Color-coded risk (green/yellow/red)
  - Bulk flag action

- **Fraud Detection Panel**
  - Auto-flagged transactions
  - Pattern alerts
  - Investigation notes

#### 31. Admin Analytics (`/admin/analytics`)

**Elements:**
- **Date Selector**
  - Presets: Today, 7D, 30D, 90D, Custom
  - Compare with previous period toggle

- **Key Metrics Row**
  - Revenue, New Users, Transactions, Avg Transaction
  - Change % indicators

- **Charts Grid**
  - User registration (line)
  - Transaction volume (bar)
  - Revenue by coin (pie)
  - Geographic distribution (map)

- **Drill-down Tables**
  - Top users by volume
  - Most traded coins
  - Peak activity hours

#### 32. Admin Settings (`/admin/settings`)

**Tabs:**

**Tab 1: General**
- Platform name
- Support email
- Maintenance mode toggle

**Tab 2: Fees**
- Trading fee %
- Withdrawal fees per coin
- Minimum withdrawal amounts
- Fee tiers configuration

**Tab 3: Security**
- Minimum password strength
- Session timeout
- Max login attempts
- 2FA requirements

**Tab 4: Compliance**
- KYC requirements
- Withdrawal limits by level
- Restricted countries
- AML rules

**Tab 5: Blockchain**
- Node URLs
- Confirmation requirements
- Gas price multipliers

**Tab 6: Email**
- SMTP settings
- Template editor
- Test email button

**Tab 7: API**
- Rate limits
- CORS origins
- API versioning

**Tab 8: Backup**
- Database backup schedule
- Manual backup button
- Restore from backup

#### 33. Reports (`/admin/reports`)

**Elements:**
- **Report Types**
  - User reports
  - Transaction reports
  - Financial reports
  - Compliance reports
  - Custom reports

- **Report Builder**
  - Date range
  - Metrics selector
  - Filters
  - Group by options

- **Report Queue**
  - Scheduled/Running/Completed reports
  - Download links
  - Delete old reports

---

### ðŸ› ï¸ UTILITY (2 pages)

#### 34. Support/Help (`/support`)

**Sections:**
1. **Categories Grid**
   - Getting Started
   - Wallet & Security
   - Trading
   - Account & Verification
   - Technical Issues

2. **Popular Articles**
   - Most viewed help articles
   - Quick links

3. **FAQ Accordion**
   - Common questions with expand/collapse
   - Searchable

4. **Contact Card**
   - Email support
   - Live chat button
   - Response time estimate

5. **System Status Banner**
   - Current operational status
   - Incident history link

#### 35. Not Found (`/404`)

**Elements:**
- Large "404" text with gradient
- Illustration (lost in space/crypto theme)
- "Page Not Found" heading
- "The page you're looking for doesn't exist or has been moved."
- Two buttons: "Go to Dashboard" (if logged in), "Go Home"
- Search input (optional)

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 640px | Single column, hamburger menu, full-width cards |
| Tablet | 640-1024px | 2-column grids, condensed sidebar |
| Desktop | > 1024px | Full layout as designed |

---

## 🎯 Interactive Elements

### Modals
- Backdrop blur
- Slide-up animation on mobile
- Scale-in animation on desktop
- Close on backdrop click or X button

### Tabs
- Underline or pill style
- Smooth content transition
- Active state highlight

### Accordions
- Smooth height transition
- Rotate chevron icon
- One open at a time (optional)

### Toasts/Notifications
- Slide-in from top-right
- Auto-dismiss (5s default)
- Success/Error/Warning/Info variants
- Manual close button

### Loading States
- Skeleton screens for content
- Spinner for buttons
- Progress bars for multi-step processes
- Shimmer effect for data loading

### Hover Effects
- Cards: Subtle lift + shadow increase
- Buttons: Scale 1.02 + brightness
- Table rows: Background highlight
- Links: Color change + underline

---

## 🎨 Export Checklist

- [ ] All 35 pages designed
- [ ] Responsive layouts (mobile/tablet/desktop)
- [ ] Dark theme optimized
- [ ] All interactive states defined
- [ ] Hover effects on all buttons
- [ ] Form validation states
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] All modals functional
- [ ] All tabs switchable
- [ ] All accordions functional
- [ ] Consistent spacing system
- [ ] Typography hierarchy
- [ ] Iconography (Lucide/Feather)
- [ ] Mock data realistic (no Lorem Ipsum numbers)
- [ ] Chart placeholders with data
- [ ] Animation specifications
- [ ] Developer handoff ready

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Designer**: Stitch AI Design System


---

# ðŸ–¥ï¸ CryptoVault Pro â€“ Backend Architecture

> **Complete Backend System** using Node.js, Express, PostgreSQL, and Web3.

---

## ðŸ› ï¸ Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20.x |
| Framework | Express.js (or NestJS) |
| Database | PostgreSQL (Primary) + Redis (Caching/Sessions) |
| ORM | Prisma ORM / TypeORM |
| Authentication | JWT with Refresh Tokens + bcrypt |
| Blockchain | Web3.js (Ethereum), BitcoinJS (Bitcoin), Solana Web3 |
| API | RESTful + Swagger Documentation |
| Email | Nodemailer with SMTP |
| File Upload | Multer (KYC Documents) |
| Logging | Winston |
| Validation | Zod / Joi |
| Rate Limiting | express-rate-limit |
| Security | Helmet, CORS, express-mongo-sanitize |

---

## 📦 Project Structure

```
cryptovault-backend/
│
├── src/
│   ├── config/
│   │   ├── database.js       # Database connection
│   │   ├── redis.js          # Redis client
│   │   ├── blockchain.js     # Web3 configurations
│   │   └── email.js          # SMTP configuration
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── wallet.controller.js
│   │   ├── transaction.controller.js
│   │   ├── market.controller.js
│   │   ├── portfolio.controller.js
│   │   ├── staking.controller.js
│   │   ├── admin.controller.js
│   │   └── user.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── wallet.service.js
│   │   ├── blockchain.service.js
│   │   ├── transaction.service.js
│   │   ├── market.service.js
│   │   ├── notification.service.js
│   │   ├── redis.service.js
│   │   └── email.service.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── admin.middleware.js     # Admin role check
│   │   ├── rateLimit.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── models/  (if using Mongoose) or prisma/schema.prisma
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── wallet.routes.js
│   │   ├── transaction.routes.js
│   │   ├── market.routes.js
│   │   ├── admin.routes.js
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── encryption.js     # Private key encryption
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── logger.js
│   │
│   ├── websocket/
│   │   └── socket.handler.js
│   │
│   └── app.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── uploads/
│   └── kyc/
│
├── .env
├── .env.example
├── package.json
└── server.js
```

---

## ðŸ” Security Implementation

### Authentication Flow

```javascript
// JWT Configuration
const jwtConfig = {
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: '15m',      // Short-lived
  refreshTokenExpiry: '7d',      // Long-lived
  refreshTokenMaxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
};

// Password Hashing
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Token Rotation on Refresh
async function rotateRefreshToken(userId, oldToken) {
  // Invalidate old token
  await redis.del(`refresh:${oldToken}`);
  
  // Generate new token pair
  const tokens = generateTokenPair(userId);
  
  // Store new refresh token
  await redis.setex(
    `refresh:${tokens.refreshToken}`,
    jwtConfig.refreshTokenMaxAge / 1000,
    userId
  );
  
  return tokens;
}
```

### Rate Limiting

```javascript
// API Rate Limits
const rateLimits = {
  public: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100                   // 100 requests per window
  },
  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 1000                  // 1000 requests per window
  },
  sensitive: {                 // Login, register, 2FA
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 10                    // 10 requests per hour
  }
};
```

### Helmet Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## â›“ï¸ Blockchain Integration

### Blockchain Service

```javascript
// blockchain.service.js
const Web3 = require('web3');
const bitcoin = require('bitcoinjs-lib');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Crypto } = require('@peculiar/webcrypto');

class BlockchainService {
  constructor() {
    // Ethereum
    this.web3 = new Web3(process.env.ETH_NODE_URL);
    
    // Solana
    this.solanaConnection = new Connection(process.env.SOL_RPC_URL);
    
    // Bitcoin (using Blockstream API for non-custodial)
    this.btcNetwork = process.env.NODE_ENV === 'production' 
      ? bitcoin.networks.bitcoin 
      : bitcoin.networks.testnet;
  }

  // ========== WALLET CREATION ==========
  
  async createWallet(coinType) {
    switch(coinType) {
      case 'ETH':
      case 'USDT':  // USDT on Ethereum
        return this._createEthereumWallet();
        
      case 'BTC':
        return this._createBitcoinWallet();
        
      case 'SOL':
        return this._createSolanaWallet();
        
      default:
        throw new Error(`Unsupported coin type: ${coinType}`);
    }
  }

  _createEthereumWallet() {
    const account = this.web3.eth.accounts.create();
    return {
      address: account.address,
      privateKey: account.privateKey
    };
  }

  _createBitcoinWallet() {
    const keyPair = bitcoin.ECPair.makeRandom({ network: this.btcNetwork });
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey,
      network: this.btcNetwork 
    });
    return {
      address,
      privateKey: keyPair.toWIF()
    };
  }

  _createSolanaWallet() {
    const keypair = Keypair.generate();
    return {
      address: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex')
    };
  }

  // ========== BALANCE CHECK ==========
  
  async getBalance(address, coinType) {
    switch(coinType) {
      case 'ETH':
        const weiBalance = await this.web3.eth.getBalance(address);
        return this.web3.utils.fromWei(weiBalance, 'ether');
        
      case 'USDT':
        // USDT ERC-20 contract call
        const contract = new this.web3.eth.Contract(USDT_ABI, USDT_CONTRACT);
        const decimals = await contract.methods.decimals().call();
        const balance = await contract.methods.balanceOf(address).call();
        return balance / Math.pow(10, decimals);
        
      case 'BTC':
        const response = await fetch(`https://blockstream.info/api/address/${address}`);
        const data = await response.json();
        return (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 1e8;
        
      case 'SOL':
        const pubKey = new PublicKey(address);
        const lamports = await this.solanaConnection.getBalance(pubKey);
        return lamports / 1e9;
        
      default:
        throw new Error(`Unsupported coin type: ${coinType}`);
    }
  }

  // ========== TRANSACTION SENDING ==========
  
  async sendTransaction({ fromAddress, privateKey, toAddress, amount, coinType, feeLevel = 'normal' }) {
    switch(coinType) {
      case 'ETH':
        return this._sendEthereum(fromAddress, privateKey, toAddress, amount, feeLevel);
        
      case 'BTC':
        return this._sendBitcoin(fromAddress, privateKey, toAddress, amount, feeLevel);
        
      case 'SOL':
        return this._sendSolana(fromAddress, privateKey, toAddress, amount);
        
      default:
        throw new Error(`Unsupported coin type: ${coinType}`);
    }
  }

  async _sendEthereum(from, privateKey, to, amount, feeLevel) {
    const nonce = await this.web3.eth.getTransactionCount(from, 'pending');
    
    // Get gas price based on fee level
    const baseGasPrice = await this.web3.eth.getGasPrice();
    const multipliers = { slow: 0.8, normal: 1, fast: 1.5 };
    const gasPrice = Math.floor(baseGasPrice * multipliers[feeLevel]);
    
    const tx = {
      nonce,
      to,
      value: this.web3.utils.toWei(amount.toString(), 'ether'),
      gas: 21000,
      gasPrice: gasPrice.toString()
    };
    
    const signedTx = await this.web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return {
      txHash: receipt.transactionHash,
      status: receipt.status ? 'COMPLETED' : 'FAILED',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      fee: this.web3.utils.fromWei((gasPrice * receipt.gasUsed).toString(), 'ether')
    };
  }

  // ========== PRIVATE KEY ENCRYPTION ==========
  
  encryptPrivateKey(privateKey, userPassword) {
    // Use AES-256-GCM encryption
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    
    // Derive key from password
    const key = crypto.pbkdf2Sync(userPassword, salt, 100000, 32, 'sha512');
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decryptPrivateKey(encryptedData, userPassword) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.pbkdf2Sync(
      userPassword,
      Buffer.from(encryptedData.salt, 'hex'),
      100000,
      32,
      'sha512'
    );
    
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = new BlockchainService();
```

---

## 📧 Email Service

```javascript
// email.service.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    this.templates = {};
    this._loadTemplates();
  }

  _loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/email');
    const templates = [
      'welcome',
      'verification',
      'password-reset',
      'transaction-notification',
      'security-alert',
      'kyc-approved',
      'kyc-rejected'
    ];
    
    templates.forEach(name => {
      const templatePath = path.join(templatesDir, `${name}.hbs`);
      if (fs.existsSync(templatePath)) {
        const source = fs.readFileSync(templatePath, 'utf8');
        this.templates[name] = handlebars.compile(source);
      }
    });
  }

  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    
    const html = this.templates.verification({
      name,
      verificationUrl,
      expiryHours: 24
    });
    
    return this.transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html
    });
  }

  async sendTransactionNotification(email, transaction) {
    const html = this.templates['transaction-notification']({
      type: transaction.type,
      amount: transaction.amount,
      coin: transaction.coin_type,
      status: transaction.status,
      txHash: transaction.transaction_hash,
      explorerUrl: this._getExplorerUrl(transaction)
    });
    
    return this.transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Transaction ${transaction.status}: ${transaction.type} ${transaction.amount} ${transaction.coin_type}`,
      html
    });
  }

  _getExplorerUrl(tx) {
    const explorers = {
      ETH: `https://etherscan.io/tx/${tx.transaction_hash}`,
      BTC: `https://blockstream.info/tx/${tx.transaction_hash}`,
      SOL: `https://solscan.io/tx/${tx.transaction_hash}`
    };
    return explorers[tx.coin_type] || '#';
  }
}

module.exports = new EmailService();
```

---

## ðŸ”„ Redis Caching

```javascript
// redis.service.js
const Redis = require('ioredis');

class RedisService {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  // Session Management
  async setSession(sessionId, userId, ttl = 86400) {
    return this.client.setex(`session:${sessionId}`, ttl, userId);
  }

  async getSession(sessionId) {
    return this.client.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return this.client.del(`session:${sessionId}`);
  }

  // Market Data Caching
  async cacheMarketPrices(prices) {
    return this.client.setex('market:prices', 300, JSON.stringify(prices));
  }

  async getMarketPrices() {
    const data = await this.client.get('market:prices');
    return data ? JSON.parse(data) : null;
  }

  // Rate Limiting
  async checkRateLimit(key, limit, windowSeconds) {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime: windowSeconds
    };
  }

  // User Balance Cache
  async cacheBalance(userId, coinType, balance, ttl = 60) {
    return this.client.setex(
      `balance:${userId}:${coinType}`,
      ttl,
      JSON.stringify(balance)
    );
  }

  async getCachedBalance(userId, coinType) {
    const data = await this.client.get(`balance:${userId}:${coinType}`);
    return data ? JSON.parse(data) : null;
  }

  // WebSocket Presence
  async setUserOnline(userId, socketId) {
    await this.client.sadd(`user:sockets:${userId}`, socketId);
    await this.client.set(`socket:user:${socketId}`, userId);
  }

  async setUserOffline(userId, socketId) {
    await this.client.srem(`user:sockets:${userId}`, socketId);
    await this.client.del(`socket:user:${socketId}`);
  }

  async isUserOnline(userId) {
    const count = await this.client.scard(`user:sockets:${userId}`);
    return count > 0;
  }

  // Close connection
  async disconnect() {
    await this.client.quit();
  }
}

module.exports = new RedisService();
```

---

## ðŸ”Œ WebSocket Implementation

```javascript
// websocket/socket.handler.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const redisService = require('../services/redis.service');
const marketService = require('../services/market.service');

class WebSocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.subscribedPrices = new Set();
    this.init();
  }

  init() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      redisService.setUserOnline(socket.userId, socket.id);

      // Handle subscriptions
      socket.on('SUBSCRIBE_PRICES', (coins) => {
        socket.join('price-updates');
        coins.forEach(coin => this.subscribedPrices.add(coin));
      });

      socket.on('SUBSCRIBE_TRANSACTIONS', () => {
        socket.join(`user:${socket.userId}:transactions`);
      });

      socket.on('SUBSCRIBE_BALANCE', (walletId) => {
        socket.join(`wallet:${walletId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        redisService.setUserOffline(socket.userId, socket.id);
      });
    });

    // Start price update loop
    this.startPriceUpdates();
  }

  async startPriceUpdates() {
    setInterval(async () => {
      if (this.subscribedPrices.size === 0) return;

      const prices = await marketService.getLivePrices(
        Array.from(this.subscribedPrices)
      );

      this.io.to('price-updates').emit('PRICE_UPDATE', prices);
    }, 5000); // Every 5 seconds
  }

  // Emitters for other services to use
  notifyTransactionUpdate(userId, transaction) {
    this.io.to(`user:${userId}:transactions`).emit('TRANSACTION_UPDATE', transaction);
  }

  notifyBalanceUpdate(walletId, balance) {
    this.io.to(`wallet:${walletId}`).emit('BALANCE_UPDATE', { walletId, balance });
  }

  notifyUser(userId, notification) {
    this.io.to(`user:${userId}`).emit('NOTIFICATION', notification);
  }
}

module.exports = WebSocketHandler;
```

---

## ðŸ“Š Database Connection with Prisma

```javascript
// config/database.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']
});

// Connection health check
async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('âœ… Database connected successfully');
    return true;
  } catch (error) {
    console.error('âŒ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
async function disconnect() {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

process.on('beforeExit', disconnect);
process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

module.exports = { prisma, checkConnection };
```

---

## ðŸš€ Server Setup

```javascript
// server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { checkConnection } = require('./src/config/database');
const WebSocketHandler = require('./src/websocket/socket.handler');

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Check database connection
  const dbConnected = await checkConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket
  const wsHandler = new WebSocketHandler(server);
  global.wsHandler = wsHandler;  // Make available globally for services

  // Start server
  server.listen(PORT, () => {
    console.log(`ðŸš€ Server running on port ${PORT}`);
    console.log(`ðŸ“š API Documentation: http://localhost:${PORT}/api-docs`);
  });

  // Error handling
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
}

startServer();
```

---

## ðŸ“¦ Required Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    "redis": "^4.6.12",
    "ioredis": "^5.3.2",
    "web3": "^4.3.0",
    "@solana/web3.js": "^1.87.6",
    "bitcoinjs-lib": "^6.1.5",
    "nodemailer": "^6.9.7",
    "handlebars": "^4.7.8",
    "multer": "^1.4.5-lts.1",
    "winston": "^3.11.0",
    "socket.io": "^4.7.4",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "express-validator": "^7.0.1",
    "uuid": "^9.0.1",
    "crypto-js": "^4.2.0",
    "node-cron": "^3.0.3",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

---

## ðŸ“ Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cryptovault

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
BCRYPT_ROUNDS=12

# Blockchain Nodes
ETH_NODE_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
SOL_RPC_URL=https://api.mainnet-beta.solana.com
BTC_API_URL=https://blockstream.info/api

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
APP_NAME=CryptoVault Pro

# External APIs
COINGECKO_API_KEY=your_coingecko_api_key
COINMARKETCAP_API_KEY=your_cmc_key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Admin
ADMIN_SECRET=admin_panel_secret_key
```

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Backend**: Node.js + Express + PostgreSQL


---

# ðŸ—„ï¸ CryptoVault Pro â€“ Database Schema

> **Complete PostgreSQL Schema** with Prisma ORM definitions for all 12+ tables.

---

## ðŸ“Š Entity Relationship Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     Users       â”‚     â”‚     Wallets     â”‚     â”‚  Transactions   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤     â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤     â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ id (PK)         â”‚â”€â”€â”€â”€<â”‚ user_id (FK)    â”‚     â”‚ user_id (FK)    â”‚
â”‚ email           â”‚     â”‚ id (PK)         â”‚     â”‚ wallet_id (FK)  â”‚
â”‚ password_hash   â”‚     â”‚ wallet_address  â”‚     â”‚ id (PK)         â”‚
â”‚ full_name       â”‚     â”‚ coin_type       â”‚     â”‚ transaction_hashâ”‚
â”‚ phone           â”‚     â”‚ balance         â”‚     â”‚ type            â”‚
â”‚ country         â”‚     â”‚ is_default      â”‚     â”‚ amount          â”‚
â”‚ is_2fa_enabled  â”‚     â”‚ is_active       â”‚     â”‚ fee             â”‚
â”‚ kyc_level       â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚ status          â”‚
â”‚ role            â”‚                           â”‚ risk_score      â”‚
â”‚ status          â”‚                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                      â”‚
         â”‚                                                â”‚
         â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                      â”‚
         â”‚         â”‚    Sessions     â”‚                      â”‚
         â”‚         â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                      â”‚
         â”‚â”€â”€â”€â”€â”€â”€â”€â”€<â”‚ user_id (FK)    â”‚                      â”‚
         â”‚         â”‚ id (PK)         â”‚                      â”‚
         â”‚         â”‚ token           â”‚                      â”‚
         â”‚         â”‚ refresh_token   â”‚                      â”‚
         â”‚         â”‚ device          â”‚                      â”‚
         â”‚         â”‚ ip_address      â”‚                      â”‚
         â”‚         â”‚ is_active       â”‚                      â”‚
         â”‚         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                      â”‚
         â”‚                                                  â”‚
         â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚         â”‚  ActivityLogs   â”‚     â”‚
         â”‚         â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤     â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€<â”‚ user_id (FK)    â”‚     â”‚
                   â”‚ id (PK)         â”‚     â”‚
                   â”‚ action          â”‚     â”‚
                   â”‚ ip_address      â”‚     â”‚
                   â”‚ device          â”‚     â”‚
                   â”‚ details (JSON)  â”‚     â”‚
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚
                                            â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚    APIKeys      â”‚     â”‚ StakingPositionsâ”‚ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤     â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚
â”‚ user_id (FK)    â”‚     â”‚ user_id (FK)    â”‚ â”‚
â”‚ id (PK)         â”‚     â”‚ pool_id         â”‚ â”‚
â”‚ key_name        â”‚     â”‚ coin_type       â”‚ â”‚
â”‚ api_key         â”‚     â”‚ amount          â”‚ â”‚
â”‚ api_secret      â”‚     â”‚ lock_period     â”‚ â”‚
â”‚ permissions     â”‚     â”‚ apy             â”‚ â”‚
â”‚ ip_whitelist    â”‚     â”‚ rewards_earned  â”‚ â”‚
â”‚ is_active       â”‚     â”‚ status          â”‚ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
                                            â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  KYCSubmissions â”‚     â”‚    Referrals    â”‚ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤     â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚
â”‚ user_id (FK)    â”‚     â”‚ referrer_id(FK) â”‚ â”‚
â”‚ id (PK)         â”‚     â”‚ referred_id(FK) â”‚<â”˜
â”‚ document_type   â”‚     â”‚ id (PK)         â”‚
â”‚ document_url    â”‚     â”‚ commission_earnedâ”‚
â”‚ status          â”‚     â”‚ status          â”‚
â”‚ reviewed_by     â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Notifications  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ user_id (FK)    â”‚
â”‚ id (PK)         â”‚
â”‚ type            â”‚
â”‚ title           â”‚
â”‚ message         â”‚
â”‚ is_read         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“‹ Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

enum KycLevel {
  LEVEL_0
  LEVEL_1
  LEVEL_2
}

enum CoinType {
  BTC
  ETH
  SOL
  USDT
}

enum TransactionType {
  SEND
  RECEIVE
  SWAP
  BUY
  SELL
  STAKE
  UNSTAKE
}

enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum NotificationType {
  TRANSACTION
  SECURITY
  PRICE_ALERT
  SYSTEM
}

enum KycDocumentType {
  ID_CARD
  PASSPORT
  DRIVERS_LICENSE
  ADDRESS_PROOF
  SELFIE
}

enum KycStatus {
  PENDING
  APPROVED
  REJECTED
}

enum StakingStatus {
  ACTIVE
  COMPLETED
  WITHDRAWN
}

enum ReferralStatus {
  PENDING
  ACTIVE
  COMPLETED
}

// ============================================
// USERS TABLE
// ============================================

model User {
  id                String   @id @default(uuid()) @db.Uuid
  email             String   @unique
  password_hash     String
  full_name         String
  phone             String?
  country           String?
  timezone          String   @default("UTC")
  
  // Verification & Security
  is_email_verified Boolean  @default(false)
  email_verify_token String?
  email_verify_expires DateTime?
  
  is_2fa_enabled    Boolean  @default(false)
  twofa_secret      String?
  twofa_backup_codes String[]
  
  // KYC & Status
  kyc_level         KycLevel @default(LEVEL_0)
  status            UserStatus @default(ACTIVE)
  role              UserRole @default(USER)
  
  // Metadata
  last_login        DateTime?
  failed_login_attempts Int @default(0)
  locked_until      DateTime?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  // Relations
  wallets           Wallet[]
  transactions      Transaction[]
  sessions          Session[]
  activity_logs     ActivityLog[]
  api_keys          ApiKey[]
  staking_positions StakingPosition[]
  kyc_submissions   KycSubmission[]
  notifications     Notification[]
  
  // Referral relations
  referrals_made    Referral[] @relation("Referrer")
  referral_received Referral?  @relation("Referred")
  
  @@index([email])
  @@index([status])
  @@index([kyc_level])
  @@index([created_at])
  @@map("users")
}

// ============================================
// WALLETS TABLE
// ============================================

model Wallet {
  id                    String   @id @default(uuid()) @db.Uuid
  user_id               String   @db.Uuid
  wallet_address        String   @unique
  coin_type             CoinType
  
  // Security
  private_key_encrypted String
  
  // Balance
  balance               Decimal  @default(0) @db.Decimal(20, 8)
  
  // Settings
  wallet_name           String?
  is_default            Boolean  @default(false)
  is_active             Boolean  @default(true)
  
  // Whitelist
  whitelist_enabled     Boolean  @default(false)
  
  // Metadata
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
  
  // Relations
  user                  User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  transactions          Transaction[]
  
  // Whitelisted addresses
  whitelisted_addresses WhitelistedAddress[]
  
  @@index([user_id])
  @@index([coin_type])
  @@index([wallet_address])
  @@map("wallets")
}

model WhitelistedAddress {
  id          String   @id @default(uuid()) @db.Uuid
  wallet_id   String   @db.Uuid
  address     String
  label       String?
  created_at  DateTime @default(now())
  
  wallet      Wallet   @relation(fields: [wallet_id], references: [id], onDelete: Cascade)
  
  @@unique([wallet_id, address])
  @@map("whitelisted_addresses")
}

// ============================================
// TRANSACTIONS TABLE
// ============================================

model Transaction {
  id                String   @id @default(uuid()) @db.Uuid
  transaction_hash  String?  @unique
  
  // Relations
  user_id           String   @db.Uuid
  wallet_id         String   @db.Uuid
  
  // Transaction details
  type              TransactionType
  from_address      String
  to_address        String
  coin_type         CoinType
  
  // Amounts
  amount            Decimal  @db.Decimal(20, 8)
  fee               Decimal  @db.Decimal(20, 8)
  total             Decimal  @db.Decimal(20, 8)
  
  // Status
  status            TransactionStatus @default(PENDING)
  confirmations     Int      @default(0)
  
  // Security
  risk_score        Int      @default(0)
  is_flagged        Boolean  @default(false)
  flag_reason       String?
  
  // Blockchain metadata
  block_number      BigInt?
  gas_used          BigInt?
  gas_price         Decimal? @db.Decimal(20, 0)
  
  // For swaps
  swap_from_amount  Decimal? @db.Decimal(20, 8)
  swap_to_coin      CoinType?
  swap_rate         Decimal? @db.Decimal(20, 8)
  
  // Metadata
  ip_address        String?
  device_info       String?
  note              String?
  
  created_at        DateTime @default(now())
  completed_at      DateTime?
  
  // Relations
  user              User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  wallet            Wallet   @relation(fields: [wallet_id], references: [id])
  
  @@index([user_id])
  @@index([wallet_id])
  @@index([status])
  @@index([coin_type])
  @@index([created_at])
  @@index([transaction_hash])
  @@map("transactions")
}

// ============================================
// SESSIONS TABLE
// ============================================

model Session {
  id            String   @id @default(uuid()) @db.Uuid
  user_id       String   @db.Uuid
  
  // Tokens
  token         String   @unique
  refresh_token String   @unique
  
  // Device info
  device        String?  // e.g., "Chrome on Windows"
  device_type   String?  // desktop, mobile, tablet
  browser       String?
  os            String?
  
  // Location
  ip_address    String
  location      String?  // e.g., "New York, US"
  
  // Status
  is_active     Boolean  @default(true)
  
  // Expiration
  expires_at    DateTime
  refresh_expires_at DateTime
  
  // Metadata
  last_activity DateTime @default(now())
  created_at    DateTime @default(now())
  
  // Relations
  user          User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([token])
  @@index([refresh_token])
  @@index([is_active])
  @@map("sessions")
}

// ============================================
// ACTIVITY LOGS TABLE
// ============================================

model ActivityLog {
  id            String   @id @default(uuid()) @db.Uuid
  user_id       String   @db.Uuid
  
  // Action details
  action        String   // e.g., "LOGIN", "WITHDRAWAL", "SETTINGS_CHANGE"
  category      String   // security, transaction, settings, etc.
  
  // Device & Location
  ip_address    String
  device        String?
  location      String?
  
  // Additional data
  details       Json?    // Flexible JSON for action-specific data
  
  // Risk assessment
  risk_level    String   @default("normal") // low, normal, suspicious, high
  is_suspicious Boolean  @default(false)
  
  created_at    DateTime @default(now())
  
  // Relations
  user          User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([action])
  @@index([created_at])
  @@index([risk_level])
  @@map("activity_logs")
}

// ============================================
// API KEYS TABLE
// ============================================

model ApiKey {
  id              String   @id @default(uuid()) @db.Uuid
  user_id         String   @db.Uuid
  
  // Key details
  key_name        String
  api_key         String   @unique
  api_secret      String   @unique
  
  // Permissions
  permissions     String[] // ['read', 'trade', 'withdraw', 'webhook']
  
  // Security
  ip_whitelist    String[]
  
  // Usage
  last_used       DateTime?
  request_count   Int      @default(0)
  
  // Status & Expiration
  expires_at      DateTime?
  is_active       Boolean  @default(true)
  revoked_at      DateTime?
  revoke_reason   String?
  
  // Webhook
  webhook_url     String?
  webhook_secret  String?
  webhook_events  String[]
  
  created_at      DateTime @default(now())
  
  // Relations
  user            User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([api_key])
  @@map("api_keys")
}

// ============================================
// STAKING POSITIONS TABLE
// ============================================

model StakingPosition {
  id              String   @id @default(uuid()) @db.Uuid
  user_id         String   @db.Uuid
  
  // Pool info
  pool_id         String
  pool_name       String
  
  // Staking details
  coin_type       CoinType
  amount          Decimal  @db.Decimal(20, 8)
  lock_period     Int      // days
  apy             Decimal  @db.Decimal(5, 2) // e.g., 12.50%
  
  // Dates
  start_date      DateTime @default(now())
  end_date        DateTime
  
  // Rewards
  rewards_earned  Decimal  @default(0) @db.Decimal(20, 8)
  last_compound   DateTime?
  
  // Status
  status          StakingStatus @default(ACTIVE)
  
  // Early unstake
  early_unstake_fee Decimal? @db.Decimal(5, 2) // percentage
  
  created_at      DateTime @default(now())
  
  // Relations
  user            User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([status])
  @@index([pool_id])
  @@map("staking_positions")
}

// ============================================
// KYC SUBMISSIONS TABLE
// ============================================

model KycSubmission {
  id                String   @id @default(uuid()) @db.Uuid
  user_id           String   @db.Uuid
  
  // Document
  document_type     KycDocumentType
  document_url      String
  document_number   String?  // ID number if extracted
  
  // Verification
  status            KycStatus @default(PENDING)
  
  // Review
  rejection_reason  String?
  reviewed_by       String?  // admin ID
  reviewed_at       DateTime?
  review_notes      String?
  
  // Auto-verification
  verification_score Decimal? @db.Decimal(3, 2) // 0.00 - 1.00
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  // Relations
  user              User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([status])
  @@index([created_at])
  @@map("kyc_submissions")
}

// ============================================
// REFERRALS TABLE
// ============================================

model Referral {
  id                String   @id @default(uuid()) @db.Uuid
  
  // Relations
  referrer_id       String   @db.Uuid
  referred_id       String   @db.Uuid @unique
  
  // Commission
  commission_rate   Decimal  @default(0.1) @db.Decimal(3, 2) // 10%
  commission_earned Decimal  @default(0) @db.Decimal(20, 8)
  pending_commission Decimal @default(0) @db.Decimal(20, 8)
  
  // Volume tracking
  total_volume      Decimal  @default(0) @db.Decimal(20, 8)
  
  // Status
  status            ReferralStatus @default(PENDING)
  
  // Qualification
  qualified_at      DateTime? // When referred user completed qualifying action
  
  created_at        DateTime @default(now())
  
  // Relations
  referrer          User     @relation("Referrer", fields: [referrer_id], references: [id])
  referred          User     @relation("Referred", fields: [referred_id], references: [id])
  
  @@index([referrer_id])
  @@index([referred_id])
  @@index([status])
  @@map("referrals")
}

// ============================================
// NOTIFICATIONS TABLE
// ============================================

model Notification {
  id          String   @id @default(uuid()) @db.Uuid
  user_id     String   @db.Uuid
  
  // Content
  type        NotificationType
  title       String
  message     String   @db.Text
  
  // Action
  action_url  String?
  action_text String?
  
  // Read status
  is_read     Boolean  @default(false)
  read_at     DateTime?
  
  // Priority
  priority    String   @default("normal") // low, normal, high, urgent
  
  // Related entity
  related_type String? // transaction, wallet, etc.
  related_id   String?
  
  created_at  DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([is_read])
  @@index([type])
  @@index([created_at])
  @@map("notifications")
}

// ============================================
// SYSTEM SETTINGS (for admin)
// ============================================

model SystemSetting {
  id          String   @id @default(uuid()) @db.Uuid
  category    String   // general, fees, security, compliance, etc.
  key         String   @unique
  value       Json
  description String?
  updated_by  String?  // admin ID
  updated_at  DateTime @updatedAt
  created_at  DateTime @default(now())
  
  @@index([category])
  @@map("system_settings")
}

// ============================================
// ADMIN ACTIVITY LOG
// ============================================

model AdminActivity {
  id          String   @id @default(uuid()) @db.Uuid
  admin_id    String   @db.Uuid
  
  // Action
  action      String   // e.g., "USER_SUSPEND", "SETTINGS_UPDATE"
  target_type String?  // user, transaction, setting
  target_id   String?
  
  // Details
  old_values  Json?
  new_values  Json?
  reason      String?
  
  // Metadata
  ip_address  String
  created_at  DateTime @default(now())
  
  @@index([admin_id])
  @@index([action])
  @@index([created_at])
  @@map("admin_activities")
}
```

---

## ðŸ”§ Migration Commands

```bash
# Initialize Prisma
npx prisma init

# Generate migration
npx prisma migrate dev --name init

# Deploy migration to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## ðŸ“ˆ Indexes Summary

| Table | Indexed Fields | Purpose |
|-------|---------------|---------|
| users | email, status, kyc_level, created_at | Fast lookups, filtering |
| wallets | user_id, coin_type, wallet_address | User wallets, coin queries |
| transactions | user_id, status, coin_type, created_at, tx_hash | User history, status filtering |
| sessions | user_id, token, refresh_token, is_active | Session validation, cleanup |
| activity_logs | user_id, action, created_at, risk_level | User activity, security monitoring |
| api_keys | user_id, api_key | Key validation, user lookup |
| staking_positions | user_id, status, pool_id | User stakes, pool queries |
| kyc_submissions | user_id, status, created_at | KYC processing queue |
| referrals | referrer_id, referred_id, status | Referral tracking |
| notifications | user_id, is_read, type, created_at | User inbox, unread count |

---

## ðŸ“ Seed Data Example

```javascript
// prisma/seed.js
const { PrismaClient, UserRole, CoinType, KycLevel } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cryptovault.com',
      password_hash: adminPassword,
      full_name: 'System Admin',
      role: UserRole.SUPER_ADMIN,
      is_email_verified: true,
      kyc_level: KycLevel.LEVEL_2
    }
  });

  // Create test user
  const userPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password_hash: userPassword,
      full_name: 'Test User',
      role: UserRole.USER,
      is_email_verified: true,
      kyc_level: KycLevel.LEVEL_1,
      wallets: {
        create: [
          {
            wallet_address: '0x742d35Cc6634C0532925a3b8D4332eD24aC3cD2B',
            coin_type: CoinType.ETH,
            private_key_encrypted: 'encrypted_private_key_here',
            balance: 1.5,
            is_default: true
          },
          {
            wallet_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            coin_type: CoinType.BTC,
            private_key_encrypted: 'encrypted_private_key_here',
            balance: 0.05
          }
        ]
      }
    }
  });

  console.log('âœ… Seed data created');
  console.log('Admin:', admin.email);
  console.log('User:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Database**: PostgreSQL 15+


---

# ðŸ”Œ CryptoVault Pro â€“ API Documentation

> **50+ RESTful API Endpoints** with request/response specifications.

---

## ðŸ“ Base URL

```
Development: http://localhost:3000/api
Production:  https://api.cryptovaultpro.com/api
```

---

## ðŸ” Authentication

Protected endpoints require Bearer token:
```
Authorization: Bearer {access_token}
```

---

## ðŸ‘¤ AUTH ENDPOINTS

### POST /api/auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "country": "US"
}

// Response 201
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "wallet_address": "0x...",
    "kyc_level": "LEVEL_0"
  }
}
```

### POST /api/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_2fa_enabled": false
  }
}
```

### POST /api/auth/logout
**Headers:** `Authorization: Bearer {token}`
```json
{ "message": "Logged out successfully" }
```

### POST /api/auth/refresh
```json
// Request
{ "refresh_token": "eyJhbGciOiJIUzI1NiIs..." }

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 900
}
```

### POST /api/auth/forgot-password
```json
{ "email": "user@example.com" }
```

### POST /api/auth/reset-password
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

---

## ðŸ’¼ WALLET ENDPOINTS

### GET /api/wallet
**Headers:** `Authorization: Bearer {token}`
```json
{
  "wallets": [
    {
      "id": "uuid",
      "wallet_address": "0x...",
      "coin_type": "ETH",
      "balance": "1.50000000",
      "usd_value": 3450.00,
      "is_default": true
    }
  ],
  "total_usd_value": 5550.00
}
```

### POST /api/wallet/create
```json
// Request
{
  "coin_type": "SOL",
  "wallet_name": "My Solana Wallet"
}

// Response 201
{
  "wallet": {
    "id": "uuid",
    "wallet_address": "HN7cABqLq...",
    "coin_type": "SOL",
    "balance": "0"
  },
  "backup_phrase": "word1 word2 ... word12"
}
```

### GET /api/wallet/:id/balance
```json
{
  "balance": "1.50000000",
  "usd_value": 3450.00,
  "last_updated": "2024-01-20T14:30:00Z"
}
```

---

## ðŸ’¸ TRANSACTION ENDPOINTS

### POST /api/transaction/send
```json
// Request
{
  "wallet_id": "uuid",
  "to_address": "0x...",
  "amount": "0.5",
  "coin_type": "ETH",
  "fee_level": "normal",
  "note": "Payment"
}

// Response 202
{
  "transaction_id": "uuid",
  "status": "PENDING",
  "transaction_hash": "0x...",
  "amount": "0.5",
  "fee": "0.0021",
  "total": "0.5021",
  "estimated_time": "~2 minutes"
}
```

### GET /api/transaction/history
**Query:** `?page=1&limit=10&type=SEND&coin=ETH`
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "SEND",
      "coin_type": "ETH",
      "amount": "0.5",
      "status": "COMPLETED",
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "total_pages": 5
  }
}
```

### GET /api/transaction/:id
```json
{
  "id": "uuid",
  "transaction_hash": "0x...",
  "type": "SEND",
  "amount": "0.5",
  "status": "COMPLETED",
  "confirmations": 12,
  "explorer_url": "https://etherscan.io/tx/0x...",
  "created_at": "2024-01-20T14:30:00Z"
}
```

---

## ðŸ“Š MARKET ENDPOINTS

### GET /api/market/prices
**Query:** `?coins=BTC,ETH,SOL,USDT`
```json
{
  "prices": {
    "BTC": {
      "usd": 42000.00,
      "change_24h": 2.5,
      "market_cap": 820000000000
    },
    "ETH": {
      "usd": 2300.00,
      "change_24h": -1.2
    }
  }
}
```

### GET /api/market/chart/:coin
**Query:** `?days=7`
```json
{
  "coin": "BTC",
  "prices": [
    [1705689600000, 41500.00],
    [1705776000000, 41800.00]
  ]
}
```

### GET /api/market/global
```json
{
  "total_market_cap": 1650000000000,
  "total_volume_24h": 85000000000,
  "btc_dominance": 49.5,
  "fear_greed_index": 75
}
```

---

## ðŸ’¼ PORTFOLIO ENDPOINTS

### GET /api/portfolio/summary
```json
{
  "total_value": 5550.00,
  "total_pnl": 550.00,
  "pnl_percentage": 11.0,
  "change_24h": {
    "amount": 150.00,
    "percentage": 2.78
  }
}
```

### GET /api/portfolio/allocation
```json
{
  "allocation": [
    {
      "coin": "ETH",
      "value": 3450.00,
      "percentage": 62.16
    },
    {
      "coin": "BTC",
      "value": 2100.00,
      "percentage": 37.84
    }
  ]
}
```

### GET /api/portfolio/performance
**Query:** `?days=30`
```json
{
  "performance": [
    { "date": "2023-12-21", "value": 5000.00 },
    { "date": "2024-01-20", "value": 5550.00 }
  ]
}
```

---

## ðŸ¦ TRADING ENDPOINTS

### POST /api/trade/buy
```json
// Request
{
  "fiat_amount": 1000.00,
  "fiat_currency": "USD",
  "coin_type": "BTC",
  "payment_method_id": "card_xxx"
}

// Response
{
  "order_id": "uuid",
  "status": "PROCESSING",
  "coin_amount": "0.0238",
  "rate": 42000.00,
  "fee": 29.90,
  "total": 1029.90
}
```

### GET /api/trade/rate
**Query:** `?from_coin=ETH&to_coin=USDT&amount=1`
```json
{
  "rate": 2295.0,
  "from_amount": 1.0,
  "to_amount": 2295.0,
  "fee": 0.0005
}
```

---

## ðŸ¥© STAKING ENDPOINTS

### GET /api/staking/pools
```json
{
  "pools": [
    {
      "id": "pool_eth_1",
      "coin": "ETH",
      "apy": 4.5,
      "lock_period": 30,
      "min_stake": 0.1,
      "total_staked": 15000.5
    }
  ]
}
```

### POST /api/staking/stake
```json
// Request
{
  "pool_id": "pool_eth_1",
  "wallet_id": "uuid",
  "amount": 1.0
}

// Response
{
  "position_id": "uuid",
  "apy": 4.5,
  "estimated_rewards": 0.045,
  "unlock_date": "2024-02-20T14:30:00Z"
}
```

### GET /api/staking/positions
```json
{
  "positions": [
    {
      "id": "uuid",
      "pool_id": "pool_eth_1",
      "coin": "ETH",
      "amount": 1.0,
      "apy": 4.5,
      "rewards_earned": 0.00375,
      "status": "ACTIVE"
    }
  ]
}
```

---

## ðŸ‘¥ USER ENDPOINTS

### GET /api/user/profile
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_email_verified": true,
  "is_2fa_enabled": true,
  "kyc_level": "LEVEL_1",
  "referral_code": "JOHN123"
}
```

### PUT /api/user/profile
```json
{
  "full_name": "John Updated",
  "phone": "+1987654321",
  "country": "CA"
}
```

### PUT /api/user/change-password
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass123!"
}
```

---

## ðŸ”” NOTIFICATION ENDPOINTS

### GET /api/notifications
**Query:** `?page=1&limit=20&unread_only=true`
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "TRANSACTION",
      "title": "Transaction Completed",
      "message": "Your send of 0.5 ETH has been confirmed.",
      "is_read": false,
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "unread_count": 5
}
```

### PUT /api/notifications/read-all
```json
{ "message": "All marked as read" }
```

---

## ðŸ”‘ API KEY ENDPOINTS

### GET /api/api-keys
```json
{
  "api_keys": [
    {
      "id": "uuid",
      "key_name": "Trading Bot",
      "api_key": "cv_live_xxx...",
      "permissions": ["read", "trade"],
      "is_active": true
    }
  ]
}
```

### POST /api/api-keys
```json
// Request
{
  "key_name": "Trading Bot",
  "permissions": ["read", "trade"],
  "expires_in_days": 90
}

// Response 201
{
  "api_key": "cv_live_abc123...",
  "api_secret": "cv_secret_xyz789...",
  "warning": "Save the API secret now. It will not be shown again."
}
```

---

## ðŸ§‘â€ðŸ’¼ ADMIN ENDPOINTS

### GET /api/admin/dashboard/stats
```json
{
  "total_users": 15420,
  "new_users_24h": 156,
  "total_transactions_24h": 3420,
  "total_volume_24h": 12500000.00,
  "flagged_transactions": 12,
  "pending_kyc": 45
}
```

### GET /api/admin/users
**Query:** `?page=1&limit=25&status=ACTIVE`
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "status": "ACTIVE",
      "kyc_level": "LEVEL_1",
      "total_balance_usd": 5550.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 15420
  }
}
```

### GET /api/admin/transactions
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_email": "user@example.com",
      "amount": 10000.00,
      "risk_score": 85,
      "is_flagged": true
    }
  ]
}
```

### PUT /api/admin/transactions/:id/flag
```json
{
  "reason": "Suspicious pattern",
  "risk_score": 90
}
```

---

**Version**: 1.0.0  
**Last Updated**: April 2026

