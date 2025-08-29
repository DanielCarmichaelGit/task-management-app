# Task Manager Backend API - Simple Reference

## Base URLs
- **Development**: `http://localhost:3021`
- **Production**: `https://tast-manager-4dd398dea15c.herokuapp.com/`

## Authentication
All protected endpoints need this header:
Authorization: Bearer <jwt_token>


---

## Endpoints

### Auth Routes
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Task Routes
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Change status

---

## Request Bodies

### POST /api/auth/register
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "user_metadata": {
    "full_name": "John Doe"
  }
}
```

### POST /api/auth/login
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### PUT /api/auth/profile
**Body:**
```json
{
  "user_metadata": {
    "full_name": "John Doe Updated",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

### POST /api/tasks
**Body:**
```json
{
  "title": "Complete project proposal",
  "description": "Write up the technical requirements and timeline",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-01-15T23:59:59Z"
}
```

### PUT /api/tasks/:id
**Body:** (same as POST, all fields optional)
```json
{
  "title": "Updated task title",
  "status": "in_progress"
}
```

### PATCH /api/tasks/:id/status
**Body:**
```json
{
  "status": "completed"
}
```

---

## Task Status Options
- `pending`, `in_progress`, `completed`, `cancelled`

## Task Priority Options
- `low`, `medium`, `high`

---

## Response Format
All endpoints return:
```json
{
  "message": "Success message",
  "user": { ... },
  "session": { ... }
}
```

**Error responses:**
```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

---

## How to Use

1. **Register/Login** to get JWT token
2. **Store token** in localStorage or state
3. **Include token** in Authorization header for all task requests
4. **Use token** for all protected routes