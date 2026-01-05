# Contributing to Authra

Thank you for your interest in contributing to Authra! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/authra.git`
3. Install dependencies:
   ```bash
   cd authra-backend && npm install
   cd ../authra-frontend && npm install
   ```
4. Set up environment variables (see README.md)
5. Run database migrations: `npx prisma migrate dev`
6. Start development servers:
   ```bash
   # Backend (terminal 1)
   cd authra-backend && npm run dev
   
   # Frontend (terminal 2)
   cd authra-frontend && npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- Use ESLint configuration provided in the project
- Follow existing code patterns and naming conventions
- Write meaningful commit messages
- Add comments for complex logic

### Backend Guidelines
- Use Prisma for all database operations
- Implement proper error handling
- Add authentication/authorization checks where needed
- Follow RESTful API conventions
- Validate input data

### Frontend Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use Tailwind CSS for styling
- Ensure responsive design

### Database Changes
- Create Prisma migrations for schema changes
- Test migrations thoroughly
- Update seed data if necessary
- Document breaking changes

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## ✨ Feature Requests

For new features:
- Check existing issues first
- Provide clear use case and rationale
- Consider backward compatibility
- Discuss implementation approach

## 🔄 Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes following the guidelines above
3. Test your changes thoroughly
4. Update documentation if needed
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing instructions

### PR Requirements
- All tests must pass
- Code must be properly formatted
- No merge conflicts
- Approved by at least one maintainer

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass
- Test both frontend and backend changes
- Test different user roles and permissions

## 📚 Documentation

- Update README.md for significant changes
- Add inline code comments
- Update API documentation
- Include setup instructions for new features

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

## 📞 Getting Help

- Create an issue for questions
- Join our community discussions
- Check existing documentation first

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Project documentation

Thank you for contributing to Authra! 🎓