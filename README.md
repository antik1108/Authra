# 🎓 Authra - University Parcel Management System

A comprehensive full-stack web application designed to streamline parcel management for universities. Authra provides a complete solution for tracking, managing, and coordinating parcel deliveries within university campuses, supporting multiple institutions with role-based access control.

## ✨ Features

### 🏛️ Multi-University Support
- **University Registration**: Complete institutional onboarding with verification
- **Data Isolation**: Secure multi-tenant architecture ensuring university data privacy
- **Admin Dashboard**: Comprehensive university management interface

### 👥 Role-Based Access Control
- **Students**: Track personal parcels, confirm placement for pickup
- **Staff**: Register new parcels, manage parcel status, search students
- **Wardens**: Approve students and staff, oversee hostel operations
- **Admins**: Approve users, manage university operations
- **University Admins**: Full institutional control and analytics

### 📦 Advanced Parcel Management
- **Smart Tracking**: Unique tracking numbers with QR code support
- **Photo Documentation**: Visual confirmation with parcel photos
- **Status Tracking**: Real-time updates from arrival to pickup
- **Pickup Codes**: Secure parcel collection system
- **Multiple Parcel Types**: Support for packages, letters, documents, fragile items

### 🔔 Intelligent Notifications
- **Real-time Alerts**: Instant notifications for parcel events
- **Multi-channel**: In-app and email notifications
- **Smart Cleanup**: Automatic removal of old read notifications
- **Event Types**: Arrival, pickup reminders, status updates

### 📊 Analytics & Reporting
- **University Dashboard**: Comprehensive statistics and insights
- **Parcel Analytics**: Track delivery patterns and performance
- **User Management**: Monitor registrations and approvals

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: PostgreSQL with Prisma ORM 6.19.0
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer for parcel photo management
- **API**: RESTful API with comprehensive error handling

### Frontend
- **Framework**: React 19.1.1 with React Router DOM
- **Build Tool**: Vite with Rolldown for lightning-fast builds
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for modern iconography
- **State Management**: Context API with localStorage persistence

### Infrastructure
- **Database**: Neon PostgreSQL (cloud-hosted)
- **Deployment**: Vercel-ready with optimized configurations
- **Development**: Hot reload with nodemon and Vite HMR

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Git for version control

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/authra.git
cd authra
```

### 2. Backend Setup
```bash
cd authra-backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate deploy
npm run dev
```

### 3. Frontend Setup
```bash
cd ../authra-frontend
npm install
# Edit .env.local if needed (defaults to localhost:5001)
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001 (welcome endpoint)

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="your-secure-random-jwt-secret"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
PORT=5001
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register-university` - Register new university
- `POST /api/auth/login-university` - University admin login
- `POST /api/auth/register-user` - Register individual users
- `POST /api/auth/login-user` - User authentication

### Parcel Management
- `POST /api/parcels` - Create new parcel (with photo upload)
- `GET /api/parcels/track/:trackingNumber` - Public parcel tracking
- `GET /api/parcels/my-parcels` - User's personal parcels
- `PATCH /api/parcels/:id/status` - Update parcel status

### User Management
- `GET /api/auth/pending-approvals` - View pending user approvals
- `POST /api/auth/approve-user` - Approve/reject users
- `GET /api/students/suggest` - Search students (staff only)

## 🏗️ Project Structure

```
authra/
├── authra-backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Authentication & authorization
│   │   ├── db.js           # Database connection
│   │   └── index.js        # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── uploads/            # Parcel photo storage
├── authra-frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-specific pages
│   │   ├── utils/          # Helper functions
│   │   └── AppRouter.jsx   # Route configuration
│   └── public/             # Static assets
└── README.md
```

## 🎯 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **University Admin** | Full institutional control, approve admins, view analytics |
| **Admin** | Approve students/staff/wardens, manage operations |
| **Warden** | Approve students/staff, oversee hostel operations |
| **Staff** | Register parcels, update status, search students |
| **Student** | View personal parcels, confirm placement |

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Granular permission system
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configurable cross-origin request handling
- **Data Validation**: Comprehensive input validation
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd authra-frontend
npm run build
# Deploy to Vercel or your preferred platform
```

### Backend (Node.js Hosting)
```bash
cd authra-backend
npm install --production
npm start
```

### Database Migration
```bash
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Authra Team** - *Initial work*

## 🙏 Acknowledgments

- Built with modern web technologies for scalability and performance
- Designed with university operations in mind
- Inspired by the need for efficient campus parcel management

## 📞 Support

For support, email founder.antik@gmail.com or create an issue in this repository.

---

**Made with ❤️ for universities worldwide**
