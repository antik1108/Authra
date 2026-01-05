# 🚀 Deployment Guide

This guide covers deploying Authra to various platforms.

## 📋 Prerequisites

- Neon PostgreSQL database (or any PostgreSQL instance)
- Domain name (optional but recommended)
- Environment variables configured

## 🌐 Frontend Deployment (Vercel)

### Automatic Deployment
1. Fork/clone the repository to your GitHub account
2. Connect your GitHub account to Vercel
3. Import the `authra-frontend` folder as a new project
4. Configure environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL
5. Deploy automatically on every push to main branch

### Manual Deployment
```bash
cd authra-frontend
npm install
npm run build
# Upload dist/ folder to your hosting provider
```

### Vercel Configuration
The project includes `vercel.json` for SPA routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🖥️ Backend Deployment

### Vercel (Serverless)
1. Create a new Vercel project from `authra-backend` folder
2. Configure environment variables:
   ```
   DATABASE_URL=your-neon-postgres-url
   JWT_SECRET=your-secure-jwt-secret
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
3. Deploy with automatic builds

### Railway
1. Connect your GitHub repository
2. Select `authra-backend` folder
3. Add environment variables
4. Railway will automatically detect Node.js and deploy

### Heroku
```bash
# Install Heroku CLI
cd authra-backend
heroku create your-app-name
heroku config:set DATABASE_URL=your-postgres-url
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set CORS_ORIGIN=https://your-frontend-domain
git subtree push --prefix authra-backend heroku main
```

### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Select `authra-backend` folder
3. Configure environment variables
4. Set build command: `npm install && npx prisma generate`
5. Set run command: `npm start`

## 🗄️ Database Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Run migrations:
   ```bash
   cd authra-backend
   DATABASE_URL="your-neon-url" npx prisma migrate deploy
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
JWT_SECRET="your-256-bit-secret"
CORS_ORIGIN="https://your-frontend-domain.com"
PORT=5001
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 🔒 Security Checklist

- [ ] Use strong JWT_SECRET (256-bit minimum)
- [ ] Configure CORS_ORIGIN properly
- [ ] Enable HTTPS for production
- [ ] Set up database connection pooling
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 📊 Monitoring

### Backend Monitoring
- Use Vercel Analytics or similar
- Monitor API response times
- Set up error tracking (Sentry)
- Database performance monitoring

### Frontend Monitoring
- Vercel Web Analytics
- Core Web Vitals tracking
- User experience monitoring

## 🔄 CI/CD Pipeline

The project includes GitHub Actions for:
- Automated testing
- Security scanning
- Build verification
- Deployment triggers

## 📈 Scaling Considerations

### Database
- Connection pooling with Prisma
- Read replicas for heavy read workloads
- Database indexing optimization

### Backend
- Horizontal scaling with load balancers
- Caching layer (Redis)
- CDN for static assets

### Frontend
- CDN deployment (Vercel Edge Network)
- Image optimization
- Code splitting and lazy loading

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN configuration
2. **Database Connection**: Verify DATABASE_URL format
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Debug Commands
```bash
# Check database connection
cd authra-backend
npx prisma db pull

# Test API endpoints
curl https://your-backend-domain.com/health

# Check frontend build
cd authra-frontend
npm run build
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Create an issue in the repository
4. Contact the development team

---

**Happy Deploying! 🚀**