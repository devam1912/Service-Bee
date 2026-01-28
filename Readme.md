# 🐝 Service Bee – Backend

Service Bee Backend is a production-ready Node.js + Express + MongoDB API that powers the Service Bee platform. It handles authentication, service requests, companies, reviews, payments, and real-time global chat using Socket.IO.

## 🚀 Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Socket.IO (Real-time chat & updates)
* Cloudinary (file uploads)
* Razorpay (payments)
* Security Middlewares
   * Helmet
   * CORS
   * Rate Limiting
   * XSS Protection

## 📂 Folder Structure

```
Backend/
├── config/
│   ├── connectDB.js
│   └── cloudinary.js
├── controllers/
│   ├── userController.js
│   ├── requestController.js
│   ├── paymentController.js
│   └── ...
├── middleware/
│   ├── authMiddleware.js
│   ├── securityMiddleware.js
│   └── socketAuth.js
├── models/
│   ├── UserModel.js
│   ├── CompanyModel.js
│   ├── RequestModel.js
│   └── GlobalMessageModel.js
├── routes/
│   ├── userRoutes.js
│   ├── requestRoutes.js
│   ├── globalChatRoutes.js
│   └── ...
├── socket/
│   └── index.js
├── index.js
├── .env
├── package.json
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file inside `Backend/`:

```env
PORT=9876
MONGODB_URL=your_mongodb_connection_string

JWT_SECRET=servicebee_secret_key
JWT_EXPIRES=7d

CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

## 🛠️ Installation & Setup

```bash
# Go to backend folder
cd Backend

# Install dependencies
npm install

# Start development server
npm run dev
```

Server will run on:

```
http://localhost:9876
```

## Base URL (dev):

```
http://localhost:9876
```

## 🔐 Authentication

### 👤 User Auth

Base: `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a user |
| POST | `/login` | Login user |
| GET | `/profile` | Get logged-in user profile (JWT required) |

Auth required: `Bearer <token>`

### 🏢 Company Auth

Base: `/api/companies`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get verified companies (ranked by trustScore) |
| POST | `/register` | Register company |
| POST | `/login` | Login company |

### 👮 Admin Auth

Base: `/api/admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin login |

## 📝 Service Requests

Base: `/api/requests` (Auth required – User or Company)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create service request (user only) |
| GET | `/company` | Get requests for company |
| PATCH | `/:requestId/status` | Update request status |

**Status flow:**

```
pending → accepted → completed
pending → rejected
```

## ⭐ Reviews

Base: `/api/reviews`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create review (user only) |

## 📜 Terms & Conditions

Base: `/api/terms`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Check terms acceptance |
| POST | `/accept` | Accept terms |

## 💳 Payments (Razorpay)

Base: `/api/payments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify` | Verify payment |

## 🌍 Global Chat (User Side)

Base: `/api/global-chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | Get global messages |
| POST | `/report` | Report a message |

Protected + rate limited

## 🛡️ Global Chat (Admin Moderation)

Base: `/api/admin/global-chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports` | Get reported messages |
| PATCH | `/hide` | Hide a message |
| PATCH | `/mute` | Mute user/company |
| PATCH | `/ban` | Ban actor |
| PATCH | `/banned-words` | Update banned words list |

## 👮 Admin Dashboard APIs

Base: `/api/admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/companies` | Get all companies |
| PATCH | `/companies/:id/verify` | Verify company |
| GET | `/requests` | Get all requests |

## 🧪 Test Route

Base: `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test` | Health check |

**Response:**

```json
{ "message": "Servie Bee" }
```

## 📦 Core Features

### 👤 Users
* Register & Login (JWT)
* Terms acceptance enforcement

### 🏢 Companies
* Company profiles
* Trust score calculation

### 📝 Service Requests
* Booking with slot capacity
* Status lifecycle:
   * pending → accepted → completed
   * rejected

### ⭐ Reviews
* User reviews & ratings

### 💳 Payments
* Razorpay integration
* Booking confirmation checks

### 🌍 Global Chat
* Real-time messaging with Socket.IO
* Messages stored in MongoDB
* Broadcast to all connected users

## 🔌 Socket.IO (Realtime)

Socket server runs on same port as backend.

**Events (client → server):**
* `join:global`
* `sendGlobalMessage`

**Events (server → client):**
* `global:newMessage`
* `request:statusUpdated`

## 🔒 Security

Enabled via `applySecurity()`:
* Helmet headers
* CORS
* Rate limiting
* XSS protection
* JWT-based auth

## 📌 Notes

* Backend is fully independent of frontend
* Frontend can be rebuilt or replaced without affecting backend
* Designed for production-grade scaling

## 👨‍💻 Author

**Devam**  
Service Bee – Serious backend. Spooky vibes. 👻🐝
