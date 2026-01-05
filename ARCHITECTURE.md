# 🏗️ Authra Architecture Documentation

## 📋 Overview

Authra is a full-stack university parcel management system built with modern web technologies. This document provides a comprehensive overview of the system architecture, design decisions, and technical implementation.

## 🎯 System Goals

- **Multi-tenancy**: Support multiple universities with complete data isolation
- **Role-based Access**: Granular permissions for different user types
- **Scalability**: Handle growing number of universities and users
- **Security**: Secure authentication and data protection
- **User Experience**: Intuitive interface for all user roles
- **Reliability**: Robust error handling and data consistency

## 🏛️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│ (PostgreSQL)    │
│                 │    │                 │    │                 │
│ • React 19      │    │ • Express.js    │    │ • Prisma ORM    │
│ • Vite          │    │ • JWT Auth      │    │ • Neon Cloud    │
│ • Tailwind CSS  │    │ • Multer        │    │ • Migrations    │
│ • React Router  │    │ • CORS          │    │ • Indexing      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Technology Stack

### Frontend Technologies
- **React 19.1.1**: Latest React with concurrent features
- **Vite**: Fast build tool with HMR
- **React Router DOM 7.9.5**: Client-side routing
- **Tailwind CSS 3.3.3**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **ESLint**: Code linting and formatting

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js 5.1.0**: Web application framework
- **Prisma 6.19.0**: Type-safe database ORM
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Multer**: File upload handling

### Infrastructure
- **Neon**: Serverless PostgreSQL
- **Vercel**: Frontend and backend deployment
- **GitHub Actions**: CI/CD pipeline

## 🗄️ Database Design

### Core Entities

#### University
- Central entity for multi-tenancy
- Stores institutional information
- Admin credentials and verification status

#### User
- Polymorphic user entity
- Role-based with UserType enum
- Approval workflow integration

#### Parcel
- Core business entity
- Tracking and status management
- Photo storage and metadata

#### Notification
- Event-driven messaging system
- Multi-channel delivery support

### Relationships
```
University (1) ──── (N) User
User (1) ──── (N) Parcel (as receiver)
User (1) ──── (N) Parcel (as sender)
Parcel (1) ──── (N) TrackingHistory
Parcel (1) ──── (N) Notification
University (1) ──── (N) Notification
```

### Indexing Strategy
- Primary keys: CUID for distributed systems
- Foreign keys: Proper referential integrity
- Search indexes: Email, student ID, tracking numbers
- Composite indexes: University + status, University + role
- Performance indexes: Created dates, status fields

## 🔐 Security Architecture

### Authentication Flow
1. User provides credentials
2. Server validates against database
3. JWT token generated with user/university ID
4. Token stored in localStorage (frontend)
5. Token sent in Authorization header
6. Middleware validates token on protected routes

### Authorization Levels
```
University Admin ──► Admin ──► Warden ──► Staff/Student
     │                │         │           │
     └── Full Access  └── Mgmt  └── Hostel  └── Limited
```

### Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **JWT Expiration**: 7-day token lifecycle
- **CORS Protection**: Origin validation
- **Input Validation**: Prisma schema validation
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size validation

## 🔄 API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods for operations
- Consistent response formats
- Proper status codes
- Error handling standards

### Endpoint Structure
```
/api/auth/*          # Authentication & user management
/api/parcels/*       # Parcel operations
/api/students/*      # Student-specific operations
/health              # System health check
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-05T10:00:00Z"
}
```

## 🎨 Frontend Architecture

### Component Hierarchy
```
App
├── AppRouter
│   ├── ProtectedRoute
│   └── UniversityProtectedRoute
├── Pages
│   ├── Dashboard (role-specific)
│   ├── Login/Registration
│   └── Public pages
└── Components
    ├── UI Components
    ├── Forms
    └── Layout
```

### State Management
- **Local State**: React hooks (useState, useEffect)
- **Authentication**: localStorage + Context API
- **Form State**: Controlled components
- **Server State**: Direct API calls (no external library)

### Routing Strategy
- **Public Routes**: Landing, login, registration
- **Protected Routes**: Role-based dashboard access
- **Route Guards**: Authentication and authorization checks
- **Dynamic Routing**: User role-based redirects

## 📊 Data Flow

### Parcel Creation Flow
1. Staff uploads parcel with photo
2. System generates tracking number and pickup code
3. Student lookup and notification creation
4. Database transaction with photo storage
5. Real-time notification to student
6. Email notification (if configured)

### User Approval Flow
1. User registers with university selection
2. Approval request created with PENDING status
3. Appropriate approver receives notification
4. Approver reviews and approves/rejects
5. User status updated and notification sent
6. User can access role-specific features

## 🚀 Performance Considerations

### Database Optimization
- **Indexing**: Strategic indexes for common queries
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient joins and filters
- **Pagination**: Large dataset handling

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Compressed parcel photos
- **Caching**: Browser caching for static assets
- **Bundle Size**: Tree shaking and minification

### Backend Optimization
- **Middleware Ordering**: Efficient request processing
- **Error Handling**: Graceful error responses
- **File Upload**: Streaming for large files
- **CORS**: Minimal overhead configuration

## 📈 Scalability Design

### Horizontal Scaling
- **Stateless Backend**: No server-side sessions
- **Database Sharding**: University-based partitioning
- **CDN Integration**: Static asset distribution
- **Load Balancing**: Multiple backend instances

### Vertical Scaling
- **Database Optimization**: Query performance tuning
- **Memory Management**: Efficient data structures
- **CPU Optimization**: Async/await patterns
- **Storage Optimization**: File compression

## 🔍 Monitoring & Observability

### Logging Strategy
- **Request Logging**: All API calls with timestamps
- **Error Logging**: Detailed error information
- **Performance Logging**: Response times and bottlenecks
- **Security Logging**: Authentication attempts and failures

### Metrics Collection
- **API Performance**: Response times and error rates
- **Database Performance**: Query execution times
- **User Engagement**: Feature usage analytics
- **System Health**: Resource utilization

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Migration and query testing
- **Security Tests**: Authentication and authorization

### Frontend Testing
- **Component Tests**: React component testing
- **Integration Tests**: User flow testing
- **E2E Tests**: Full application testing
- **Accessibility Tests**: WCAG compliance

## 🔄 Development Workflow

### Git Strategy
- **Main Branch**: Production-ready code
- **Develop Branch**: Integration branch
- **Feature Branches**: Individual feature development
- **Hotfix Branches**: Critical bug fixes

### CI/CD Pipeline
1. **Code Push**: Trigger automated pipeline
2. **Linting**: Code quality checks
3. **Testing**: Automated test suite
4. **Security Scan**: Vulnerability assessment
5. **Build**: Production build creation
6. **Deploy**: Automated deployment

## 🔮 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration
- **Mobile App**: React Native application
- **Analytics Dashboard**: Advanced reporting
- **API Rate Limiting**: Request throttling
- **Caching Layer**: Redis integration

### Technical Improvements
- **Microservices**: Service decomposition
- **Event Sourcing**: Audit trail implementation
- **GraphQL**: Alternative API layer
- **Containerization**: Docker deployment
- **Kubernetes**: Orchestration platform

---

This architecture documentation serves as a living document that evolves with the system. Regular updates ensure alignment between implementation and documentation.