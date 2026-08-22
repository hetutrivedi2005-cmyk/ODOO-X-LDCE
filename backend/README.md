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

## API Endpoints

### Health Endpoint

- **URL**: `http://localhost:5000/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "message": "GlobeTrotter API is running"
  }
  ```

### Authentication Endpoints

All authentication endpoints are located under `/api/auth`.

#### 1. Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-uuid-string",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "JWT_TOKEN_STRING"
    }
  }
  ```

#### 2. Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-uuid-string",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "JWT_TOKEN_STRING"
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

#### 3. Current User Profile
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-uuid-string",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
  ```
- **Error Response (401/400 Unauthorized/Bad Token)**:
  ```json
  {
    "success": false,
    "message": "Authentication required"
  }
  ```
