# GlobeTrotter

GlobeTrotter is a full-stack, enterprise-grade travel planning and itinerary management platform built for modern travelers and administrators.

## Project Overview

GlobeTrotter provides an integrated environment for organizing multi-destination trips, scheduling day-by-day itineraries, discovering destinations, monitoring expenses against budgets, tracking real-time notifications, sharing read-only travel plans, auditing trip activity logs, and managing platform operations through a dedicated administration panel.

The platform solves the fragmented nature of travel planning by consolidating destination research, day-by-day scheduling, financial management, team sharing, and administrative monitoring into a unified, secure web application.

## Problem Statement

Conventional travel planning relies on disconnected spreadsheets, note applications, messaging threads, and separate financial tools. This fragmentation introduces several challenges:

1. Scattered Information: Itineraries, ticket details, and destination notes are stored across multiple platforms, leading to disorganization during travel.
2. Unclear Day-by-Day Scheduling: Planning complex multi-city trips lacks chronological structure, making time allocation and activity sequencing difficult.
3. Lack of Expense Tracking: Travelers struggle to track multi-currency expenses against trip budgets in real time.
4. Friction in Collaboration and Sharing: Sharing itineraries with family or travel companions often requires granting edit permissions or sending outdated static documents.
5. Absence of System Auditing and Administration: Platform administrators lack tools to monitor user activity, platform health, user statuses, and global analytics.

GlobeTrotter addresses these problems by offering structured trip stops, day-grouped itinerary timelines with activity reordering, budget-to-expense tracking, tokenized public sharing links, real-time event notifications, chronological activity audit logs, and a role-guarded administration panel.

## Key Features

### Authentication and Access Control
- Secure user registration and login using JSON Web Tokens (JWT) and Bcrypt password hashing.
- Role-based authorization distinguishing regular Users from Administrators.
- Active and inactive user account status enforcement.

### Trip Management
- Create, update, and delete multi-destination travel plans with custom date ranges, cover images, and trip budgets.
- Sequential city stops management within trips.
- Automatic trip status classification (Upcoming, Ongoing, Completed).

### Day-Wise Itinerary Planning
- Chronological day-grouped activity timelines.
- Full CRUD operations for itinerary items with title, date, start/end times, location, and trip stop association.
- Transaction-based activity reordering (Move Up / Move Down) within daily schedules.
- Nested sub-tasks and checkpoint management for individual itinerary items.

### City Discovery and Recommendations
- Explore curated cities with geographic details, popularity indices, and cost indicators.
- Filter destinations by categories (Historical, Adventure, Beach, Nature, Urban, Cultural).
- City search and intelligent destination recommendation engine.

### Expense and Budget Management
- Real-time expense logging with categories (Accommodation, Transport, Food, Activities, Shopping, Other).
- Currency selection and expense amount tracking against allocated trip budgets.
- Visual budget progress bars, category distribution breakdowns, and expense summaries.

### Public Trip Sharing
- Generate cryptographically secure, tokenized public share links.
- Set optional expiration dates for public links.
- Read-only public view (`/shared/:shareToken`) allowing external viewers to inspect trip itineraries without authentication.
- Instant link revocation capabilities.

### Notifications and System Alerts
- Automated system notifications for trip events, budget threshold warnings, and itinerary updates.
- Unread notification counts and mark-as-read management.

### Activity History and Audit Logs
- Automated event logging for trip creation, destination changes, itinerary updates, expense additions/deletions, and link sharing.
- Chronological audit timeline grouped by date (Today, Yesterday, This Week, Earlier).
- Filterable activity categories and detailed JSON metadata inspector.

### Reports and Analytics
- Executive dashboard with analytics cards, KPI metrics, and category charts.
- Data visualization for expense breakdowns, active trip distributions, and financial totals.

### Administration Panel and System Management
- Isolated administrative layout (`/admin`) guarded by server-side `requireAdmin` middleware.
- System overview dashboard displaying user counts, trip metrics, total expenses, and live activity streams.
- User management table with search, role/status filtering, account activation/deactivation, and self-deactivation protection.
- Read-only platform trip monitoring and system activity log audit tools.

## User Flow

1. Registration / Authentication: User registers an account or signs in via `/login` to receive a JWT session token.
2. Dashboard Access: User accesses `/dashboard` to view upcoming trips, active budget metrics, recent notifications, and quick actions.
3. Trip Creation: User navigates to `/trips/new` to create a trip with a name, description, date range, cover image, and allocated budget.
4. Destination Mapping: User adds city stops to the trip via the Trip Details page.
5. Itinerary Scheduling: User opens `/trips/:id/itinerary` to schedule day-by-day activities, specify start/end times, reorder items, and add sub-tasks.
6. Expense Logging: User tracks spending at `/trips/:id/expenses`, monitoring category totals against the trip budget.
7. Collaboration and Sharing: User generates a read-only share link via `/trips/:id` to share travel plans externally.
8. Activity Audit: User reviews modification history at `/trips/:id/history`.
9. Administration (Admins Only): Authorized administrators navigate to `/admin` to inspect system health, manage user statuses, and review platform reports.

## Application Modules

- Module 1 — Authentication: User registration, login, JWT issuance, and session restoration.
- Module 2 — User Management: User profile viewing and credential management.
- Module 3 — Trip Management: Core CRUD operations for trips and sequential destination stops.
- Module 4 — Itinerary Management: Day-wise scheduling, time validation, and activity ordering.
- Module 5 — City Discovery: Destination search, category filtering, and city information.
- Module 6 — Destination Recommendations: Recommendation engine matching traveler preferences.
- Module 7 — Trip / Itinerary Enhancement: Transactional itinerary reordering, sub-activities, and stop links.
- Module 8 — Public Trip Sharing: Cryptographic token generation, public read-only views, and link revocation.
- Module 9 — Expense / Budget Management: Multi-category expense tracking and budget progress analysis.
- Module 10 — Notifications & Alerts: System notifications for budget thresholds and trip milestones.
- Module 11 — Trip History & Activity Log: System-wide event instrumentation and chronological audit logging.
- Module 12 — Reports & Analytics Dashboard: Visual KPI cards and category distribution charts.
- Module 13 — Admin Panel & System Management: Role-guarded administrative dashboard, user status management, platform trip monitoring, and audit tools.

## Technology Stack

### Frontend
- Core Framework: React 19 (React DOM 19)
- Build Tool: Vite 8
- Routing: React Router DOM v7
- HTTP Client: Axios (configured with interceptors for Bearer token attachment and error handling)
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`), CLSX, Tailwind Merge
- Icons: Lucide React

### Backend
- Runtime: Node.js (>=18.0.0)
- Application Framework: Express v4
- ORM: Prisma ORM v5
- Authentication & Encryption: JSON Web Token (`jsonwebtoken`), BcryptJS (`bcryptjs`)
- Middleware: CORS, Express JSON parser, Centralized Error Handling, JWT Auth, Admin Authorization
- Environment Management: Dotenv

### Database
- Relational Database: PostgreSQL

## System Architecture

```mermaid
graph TD
    Client[Browser Client - React / Vite] -->|HTTPS / REST API| Express[Express API Gateway]
    
    subgraph Backend Architecture
        Express --> AuthMW[Auth Middleware - JWT & Role Check]
        AuthMW --> Controllers[API Controllers]
        Controllers --> Services[Business Services]
        Services --> Prisma[Prisma ORM]
    end

    subgraph Data Storage
        Prisma --> DB[(PostgreSQL Database)]
    end

    subgraph External Viewers
        PublicUser[External Visitor] -->|GET /shared/:token| SharedRoute[Public Share Route]
        SharedRoute --> Express
    end
```

## Database

GlobeTrotter uses PostgreSQL managed through Prisma ORM. The primary data models include:

- User: Stores user accounts with email, password hash, name, role (`USER` or `ADMIN`), and status (`ACTIVE` or `INACTIVE`).
- Trip: Stores trip details, custom date ranges, cover images, allocated budgets, and user ownership references.
- City: Contains destination cities, country names, geographic coordinates (latitude/longitude), cost indices, and popularity ratings.
- Activity: Predefined activities linked to specific cities.
- TripStop: Connects trips to cities with sequence ordering and stop-specific date bounds.
- ItineraryItem: Represents scheduled day-by-day items on a trip with date, start time, end time, location, and day-wise ordering.
- ItineraryActivity: Nested sub-tasks or checkpoints associated with itinerary items or trip stops.
- Expense: Financial entries linked to trips with amount, currency, category, description, and expense timestamp.
- PublicShare: Tokenized sharing records with cryptographic tokens and optional expiration dates.
- ActivityLog: System audit log entries recording user ID, trip ID, action type, entity type, description, JSON metadata, and timestamps.
- Notification: System alert records storing user ID, notification type, title, message, read status, and related entity references.

## API / Backend Overview

The backend exposes a structured RESTful API organized into the following controller modules:

### Health Check
- `GET /api/health`: Validates backend operational status.

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Creates a new user account.
- `POST /api/auth/login`: Authenticates credentials and returns a JWT token.
- `GET /api/auth/me`: Restores active user session information.

### Trip Management (`/api/trips`)
- `GET /api/trips`: Lists trips created by the authenticated user.
- `POST /api/trips`: Creates a new trip record.
- `GET /api/trips/:id`: Retrieves single trip details including stops and itinerary.
- `PUT /api/trips/:id`: Updates trip information.
- `DELETE /api/trips/:id`: Removes a trip and all associated data.
- `POST /api/trips/:id/stops`: Adds a destination city stop to a trip.
- `DELETE /api/trips/:id/stops/:stopId`: Removes a destination stop from a trip.

### Itinerary Planning (`/api/trips/:tripId/itinerary`)
- `GET /api/trips/:tripId/itinerary`: Retrieves day-grouped itinerary items.
- `POST /api/trips/:tripId/itinerary`: Adds an itinerary item.
- `PUT /api/trips/:tripId/itinerary/:itemId`: Updates an itinerary item.
- `PATCH /api/trips/:tripId/itinerary/:itemId`: Partially updates an itinerary item.
- `DELETE /api/trips/:tripId/itinerary/:itemId`: Deletes an itinerary item.
- `PATCH /api/trips/:tripId/itinerary/reorder`: Transactionally updates day-wise activity sequence ordering.
- `POST /api/trips/:tripId/itinerary/:itemId/activities`: Adds a sub-task to an itinerary item.
- `PATCH /api/trips/:tripId/itinerary/:itemId/activities/:activityId`: Updates a sub-task.
- `DELETE /api/trips/:tripId/itinerary/:itemId/activities/:activityId`: Deletes a sub-task.

### Expenses and Budget (`/api/trips/:tripId/expenses`)
- `GET /api/trips/:tripId/expenses`: Lists expenses for a trip.
- `POST /api/trips/:tripId/expenses`: Creates a new expense entry.
- `GET /api/trips/:tripId/expenses/summary`: Calculates budget progress, category totals, and recent expenses.
- `PUT /api/trips/:tripId/expenses/:expenseId`: Updates an expense.
- `DELETE /api/trips/:tripId/expenses/:expenseId`: Deletes an expense.

### Public Trip Sharing
- `POST /api/trips/:tripId/share`: Generates a tokenized public share link.
- `GET /api/trips/:tripId/share`: Lists active share links for a trip.
- `DELETE /api/trips/:tripId/share/:shareId`: Revokes a share link.
- `GET /api/shared/:shareToken`: Public endpoint returning read-only trip data.

### Destinations and Recommendations (`/api/destinations`)
- `GET /api/destinations/cities`: Lists available cities.
- `GET /api/destinations/cities/:id`: Retrieves city details.
- `GET /api/destinations/search`: Searches cities by name or country.
- `GET /api/destinations/popular`: Retrieves popular destination cities.
- `GET /api/destinations/categories`: Retrieves city category classifications.

### Activity Audit History (`/api/trips/:tripId/history`)
- `GET /api/trips/:tripId/history`: Retrieves paginated activity logs for a trip.
- `GET /api/trips/:tripId/history/:activityId`: Retrieves detail for a single activity log entry.

### Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieves notifications for the logged-in user.
- `GET /api/notifications/unread-count`: Returns count of unread notifications.
- `PUT /api/notifications/mark-all-read`: Marks all notifications as read.
- `PUT /api/notifications/:id/read`: Marks a single notification as read.

### User Reports (`/api/reports`)
- `GET /api/reports/dashboard`: Returns user dashboard analytics and KPI summaries.
- `GET /api/reports/trip/:tripId`: Returns analytics for a specific trip.

### Admin Panel (`/api/admin`)
- `GET /api/admin/overview`: System-wide statistics and activity stream.
- `GET /api/admin/users`: Paginated user list with search and role/status filters.
- `GET /api/admin/users/:userId`: Single user profile inspector.
- `PATCH /api/admin/users/:userId/status`: Updates user status or role (with self-deactivation protection).
- `GET /api/admin/trips`: Read-only platform trip monitor.
- `GET /api/admin/activity`: System-wide audit log monitor.
- `GET /api/admin/reports`: System analytics and expense category reports.

## Frontend Overview

The frontend is a single-page application (SPA) built using React 19, Vite, and React Router DOM v7.

- Layout Architecture:
  - `AuthLayout`: Minimal centered layout for login and signup screens.
  - `MainLayout`: Application shell containing the Sidebar, Header, Mobile Navigation, and main content Outlet.
  - `AdminLayout`: Specialized administrative layout with dedicated navigation sidebar and admin status header.
- Route Guards:
  - `ProtectedRoute`: Verifies JWT authentication token presence and restores active session before granting access to user application routes.
  - `AdminRoute`: Verifies authentication and checks `user.role === 'ADMIN'`, rendering an Access Denied view if unauthorized.
- State Management and Services:
  - `AuthContext`: Centralized React Context managing login, signup, session restoration (`GET /api/auth/me`), token persistence in `localStorage`, and logout.
  - Service Layer: Modular API wrapper files (`api.js`, `authService.js`, `tripService.js`, `itineraryService.js`, `cityService.js`, `expenseService.js`, `shareService.js`, `notificationService.js`, `historyService.js`, `reportService.js`, `adminService.js`).
- UI Component Library:
  - Reusable primitives (`Button`, `Card`, `Input`, `Badge`, `LoadingState`, `EmptyState`).
  - Analytics visualization charts (`BarChart`, `DonutChart`, `LineChart`, `KpiCard`).

## Installation and Setup

### Prerequisites

Ensure the following tools are installed on your environment:
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- PostgreSQL (v14.0 or higher)

### Repository Setup

1. Clone the repository:

```bash
git clone https://github.com/hetutrivedi2005-cmyk/ODOO-X-LDCE.git
cd ODOO-X-LDCE
```

### Backend Setup

1. Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

2. Create the backend environment file:

```bash
cp .env.example .env
```

3. Configure environment variables inside `backend/.env` (see Environment Variables section below).

4. Create the PostgreSQL database:

```sql
CREATE DATABASE odoo_x_ldce;
```

5. Generate Prisma Client and apply database migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

### Frontend Setup

1. Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

2. Create the frontend environment file:

```bash
cp .env.example .env
```

3. Configure `VITE_API_URL` inside `frontend/.env`.

## Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable | Purpose | Expected Format / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP server listening port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:YOUR_PASSWORD@localhost:5432/odoo_x_ldce?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `YOUR_SUPER_SECRET_JWT_KEY` |
| `CLIENT_URL` | Allowed CORS client origin URL | `http://localhost:5173` |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Purpose | Expected Format / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API gateway URL | `http://localhost:5000` |

## Running the Project

Running GlobeTrotter requires executing both backend and frontend servers simultaneously in separate terminal windows.

### Terminal 1 — Backend Server

```bash
cd backend
npm run dev
```

The backend server starts on `http://localhost:5000`. You can verify API health by navigating to `http://localhost:5000/api/health`.

To run the backend in production mode:

```bash
cd backend
npm start
```

### Terminal 2 — Frontend Application

```bash
cd frontend
npm run dev
```

The frontend development server starts on `http://localhost:5173`. Open this URL in a browser to access the application.

To build the frontend for production:

```bash
cd frontend
npm run build
```

## Project Structure

```text
ODOO-X-LDCE/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── expense.controller.js
│   │   │   ├── history.controller.js
│   │   │   ├── itinerary.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── recommendation.controller.js
│   │   │   ├── report.controller.js
│   │   │   ├── share.controller.js
│   │   │   └── trip.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── expense.routes.js
│   │   │   ├── health.js
│   │   │   ├── history.routes.js
│   │   │   ├── itinerary.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── recommendation.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── share.routes.js
│   │   │   └── trip.routes.js
│   │   ├── services/
│   │   │   ├── activityLog.service.js
│   │   │   ├── admin.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── expense.service.js
│   │   │   ├── itinerary.service.js
│   │   │   ├── notification.service.js
│   │   │   ├── report.service.js
│   │   │   ├── share.service.js
│   │   │   └── trip.service.js
│   │   ├── utils/
│   │   │   └── jwt.js
│   │   └── app.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   ├── common/
│   │   │   ├── expenses/
│   │   │   ├── itinerary/
│   │   │   ├── layout/
│   │   │   ├── notifications/
│   │   │   ├── sharing/
│   │   │   ├── trip/
│   │   │   └── ui/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminActivityPage.jsx
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   ├── AdminReportsPage.jsx
│   │   │   │   ├── AdminTripsPage.jsx
│   │   │   │   ├── AdminUserDetailPage.jsx
│   │   │   │   └── AdminUsersPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EditTripPage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── ItineraryPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NewTripPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── PublicTripView.jsx
│   │   │   ├── RecommendationsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── TripDetailsPage.jsx
│   │   │   ├── TripExpensesPage.jsx
│   │   │   ├── TripHistoryPage.jsx
│   │   │   └── TripsPage.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── cityService.js
│   │   │   ├── expenseService.js
│   │   │   ├── historyService.js
│   │   │   ├── itineraryService.js
│   │   │   ├── notificationService.js
│   │   │   ├── reportService.js
│   │   │   ├── shareService.js
│   │   │   └── tripService.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Screens / Pages

- Login Page (`/login`): User authentication entry point.
- Signup Page (`/signup`): Account registration screen.
- Dashboard Page (`/dashboard`): Personal dashboard showing trip summaries, budget alerts, and recent activities.
- My Trips Page (`/trips`): Grid view of user's travel plans with search and status filters.
- Create Trip Page (`/trips/new`): Form to create new trips with budget allocation and dates.
- Trip Details Page (`/trips/:id`): Overview of a specific trip, destination stops, and action links.
- Edit Trip Page (`/trips/:id/edit`): Update trip information, name, cover image, dates, or budget.
- Itinerary Page (`/trips/:id/itinerary`): Day-by-day activity timeline with reorder controls and sub-tasks.
- Expenses Page (`/trips/:id/expenses`): Expense logging, budget tracking, and category summaries.
- Activity History Page (`/trips/:id/history`): Audit timeline recording trip changes.
- Explore Cities Page (`/explore`): Destination discovery and city catalog.
- Recommendations Page (`/explore/recommendations`): Destination recommendations based on traveler category filters.
- Public Shared Trip View (`/shared/:shareToken`): Read-only view for external link recipients.
- Reports & Analytics Page (`/reports`): Financial breakdown charts and overall analytics.
- Notifications Page (`/notifications`): Full-page view of user system alerts.
- Profile Page (`/profile`): User account profile details.
- Admin Overview Page (`/admin`): Executive admin dashboard displaying platform metrics.
- Admin Users Page (`/admin/users`): User management table with account status toggles.
- Admin User Detail Page (`/admin/users/:userId`): Single user profile inspector for admins.
- Admin Trips Page (`/admin/trips`): Read-only platform trip monitor.
- Admin Activity Page (`/admin/activity`): System-wide activity audit log stream.
- Admin Reports Page (`/admin/reports`): Administrative platform analytics reports.

## Security Considerations

1. Authentication & Token Handling: JWT tokens are generated upon authentication and attached to outgoing API requests via Axios authorization headers (`Authorization: Bearer <token>`). Tokens are stored client-side in `localStorage`.
2. Password Security: User passwords are encrypted using BcryptJS (`bcryptjs`) with a salt factor of 10 prior to database storage. Plaintext passwords are never stored or logged.
3. Server-Side Role Authorization: Administrative access to `/api/admin/*` endpoints is strictly enforced by `requireAdmin` middleware, checking server-authenticated user roles (`role === 'ADMIN'`). Unauthenticated or unauthorized requests receive a `403 Forbidden` response.
4. Account Status Enforcement: Accounts marked as `INACTIVE` are blocked at the authentication middleware level, returning `403 Forbidden`.
5. Data Sanitization: Sensitive fields such as `passwordHash` are stripped from database query responses before sending data to the client.
6. Public Share Token Security: Public sharing links utilize random 24-byte cryptographic hex tokens (`crypto.randomBytes(24)`). Link expiration and token validity are checked on every access.
7. Self-Deactivation Protection: Admin user status management prevents administrators from accidentally deactivating their own active account.
8. CORS Configuration: Cross-Origin Resource Sharing is controlled via Express `cors` middleware, specifying allowed origins.

## Error Handling and Validation

- Centralized Middleware: Express error handling uses custom `notFoundHandler` for 404 routes and `globalErrorHandler` for formatting internal errors.
- Structured Error Responses: API errors return standardized JSON payloads:

```json
{
  "success": false,
  "message": "Human-readable error explanation"
}
```

- Input Validation: Server controllers validate mandatory fields, date bounds (end date must not precede start date), 24-hour time formats (`HH:MM`), and numerical expense values.
- Frontend Error States: React components capture API errors and display user-friendly error banners with retry buttons rather than blank screens.

## Testing

Frontend code linting is configured using Oxlint.

To execute frontend code linting:

```bash
cd frontend
npm run lint
```

Backend endpoints can be validated using health checks and API client suites (such as Postman or Bruno) against `http://localhost:5000/api/health`.

## Deployment

GlobeTrotter is designed for dual-process deployment:

- Frontend: Can be built into static assets using `npm run build` inside `frontend/` and served via static hosting providers (such as Vercel, Netlify, or Nginx).
- Backend: Can be deployed to Node.js container or application environments (such as Render, AWS EC2, or Railway) executing `npm start` in `backend/`.
- Database: Managed PostgreSQL database instance with connection pooling.

Ensure environment variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `VITE_API_URL`) are configured on the production environment.

## Future Improvements

- Offline Synchronization: PWA offline caching for itinerary access without internet connectivity.
- Drag-and-Drop Itinerary Builder: Direct drag-and-drop UI for reordering daily activities.
- Weather Integration: Live weather forecasting for scheduled trip destinations.
- Export to PDF / iCal: Downloadable trip itineraries and calendar synchronization.
- Multi-Currency Conversion: Real-time currency exchange rates for global expense logging.

## Contributors

GlobeTrotter was developed for the ODOO-X-LDCE Hackathon by:

- Person 1 (Akshay) — Backend Architecture & Core APIs
- Person 2 (Het) — Frontend Foundation, Auth, Itinerary Management, History, & Admin System
- Person 3 (Mantra) — City Discovery, Recommendations, & Reporting

## License

This project currently has no explicit open-source license specified. All rights are reserved by the repository owners.

## Final Project Summary

GlobeTrotter is a full-stack travel planning platform that unites multi-city trip creation, day-by-day scheduling, budget tracking, read-only public sharing, real-time alerts, activity audit logs, and administrative controls. Built with React 19, Vite, Tailwind CSS, Node.js, Express, Prisma ORM, and PostgreSQL, GlobeTrotter delivers a secure, responsive, and structured experience for modern travel planning.
