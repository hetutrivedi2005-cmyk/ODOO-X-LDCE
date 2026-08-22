# GlobeTrotter Backend Foundation

Welcome to the backend component of the **GlobeTrotter** application (ODOO_LDCE Hackathon). This module serves as the core foundation, housing the server, routing infrastructure, error handling, and database schemas with Prisma ORM and PostgreSQL.

## Folder Structure

```text
backend/
├── prisma/
│   └── schema.prisma      # Prisma schema and model definitions
├── src/
│   ├── config/
│   │   └── prisma.js      # Global Prisma client configuration
│   ├── controllers/
│   │   └── .gitkeep
│   ├── middleware/
│   │   └── errorHandler.js# Central 404 & error handlers
│   ├── routes/
│   │   └── health.js      # Health check routing
│   ├── services/
│   │   └── .gitkeep
│   └── app.js             # Main server setup & listener
├── .env                   # Local environment variables
├── .env.example           # Environment template
├── package.json           # Scripts and dependencies
└── README.md              # Setup and usage documentation
```

## Setup Instructions

### 1. Install Dependencies

Navigate to the `backend/` directory and run:

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

And configure your local database URL:

```text
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"
```

### 3. Generate Prisma Client

To generate the Prisma Client, run:

```bash
npm run prisma:generate
```

### 4. Apply Database Migrations (When Database is Ready)

To sync your database schema with the models defined in `schema.prisma`:

```bash
npm run prisma:migrate
```

### 5. Running the Application

Start the Express development server (runs on port `5000` by default):

```bash
npm run dev
```

## Health Endpoint

- **URL**: `http://localhost:5000/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "message": "GlobeTrotter API is running"
  }
  ```
