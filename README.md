# Full-Stack Authentication Example

A production-ready authentication system built with **NestJS** (backend) and **React TypeScript + Vite** (frontend), demonstrating industry best practices for secure user authentication and authorization.

## Security Features

### Password Security
- **Bcrypt Hashing**: All passwords are hashed using bcrypt with automatic salting
- **Pepper Strategy**: Additional secret pepper (from environment variables) added before hashing for enhanced security
- **Salt + Hash + Pepper**: Triple-layer password protection ensuring even database breaches cannot compromise passwords

### Token Management
- **JWT Access Tokens**: Short-lived tokens (configurable, default 10s) for API authentication
- **JWT Refresh Tokens**: Long-lived tokens (configurable, default 7d) for session management
- **HttpOnly Cookies**: Refresh tokens stored as httpOnly cookies to prevent XSS attacks
- **SameSite Protection**: Cookies configured with `sameSite: 'strict'` to prevent CSRF attacks

### Authentication Flow
- **Passport.js Integration**: Robust authentication middleware with multiple strategies
  - **Local Strategy**: Username/password authentication
  - **JWT Strategy**: Access token validation for protected routes
  - **JWT Refresh Strategy**: Refresh token validation for token renewal

### Authorization & Guards
- **Role-Based Access Control (RBAC)**: User roles system (User, Admin, etc.)
- **Route Guards**: 
  - `PassportLocalGuard`: Validates credentials during login
  - `PassportJwtAuthGuard`: Protects routes requiring authentication
  - `PassportJwtRefreshGuard`: Validates refresh token for token renewal

## Architecture

### Backend (NestJS)
- **Modular Structure**: Separate modules for Auth and Users
- **TypeORM Integration**: Entity-based database management
- **Environment Configuration**: Secure configuration management using @nestjs/config
- **Docker Support**: Containerized deployment of the database with docker-compose

**Key Endpoints:**
- `POST /auth-v2/login` - User login with credentials
- `POST /auth-v2/refresh` - Refresh access token using httpOnly cookie
- `POST /auth-v2/logout` - Clear authentication cookies
- `GET /auth-v2/me` - Get authenticated user information

### Frontend (React + TypeScript + Vite)
- **Modern Build Tool**: Lightning-fast HMR with Vite
- **TypeScript**: Full type safety across the application
- **Chakra UI**: Modern, accessible component library
- **Request Utilities**: Centralized API communication layer

## 🚀 Tech Stack

**Backend:**
- NestJS
- Passport.js
- JWT (jsonwebtoken)
- Bcrypt
- TypeORM
- Docker

**Frontend:**
- React
- TypeScript
- Vite
- Chakra UI

## Use Cases

This project serves as a comprehensive reference for:
- Implementing secure authentication in modern web applications
- Learning JWT-based authentication patterns
- Understanding refresh token rotation strategies
- Implementing role-based authorization
- Following security best practices for password storage
- Building production-ready authentication flows
