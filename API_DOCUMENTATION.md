# MediConnect API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "role": "patient"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent to your email",
  "email": "j***@example.com"
}
```

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

---

## Doctor Endpoints

### Get All Doctors
```http
GET /doctors
```

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `search` (optional): Search by name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "doctors": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Smith",
      "specialization": "Cardiology",
      "consultationFee": 500,
      "rating": 4.5,
      "location": "New York",
      "profileImage": "https://..."
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

### Get Doctor by ID
```http
GET /doctors/:id
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dr. Smith",
  "specialization": "Cardiology",
  "consultationFee": 500,
  "experience": "15 years",
  "rating": 4.5,
  "location": "New York",
  "weeklySchedule": [...]
}
```

---

## Appointment Endpoints

### Book Appointment (Patient)
```http
POST /patient/appointments
```
**Authentication Required**

**Request Body (Direct Booking):**
```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "date": "2024-12-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "symptoms": "Chest pain",
  "consultationType": "in-person"
}
```

**Request Body (Slot Booking):**
```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "slotId": "507f1f77bcf86cd799439012",
  "symptoms": "Chest pain"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Appointment booked successfully! The doctor will review your request.",
  "appointment": {
    "_id": "507f1f77bcf86cd799439013",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-12-15T10:00:00.000Z",
    "timeSlot": "10:00 - 10:30",
    "status": "Pending",
    "consultationType": "in-person"
  }
}
```

### Get My Appointments
```http
GET /appointments/my
```
**Authentication Required**

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "doctorId": {
      "name": "Dr. Smith",
      "specialization": "Cardiology"
    },
    "appointmentDate": "2024-12-15T10:00:00.000Z",
    "timeSlot": "10:00 - 10:30",
    "status": "Pending"
  }
]
```

### Cancel Appointment
```http
PATCH /appointments/:id/cancel
```
**Authentication Required**

**Response:** `200 OK`
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": {...}
}
```

---

## Doctor Dashboard Endpoints

### Get Doctor's Patients
```http
GET /doctor/patients
```
**Authentication Required (Doctor Role)**

**Query Parameters:**
- `status` (optional): Filter by status (new, pending, accepted, rejected)
- `search` (optional): Search by patient name/email

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "lastVisit": "2024-12-01T10:00:00.000Z",
    "status": "new"
  }
]
```

### Accept Patient
```http
PATCH /doctor/patients/:patientId/accept
```
**Authentication Required (Doctor Role)**

**Response:** `200 OK`
```json
{
  "message": "Patient accepted successfully",
  "status": "accepted"
}
```

### Reject Patient
```http
PATCH /doctor/patients/:patientId/reject
```
**Authentication Required (Doctor Role)**

**Response:** `200 OK`
```json
{
  "message": "Patient rejected successfully",
  "status": "rejected"
}
```

### Get Weekly Schedule
```http
GET /doctor/weekly-schedule
```
**Authentication Required (Doctor Role)**

**Response:** `200 OK`
```json
[
  {
    "day": "Monday",
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true
  },
  ...
]
```

### Update Weekly Schedule
```http
PUT /doctor/weekly-schedule
```
**Authentication Required (Doctor Role)**

**Request Body:**
```json
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    },
    ...
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Weekly schedule updated successfully",
  "weeklySchedule": [...]
}
```

---

## Medicine & Pharmacy Endpoints

### Get Medicines
```http
GET /medicines
```

**Query Parameters:**
- `search` (optional): Search by medicine name
- `category` (optional): Filter by category
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`
```json
{
  "medicines": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Paracetamol",
      "category": "Pain Relief",
      "price": 50,
      "manufacturer": "ABC Pharma",
      "stock": 100
    }
  ],
  "totalPages": 10,
  "currentPage": 1
}
```

### Place Order
```http
POST /pharmacy/orders
```
**Authentication Required**

**Request Body:**
```json
{
  "items": [
    {
      "medicineId": "507f1f77bcf86cd799439015",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439016",
    "orderNumber": "ORD-20241201-001",
    "totalAmount": 100,
    "status": "Pending"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Please login to access this resource"
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "status": "error",
  "message": "Too many requests, please try again later",
  "retryAfter": 900
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Something went wrong on the server"
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes
- **Public endpoints**: 300 requests per 15 minutes

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-12-01T10:15:00.000Z
```

---

## Pagination

List endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response format:
```json
{
  "data": [...],
  "totalPages": 10,
  "currentPage": 1,
  "totalItems": 100
}
```
