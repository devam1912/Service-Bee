# 🐝🎃 Service Bee – Backend

Service Bee is a **backend-first MERN project** for **local service discovery, service booking, and real-time communication** between users and service providers (companies).

It follows **industry-grade backend architecture** with authentication, role-based access, admin moderation, and real-time features — layered with a **subtle Halloween / spooky theme** for presentation only.

> 👻 Serious backend. Spooky vibes.

---

## 🧠 Core Idea

- Users raise service requests  
- Companies accept and complete them  
- Admins verify and control trust  
- Real-time chat enables instant communication  
- Spooky status labels enhance UX (presentation-only)

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access (`user`, `company`, `admin`)
- Protected routes via middleware
- Separate login flows for users, companies, and admin

---

### 📅 Service Requests (Booking System)
- Users create service requests for companies
- Request lifecycle:
  - `pending` → `accepted` → `completed`
  - `rejected`
- Duplicate active requests prevented
- Companies manage only their own requests
- Requests locked after completion

Spooky aliases:
- `pending` → 👻 Haunting  
- `accepted` → 🧛 Possessed  
- `completed` → 🪦 Exorcised  

---

### 💬 Real-Time Communication
- Socket.IO powered real-time chat
- Request-based private rooms
- JWT-authenticated sockets
- Chat disabled after request completion
- Messages persisted in MongoDB

---

### 📎 Attachments & Media
- Image uploads with service requests
- Multer for multipart parsing
- Cloudinary for cloud storage
- Secure URLs stored in MongoDB
- Up to 3 images per request

---

### ⭐ Reviews & Ratings
- Reviews allowed only after request completion
- One review per request
- Company average rating updated automatically

---

### 🧑‍💼 Admin Control
- Admin login (no public registration)
- View all users, companies, and requests
- Verify companies before user visibility

---

### 🛡️ Trust & Verification
- Companies unverified by default
- Only verified companies appear to users
- Admin-controlled trust flow

---

## 🧱 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- Socket.IO
- Multer
- Cloudinary

---

## 🗂️ Project Structure

```text
Backend/
├── config/
│   ├── connectDB.js
│   └── cloudinary.js
├── constants/
│   └── spookyStatus.js
├── controllers/
│   ├── userController.js
│   ├── companyController.js
│   ├── requestController.js
│   ├── reviewController.js
│   └── adminController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   └── uploadMiddleware.js
├── models/
│   ├── userModel.js
│   ├── companyModel.js
│   ├── requestModel.js
│   ├── reviewModel.js
│   └── adminModel.js
├── routes/
│   ├── testRoute.js
│   ├── userRoutes.js
│   ├── companyRoutes.js
│   ├── requestRoutes.js
│   ├── reviewRoutes.js
│   └── adminRoutes.js
├── socket/
│   ├── auth.js
│   └── index.js
├── index.js
└── package.json


```

## 🛣️ API Routes

### 🧪 Test
| Method | Endpoint |
|------|----------|
| GET | `/api/test` |

---

### 👤 Users
| Method | Endpoint |
|------|----------|
| POST | `/api/users/register` |
| POST | `/api/users/login` |
| GET | `/api/users/profile` |

---

### 🏢 Companies
| Method | Endpoint |
|------|----------|
| POST | `/api/companies/register` |
| POST | `/api/companies/login` |
| GET | `/api/companies` |

---

### 📅 Requests
| Method | Endpoint |
|------|----------|
| POST | `/api/requests` |
| GET | `/api/requests/company` |
| PATCH | `/api/requests/:id/status` |

---

### ⭐ Reviews
| Method | Endpoint |
|------|----------|
| POST | `/api/reviews` |

---

### 🧑‍💼 Admin
| Method | Endpoint |
|------|----------|
| POST | `/api/admin/login` |
| GET | `/api/admin/users` |
| GET | `/api/admin/companies` |
| PATCH | `/api/admin/companies/:id/verify` |
| GET | `/api/admin/requests` |

---

## 🎃 Halloween Touch

Presentation-only spooky labels via `spookyStatus.js`.

| Status | Label |
|------|------|
| pending | 👻 Haunting |
| accepted | 🧛 Possessed |
| completed | 🪦 Exorcised |

---

## 🔧 Environment Variables

```env
PORT=9876
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

```
🏁 Project Status

✅ Backend complete
✅ Real-time chat
✅ Admin verification
🎃 Spooky theme
🚀 Submission ready
