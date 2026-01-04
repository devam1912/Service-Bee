# 🐝 Service Bee – Backend

Service Bee is a backend-first MERN project designed for local service discovery, issue reporting, and service request management between users and service providers (companies).

This repository currently focuses on a **production-ready backend architecture** with authentication, service requests, file uploads, reviews, and cloud media storage.

---

## 🚀 Features Implemented

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (`user`, `company`)
- Protected routes using middleware

---

### 🧾 Service Requests
- Users can create service requests for companies
- Request lifecycle:
  - `pending` → `accepted` → `completed`
  - `rejected`
- Duplicate active requests are prevented
- Companies can view only their incoming requests
- Companies can update request status with validation rules

---

### 📎 Image Attachments
- Optional image uploads with service requests
- File parsing using Multer (`multipart/form-data`)
- Images uploaded to Cloudinary
- Only secure Cloudinary URLs stored in MongoDB
- Multiple images supported per request

---

### ⭐ Reviews & Ratings
- Reviews allowed only for completed requests
- One review per request
- Ratings automatically update company average rating

---

## 🧱 Tech Stack (Backend)

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (Authentication)
- Multer (File upload parsing)
- Cloudinary (Cloud image storage)

---

## 🗂️ Project Structure (Backend)

```text
Backend/
├── config/
│   └── cloudinary.js
│
├── controllers/
│   ├── requestController.js
│   ├── reviewController.js
│   └── companyController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
│
├── models/
│   ├── userModel.js
│   ├── companyModel.js
│   ├── requestModel.js
│   └── reviewModel.js
│
├── routes/
│   ├── userRoutes.js
│   ├── companyRoutes.js
│   ├── requestRoutes.js
│   └── reviewRoutes.js
│
├── index.js
└── package.json
```

🔧 Environment Variables

Create a .env file in the Backend directory with the following:

PORT=9876
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret


⚠️ Never commit .env files to GitHub.

🧪 API Testing

APIs tested using Postman

Authorization via header:

Authorization: Bearer <TOKEN>


File uploads use multipart/form-data

Image field name: attachments

🛣️ Roadmap

Real-time chat between users and companies (Socket.IO)

Message persistence and chat history

Frontend integration (React)

Activity timeline for service requests

📌 Development Notes

Backend built with clean architecture principles

Media handling is cloud-ready and storage-agnostic

Business logic separated from middleware

Designed for real-world scalability

👨‍💻 Author

Built as part of a hands-on MERN stack learning project focused on industry-level backend development.

📅 Daily Updates

This README is updated incrementally as new features are added.
