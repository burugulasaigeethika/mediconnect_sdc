# MediConnect - Comprehensive Healthcare Platform

A full-featured MERN stack healthcare platform for online consultations, appointment management, prescription processing, and pharmacy services with role-based dashboards.

## 🌟 Features

### For Patients 👤
- **Account Management**: Multi-step registration with health profile
- **Doctor Discovery**: Search doctors by name, specialization, or symptoms
- **Appointments**: Book, track, and manage appointments
- **Prescription Upload**: Submit prescriptions directly to pharmacy
- **Order Tracking**: View order status from upload to delivery
- **Payment Integration**: Secure payment processing for approved orders
- **Notifications**: Real-time alerts for appointment updates and order status
- **Medical History**: Access previous prescription orders and health records

### For Doctors 👨‍⚕️
- **Dashboard**: View upcoming appointments and statistics
- **Schedule Management**: Set weekly availability and time slots
- **Appointment Management**: Accept/reject appointment requests
- **Patient Management**: View and manage patient list
- **Profile Management**: Update consultation fees, specialization, and contact info
- **Notifications**: Get alerted for new appointment requests

### For Pharmacists 💊
- **Prescription Review**: Review uploaded prescriptions with PDF/Image viewer
- **Medicine Search**: Search and add medicines to orders
- **Cart Management**: Build orders with quantity controls
- **Order Approval**: Approve orders with pricing or reject with reason
- **Status Updates**: Track orders through processing to dispatch
- **Inventory**: Manage medicine stock levels

### For Administrators 🔐
- **User Management**: View and manage all users (patients, doctors, pharmacists)
- **Doctor Approvals**: Review and approve/reject new doctor registrations
- **Analytics Dashboard**: View platform statistics and user counts
- **System Monitoring**: Track appointments and transactions

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Material UI** - Component library
- **Socket.io Client** - Real-time features

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Socket.io** - WebSockets

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)
- **SMTP Credentials** (for email notifications)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd mediconnect2

# Create .env file in backend directory
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Seed sample data (optional)
npm run seed

# Start server
npm start
```

Backend runs on: http://localhost:5000

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on: http://localhost:3000

## 🔧 Configuration

### Environment Variables

Create `backend/.env` file with these variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mediconnect

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Email (Gmail example)
ENABLE_EMAIL=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Gmail Setup for Email Notifications

1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

## 📁 Project Structure

```
mediconnect2/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, etc.
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utilities (file upload, etc.)
│   ├── uploads/         # User-uploaded files
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # React Context (Auth, Socket)
│       ├── pages/       # Route pages
│       └── App.jsx      # Main app component
└── docker-compose.yml
```

## 🗂️ Key Models

- **User** - Patient and pharmacist accounts
- **Doctor** - Doctor profiles with status (pending/active/rejected)
- **Appointment** - Appointment bookings and status
- **Order** - Unified prescription orders
- **Medicine** - Pharmacy inventory
- **Cart** - Temporary cart for prescription review
- **Notification** - User notifications
- **DoctorPatient** - Doctor-patient relationships

## 🔐 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Role-Based Access Control (RBAC)** - Protected routes per role
- **Password Hashing** - bcrypt with salt rounds
- **Input Sanitization** - NoSQL injection prevention
- **Rate Limiting** - API protection
- **Helmet** - Security headers
- **CORS** - Configured origins

## 🧪 Testing

Static code analysis has been performed. For dynamic testing:

```bash
# Backend tests (if available)
cd backend
npm test

# Frontend tests (if available)
cd frontend
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - Patient login
- `POST /api/doctors/login` - Doctor login
- `POST /api/pharmacists/login` - Pharmacist login
- `POST /api/admin/login` - Admin login

### Patient Endpoints
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/prescription-orders/upload-prescription` - Upload prescription
- `GET /api/prescription-orders/patient/my-orders` - Get orders

### Doctor Endpoints
- `GET /api/doctors` - Search doctors (public)
- `GET /api/doctors/schedule` - Get schedule
- `PUT /api/doctors/schedule` - Update schedule
- `GET /api/appointments/my-appointments` - Get appointments

### Pharmacist Endpoints
- `GET /api/prescription-orders/pending` - Get pending orders
- `PATCH /api/prescription-orders/:orderId/approve` - Approve order
- `GET /api/prescription-orders/medicines/search` - Search medicines

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/doctors/pending` - Get pending doctors
- `PUT /api/admin/doctors/:id/approve` - Approve doctor
- `GET /api/admin/analytics` - Get statistics

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Verify MongoDB is running
mongod --version

# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (Mac/Linux)
sudo systemctl start mongod
```

### Port Already in Use

```bash
# Windows
npx kill-port 5000
npx kill-port 3000

# Linux/Mac
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Environment Issues

If experiencing Node.js command issues:
1. Verify Node installation: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

## 🚢 Deployment

### Docker Production

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Serve frontend build with nginx or Express static
4. Use PM2 for backend: `pm2 start server.js`

## 🎯 Roadmap

- [ ] Video consultation integration
- [ ] Advanced appointment scheduling
- [ ] Medicine recommendation system
- [ ] Mobile app (React Native)
- [ ] Automated testing suite
- [ ] Payment gateway integration (Stripe/Razorpay)

## 👥 Default Roles

After seeding or manual creation:

**Admin**
- Email: admin@mediconnect.com
- Password: admin123

**Doctor**
- Email: doctor@test.com
- Password: doctor123

**Patient**
- Email: patient@test.com
- Password: patient123

**Pharmacist**
- Email: pharmacist@test.com
- Password: pharmacist123

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 👨‍💻 Maintainers

**Sai Geethika Burgula**  
GitHub: [@burgulasaigeethika-creator](https://github.com/burgulasaigeethika-creator)

---

**Need Support?** Open an issue on GitHub or contact the maintainers.