# API Documentation - Community Service Platform

Complete CRUD operations documentation for all endpoints.

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Routes (`/api/auth`)

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"  // Optional: "student" or "organizer"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "User created successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "hoursCompleted": 0
    }
  }
  ```

### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "hoursCompleted": 10
    }
  }
  ```

---

## 📅 Events Routes (`/api/events`)

### Get All Events
- **GET** `/events`
- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "event_id",
        "title": "Beach Cleanup",
        "description": "Clean up the local beach",
        "date": "2024-01-15",
        "time": "09:00",
        "location": "Main Beach",
        "maxVolunteers": 20,
        "category": "environment",
        "status": "upcoming",
        "organizerId": "organizer_id",
        "organizer": "Jane Smith",
        "registeredCount": 5,
        "isFull": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Single Event
- **GET** `/events/:id`
- **Response:** `200 OK`
  ```json
  {
    "data": {
      "id": "event_id",
      "title": "Beach Cleanup",
      "description": "Clean up the local beach",
      "date": "2024-01-15",
      "time": "09:00",
      "location": "Main Beach",
      "maxVolunteers": 20,
      "category": "environment",
      "status": "upcoming",
      "organizerId": "organizer_id",
      "organizer": {
        "id": "organizer_id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "registeredUsers": [],
      "registeredCount": 0,
      "isFull": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Create Event
- **POST** `/events`
- **Body:**
  ```json
  {
    "title": "Beach Cleanup",
    "description": "Clean up the local beach",
    "date": "2024-01-15",
    "time": "09:00",
    "location": "Main Beach",
    "maxVolunteers": 20,
    "organizerId": "organizer_id",
    "category": "environment"
  }
  ```
- **Response:** `201 Created`

### Update Event
- **PUT** `/events/:id`
- **Body:**
  ```json
  {
    "title": "Updated Beach Cleanup",
    "description": "Updated description",
    "date": "2024-01-16",
    "time": "10:00",
    "location": "North Beach",
    "maxVolunteers": 25,
    "category": "environment",
    "status": "upcoming"
  }
  ```
- **Response:** `200 OK`

### Delete Event
- **DELETE** `/events/:id`
- **Response:** `200 OK`
  ```json
  {
    "message": "Event deleted successfully"
  }
  ```

### Register for Event
- **POST** `/events/:id/register`
- **Body:**
  ```json
  {
    "userId": "user_id"
  }
  ```
- **Response:** `200 OK`

### Cancel Registration
- **DELETE** `/events/:id/register/:userId`
- **Response:** `200 OK`
  ```json
  {
    "message": "Registration cancelled successfully"
  }
  ```

### Update Registration Status
- **PUT** `/events/:id/register/:userId`
- **Body:**
  ```json
  {
    "status": "attended"
  }
  ```
- **Response:** `200 OK`

### Get Event Registrations
- **GET** `/events/:id/registrations`
- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "registration_id",
        "userId": "user_id",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "status": "registered",
        "registeredAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

---

## 👥 Users Routes (`/api/users`)

### Get All Users
- **GET** `/users`
- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "phone": "123-456-7890",
        "department": "Computer Science",
        "hoursCompleted": 15,
        "eventsAttended": 3,
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Single User Profile
- **GET** `/users/:id`
- **Response:** `200 OK`
  ```json
  {
    "data": {
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "hoursCompleted": 15,
        "eventsAttended": 3,
        "joinedAt": "2024-01-01T00:00:00.000Z"
      },
      "registeredEvents": [],
      "attendance": []
    }
  }
  ```

### Update User Profile
- **PUT** `/users/:id`
- **Body:**
  ```json
  {
    "name": "John Smith",
    "phone": "123-456-7890",
    "department": "Computer Science"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Profile updated",
    "user": {
      "id": "user_id",
      "name": "John Smith",
      "email": "john@example.com",
      "role": "student",
      "phone": "123-456-7890",
      "department": "Computer Science"
    }
  }
  ```

### Delete User
- **DELETE** `/users/:id`
- **Response:** `200 OK`
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

### Get Leaderboard
- **GET** `/users/leaderboard/top`
- **Response:** `200 OK`
  ```json
  [
    {
      "id": "user_id",
      "name": "John Doe",
      "hoursCompleted": 25,
      "eventsAttended": 5,
      "role": "student"
    }
  ]
  ```

---

## ✅ Attendance Routes (`/api/attendance`)

### Get All Attendance Records
- **GET** `/attendance`
- **Query Parameters:**
  - `userId` (optional): Filter by user ID
  - `eventId` (optional): Filter by event ID
  - `status` (optional): Filter by status (checked-in, completed)
- **Example:** `/attendance?userId=123&status=completed`
- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "attendance_id",
        "userId": "user_id",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "eventId": "event_id",
        "eventTitle": "Beach Cleanup",
        "eventDate": "2024-01-15",
        "eventLocation": "Main Beach",
        "checkInTime": "2024-01-15T09:00:00.000Z",
        "checkOutTime": "2024-01-15T12:00:00.000Z",
        "hours": 3,
        "status": "completed"
      }
    ]
  }
  ```

### Get Single Attendance Record
- **GET** `/attendance/:id`
- **Response:** `200 OK`

### Check In to Event
- **POST** `/attendance/check-in`
- **Body:**
  ```json
  {
    "userId": "user_id",
    "eventId": "event_id",
    "checkInTime": "2024-01-15T09:00:00.000Z"  // Optional
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Successfully checked in",
    "attendance": {
      "id": "attendance_id",
      "userId": "user_id",
      "eventId": "event_id",
      "checkInTime": "2024-01-15T09:00:00.000Z",
      "checkOutTime": null,
      "hours": 0,
      "status": "checked-in"
    }
  }
  ```

### Check Out from Event
- **POST** `/attendance/check-out`
- **Body:**
  ```json
  {
    "userId": "user_id",
    "eventId": "event_id",
    "checkOutTime": "2024-01-15T12:00:00.000Z"  // Optional
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Successfully checked out",
    "hours": 3,
    "attendance": {
      "id": "attendance_id",
      "userId": "user_id",
      "eventId": "event_id",
      "checkInTime": "2024-01-15T09:00:00.000Z",
      "checkOutTime": "2024-01-15T12:00:00.000Z",
      "hours": 3,
      "status": "completed"
    }
  }
  ```

### Update Attendance Record
- **PUT** `/attendance/:id`
- **Body:**
  ```json
  {
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "checkOutTime": "2024-01-15T12:00:00.000Z",
    "status": "completed"
  }
  ```
- **Response:** `200 OK`

### Delete Attendance Record
- **DELETE** `/attendance/:id`
- **Response:** `200 OK`
  ```json
  {
    "message": "Attendance record deleted successfully"
  }
  ```

---

## 📝 Registrations Routes (`/api/registrations`)

### Get All Registrations
- **GET** `/registrations`
- **Query Parameters:**
  - `userId` (optional): Filter by user ID
  - `eventId` (optional): Filter by event ID
  - `status` (optional): Filter by status (registered, attended, cancelled)
- **Example:** `/registrations?eventId=123&status=registered`
- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "registration_id",
        "userId": "user_id",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "eventId": "event_id",
        "eventTitle": "Beach Cleanup",
        "eventDate": "2024-01-15",
        "eventLocation": "Main Beach",
        "status": "registered",
        "registeredAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Single Registration
- **GET** `/registrations/:id`
- **Response:** `200 OK`

### Create Registration
- **POST** `/registrations`
- **Body:**
  ```json
  {
    "userId": "user_id",
    "eventId": "event_id"
  }
  ```
- **Response:** `201 Created`

### Update Registration
- **PUT** `/registrations/:id`
- **Body:**
  ```json
  {
    "status": "attended"
  }
  ```
- **Response:** `200 OK`

### Delete Registration
- **DELETE** `/registrations/:id`
- **Response:** `200 OK`
  ```json
  {
    "message": "Registration cancelled successfully"
  }
  ```

---

## 📊 Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔍 Common Query Parameters

Many endpoints support filtering via query parameters:

- `userId` - Filter by user ID
- `eventId` - Filter by event ID
- `status` - Filter by status

Example: `/api/registrations?userId=123&status=registered`

---

## 📋 Data Models

### Event Categories
- `education`
- `environment`
- `health`
- `community`
- `other`

### Event Status
- `upcoming`
- `ongoing`
- `completed`
- `cancelled`

### Registration Status
- `registered`
- `attended`
- `cancelled`

### Attendance Status
- `checked-in`
- `completed`

### User Roles
- `student`
- `organizer`
- `admin`

---

## 🎯 Complete CRUD Operations Summary

### Events
✅ CREATE - POST `/events`
✅ READ - GET `/events` & GET `/events/:id`
✅ UPDATE - PUT `/events/:id`
✅ DELETE - DELETE `/events/:id`

### Users
✅ CREATE - POST `/auth/register`
✅ READ - GET `/users` & GET `/users/:id`
✅ UPDATE - PUT `/users/:id`
✅ DELETE - DELETE `/users/:id`

### Attendance
✅ CREATE - POST `/attendance/check-in`
✅ READ - GET `/attendance` & GET `/attendance/:id`
✅ UPDATE - PUT `/attendance/:id`
✅ DELETE - DELETE `/attendance/:id`

### Registrations
✅ CREATE - POST `/registrations`
✅ READ - GET `/registrations` & GET `/registrations/:id`
✅ UPDATE - PUT `/registrations/:id`
✅ DELETE - DELETE `/registrations/:id`

---

## 🔗 Related Operations

### Registration Operations via Events Route
- POST `/events/:id/register` - Register for event
- DELETE `/events/:id/register/:userId` - Cancel registration
- PUT `/events/:id/register/:userId` - Update registration status
- GET `/events/:id/registrations` - Get event registrations

---

**All CRUD operations are now fully implemented and documented!** 🎉
