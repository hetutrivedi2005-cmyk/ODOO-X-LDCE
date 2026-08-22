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

### Trip Management Endpoints

All trip management endpoints are located under `/api/trips` and require authentication.

#### 1. Create Trip
- **URL**: `/api/trips`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Europe Trip",
    "description": "My summer Europe trip",
    "startDate": "2026-09-01",
    "endDate": "2026-09-15",
    "coverImage": "https://example.com/cover.jpg"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "trip": {
        "id": "trip-uuid-string",
        "name": "Europe Trip",
        "description": "My summer Europe trip",
        "startDate": "2026-09-01T00:00:00.000Z",
        "endDate": "2026-09-15T00:00:00.000Z",
        "coverImage": "https://example.com/cover.jpg",
        "userId": "user-uuid-string",
        "createdAt": "2026-08-22T06:00:00.000Z",
        "updatedAt": "2026-08-22T06:00:00.000Z"
      }
    }
  }
  ```

#### 2. Get My Trips
- **URL**: `/api/trips`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "trips": [
        {
          "id": "trip-uuid-string",
          "name": "Europe Trip",
          "description": "My summer Europe trip",
          "startDate": "2026-09-01T00:00:00.000Z",
          "endDate": "2026-09-15T00:00:00.000Z",
          "coverImage": "https://example.com/cover.jpg"
        }
      ]
    }
  }
  ```

#### 3. Get Single Trip (Details with Stops & Cities)
- **URL**: `/api/trips/:id`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "trip": {
        "id": "trip-uuid-string",
        "name": "Europe Trip",
        "description": "My summer Europe trip",
        "startDate": "2026-09-01T00:00:00.000Z",
        "endDate": "2026-09-15T00:00:00.000Z",
        "coverImage": "https://example.com/cover.jpg",
        "stops": [
          {
            "id": "stop-uuid-string",
            "tripId": "trip-uuid-string",
            "cityId": "city-uuid-string",
            "startDate": "2026-09-03T00:00:00.000Z",
            "endDate": "2026-09-05T00:00:00.000Z",
            "order": 1,
            "city": {
              "id": "city-uuid-string",
              "name": "Paris",
              "country": "France",
              "lat": 48.8566,
              "lng": 2.3522
            }
          }
        ]
      }
    }
  }
  ```

#### 4. Update Trip
- **URL**: `/api/trips/:id`
- **Method**: `PUT`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body** (all fields optional):
  ```json
  {
    "name": "Updated Europe Trip",
    "description": "New description"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "trip": {
        "id": "trip-uuid-string",
        "name": "Updated Europe Trip",
        "description": "New description",
        "startDate": "2026-09-01T00:00:00.000Z",
        "endDate": "2026-09-15T00:00:00.000Z"
      }
    }
  }
  ```

#### 5. Delete Trip
- **URL**: `/api/trips/:id`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Trip deleted successfully"
  }
  ```

#### 6. Add City Stop to Trip
- **URL**: `/api/trips/:tripId/stops`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "cityId": "city-uuid-string",
    "startDate": "2026-09-03",
    "endDate": "2026-09-05"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "stop": {
        "id": "stop-uuid-string",
        "tripId": "trip-uuid-string",
        "cityId": "city-uuid-string",
        "startDate": "2026-09-03T00:00:00.000Z",
        "endDate": "2026-09-05T00:00:00.000Z",
        "order": 1,
        "createdAt": "2026-08-22T06:00:00.000Z",
        "updatedAt": "2026-08-22T06:00:00.000Z"
      }
    }
  }
  ```

#### 7. Remove City Stop from Trip
- **URL**: `/api/trips/:tripId/stops/:stopId`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "City removed from trip"
  }
  ```

### Itinerary Planning Endpoints

All itinerary endpoints are located under `/api/trips/:tripId/itinerary` and require authentication.

#### 1. Create Itinerary Item
- **URL**: `/api/trips/:tripId/itinerary`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "tripStopId": "stop-uuid-string",
    "title": "Visit Eiffel Tower",
    "description": "Morning sightseeing",
    "date": "2026-09-10",
    "startTime": "09:00",
    "endTime": "11:00",
    "location": "Eiffel Tower"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "item": {
        "id": "item-uuid-string",
        "tripId": "trip-uuid-string",
        "tripStopId": "stop-uuid-string",
        "title": "Visit Eiffel Tower",
        "description": "Morning sightseeing",
        "date": "2026-09-10T00:00:00.000Z",
        "startTime": "09:00",
        "endTime": "11:00",
        "location": "Eiffel Tower",
        "order": 1,
        "createdAt": "2026-08-22T07:00:00.000Z",
        "updatedAt": "2026-08-22T07:00:00.000Z"
      }
    }
  }
  ```

#### 2. Get Complete Itinerary
- **URL**: `/api/trips/:tripId/itinerary`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "itinerary": [
        {
          "date": "2026-09-10",
          "items": [
            {
              "id": "item-uuid-string",
              "tripId": "trip-uuid-string",
              "tripStopId": "stop-uuid-string",
              "title": "Visit Eiffel Tower",
              "description": "Morning sightseeing",
              "date": "2026-09-10T00:00:00.000Z",
              "startTime": "09:00",
              "endTime": "11:00",
              "location": "Eiffel Tower",
              "order": 1,
              "tripStop": {
                "id": "stop-uuid-string",
                "city": {
                  "id": "city-uuid-string",
                  "name": "Paris",
                  "country": "France"
                }
              }
            }
          ]
        }
      ]
    }
  }
  ```

#### 3. Update Itinerary Item
- **URL**: `/api/trips/:tripId/itinerary/:itemId`
- **Method**: `PUT`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "title": "Eiffel Tower Sunset Tour",
    "startTime": "18:00",
    "endTime": "20:00"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "item": {
        "id": "item-uuid-string",
        "title": "Eiffel Tower Sunset Tour",
        "startTime": "18:00",
        "endTime": "20:00",
        "order": 1
      }
    }
  }
  ```

#### 4. Delete Itinerary Item
- **URL**: `/api/trips/:tripId/itinerary/:itemId`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Itinerary item deleted successfully"
  }
  ```
