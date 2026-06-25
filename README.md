# AI Career Path Simulator — Backend

NestJS + MongoDB backend for AI-driven career assessment, recommendations, roadmaps, and chat guidance.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (local or Docker)
#    Docker: docker run -d -p 27017:27017 --name mongo mongo:7

# 3. Configure environment
#    Edit .env if needed (defaults work for local dev)

# 4. Seed the database (careers + demo users)
npm run seed

# 5. Start the server
npm run start:dev
```

Server runs at `http://localhost:3000`.  
Swagger docs at `http://localhost:3000/api/docs`.

## Demo Accounts (seeded)

| Role    | Email                   | Password   |
|---------|-------------------------|------------|
| Admin   | admin@careerpath.com    | Demo123!   |
| Student | student@careerpath.com  | Demo123!   |
| Demo    | demo@careerpath.com     | Demo123!   |

## Environment Variables

| Variable                  | Required | Default                        | Description                    |
|---------------------------|----------|--------------------------------|--------------------------------|
| `PORT`                    | No       | 3000                           | API port                       |
| `MONGODB_URI`             | Yes      | mongodb://localhost:27017/...  | MongoDB connection string      |
| `JWT_SECRET`              | Yes      | —                              | JWT signing secret (min 16)    |
| `JWT_REFRESH_SECRET`      | Yes      | —                              | Refresh token secret (min 16)  |
| `FRONTEND_URL`            | No       | http://localhost:5173          | CORS origin                    |
| `GOOGLE_CLIENT_ID`        | No       | —                              | Google OAuth client ID         |
| `GOOGLE_CLIENT_SECRET`    | No       | —                              | Google OAuth client secret     |
| `OPENAI_API_KEY`          | No       | —                              | Optional — enables AI chat     |

## API Routes

All routes are prefixed with `/api`.

### Auth (`/api/auth`)

| Method | Path               | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| POST   | `/signup`           | No   | Register with email/password   |
| POST   | `/login`            | No   | Login, returns JWT tokens      |
| POST   | `/google`           | No   | Google OAuth login (token)     |
| POST   | `/refresh`          | No   | Refresh access token           |
| POST   | `/logout`           | JWT  | Invalidate tokens              |
| GET    | `/me`               | JWT  | Get current user               |
| POST   | `/change-password`  | JWT  | Change password                |
| POST   | `/forgot-password`  | No   | Request password reset         |
| POST   | `/reset-password`   | No   | Reset with token               |
| GET    | `/google`           | No   | Redirect to Google OAuth       |
| GET    | `/google/callback`  | No   | Google OAuth callback          |

### Users (`/api/users`)

| Method | Path      | Auth | Description           |
|--------|-----------|------|-----------------------|
| GET    | `/profile`| JWT  | Get profile           |
| PATCH  | `/profile`| JWT  | Update profile        |
| DELETE | `/profile`| JWT  | Delete account        |

### Assessments (`/api/assessment`)

| Method | Path      | Auth | Description                                          |
|--------|-----------|------|------------------------------------------------------|
| POST   | `/create` | JWT  | Submit assessment (auto-triggers recommendations)    |
| GET    | `/:id`    | JWT  | Get assessment by ID                                 |
| GET    | `/results`| JWT  | Get all user assessments                             |

### Careers (`/api/careers`)

| Method | Path      | Auth   | Description                |
|--------|-----------|--------|----------------------------|
| GET    | `/`       | No     | List careers (paginated)   |
| GET    | `/:id`    | No     | Get career by ID           |
| POST   | `/`       | Admin  | Create career              |
| PATCH  | `/:id`    | Admin  | Update career              |
| DELETE | `/:id`    | Admin  | Delete career              |

### Recommendations (`/api/recommendations`)

| Method | Path        | Auth | Description                              |
|--------|-------------|------|------------------------------------------|
| POST   | `/analyze`  | JWT  | Analyze skills, get career matches       |
| GET    | `/history`  | JWT  | Paginated analysis history               |
| GET    | `/history/:id` | JWT | Get analysis result by ID              |
| GET    | `/careers`  | JWT  | List enriched career profiles            |
| GET    | `/prompts`  | JWT  | Suggested chat prompts                   |

### Roadmaps (`/api/roadmaps`)

| Method | Path     | Auth | Description                      |
|--------|----------|------|----------------------------------|
| GET    | `/`      | JWT  | List user roadmaps               |
| GET    | `/:id`   | JWT  | Get roadmap by ID                |
| POST   | `/save`  | JWT  | Create or update roadmap         |

### Chat (`/api/chat`)

| Method | Path       | Auth | Description                  |
|--------|------------|------|------------------------------|
| POST   | `/message` | JWT  | Send message, get AI reply   |
| GET    | `/history` | JWT  | List conversations           |
| GET    | `/:id`     | JWT  | Get chat with messages       |
| DELETE | `/:id`     | JWT  | Delete a chat                |

### Dashboard (`/api/dashboard`)

| Method | Path              | Auth | Description                        |
|--------|--------------------|------|------------------------------------|
| GET    | `/stats`           | JWT  | Aggregate user stats               |
| GET    | `/activity`        | JWT  | Recent activity feed               |
| GET    | `/recommendations` | JWT  | Personalized recommendations       |

### Health (`/api/health`)

| Method | Path       | Auth | Description                    |
|--------|------------|------|--------------------------------|
| GET    | `/database`| No   | MongoDB connection status      |

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Paginated responses:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [...],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

## User Flow

1. **Register** → `POST /api/auth/signup`
2. **Login** → `POST /api/auth/login` (gets JWT tokens)
3. **Take Assessment** → `POST /api/assessment/create` (auto-generates recommendations)
4. **View Recommendations** → `GET /api/recommendations/history`
5. **Create Roadmap** → `POST /api/roadmaps/save`
6. **Chat for Guidance** → `POST /api/chat/message`

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** NestJS 10
- **Database:** MongoDB 7+ with Mongoose 8
- **Auth:** JWT (access + refresh tokens), Google OAuth 2.0
- **Validation:** class-validator + class-transformer
- **Docs:** Swagger / OpenAPI 3.0
- **Password:** bcrypt

## Deployment

This backend is ready for deployment on Render, Railway, or Fly.io:

```bash
# Build
npm run build

# Start production
npm run start:prod
```

Make sure to set `NODE_ENV=production` and configure all environment variables in your hosting dashboard.
