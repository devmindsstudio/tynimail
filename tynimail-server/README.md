# Tynimail Server

A robust authentication and user management API built with NestJS, TypeScript, and PostgreSQL. This server provides complete authentication flows, including user registration, login, email verification, password reset, and token refresh mechanisms.

## 🚀 Features 
 
- **User Authentication**
  - User registration with email verification
  - Login with JWT token generation 
  - Email OTP verification
  - Password reset with OTP verification
  - Token refresh mechanism
  

  <!-- ... -->
- **Security**
  - JWT-based authentication (Access & Refresh tokens)
  - Password hashing with bcrypt
  - Environment-based configuration
  - CORS protection
  - Global exception handling

- **API Documentation**
  - Interactive Swagger/OpenAPI documentation
  - Comprehensive endpoint descriptions
  - Request/Response examples

- **Architecture**
  - Modular structure
  - Custom decorators and guards
  - Global validation pipes
  - Database migrations with Knex.js

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (v14.x or higher)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/syedmuzammil779/tynimail-server.git
cd tynimail-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create environment files for different environments:

#### Local Environment (.env.local)
```bash
# Server Configuration
PORT=3000
NODE_ENV=local

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tynimail_local

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

#### Development Environment (.env.development)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=your_dev_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tynimail_dev

# JWT Configuration
JWT_ACCESS_SECRET=your_dev_access_secret
JWT_REFRESH_SECRET=your_dev_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://dev.yourdomain.com
```

#### Staging Environment (.env.staging)
```bash
# Server Configuration
PORT=3000
NODE_ENV=staging

# Database Configuration
DB_HOST=your_staging_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tynimail_staging

# JWT Configuration
JWT_ACCESS_SECRET=your_staging_access_secret
JWT_REFRESH_SECRET=your_staging_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://staging.yourdomain.com
```

#### Production Environment (.env.production)
```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=your_prod_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tynimail_prod

# JWT Configuration
JWT_ACCESS_SECRET=your_prod_access_secret
JWT_REFRESH_SECRET=your_prod_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

### 4. Generate JWT Secrets

Generate secure JWT secrets for your environment:

```bash
# Generate Access Token Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Refresh Token Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated secrets to your environment files.

### 5. Database Setup

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tynimail_local;

# Exit psql
\q
```

#### Run Migrations
```bash
npm run migrate
```

## 🏃 Running the Application

### Local Development (with hot-reload)
```bash
npm run start:local
```

### Development Environment
```bash
npm run start:dev
```

### Staging Environment
```bash
npm run start:staging
```

### Production Environment
```bash
npm run start:prod
```

The server will start on the port specified in your environment file (default: 3000).

## 📚 API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

This provides a complete overview of all available endpoints with request/response examples.

## 🔗 Available Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/verify-email` | Verify email OTP | Yes |
| GET | `/auth/resend-email-verification` | Resend email verification OTP | Yes |
| POST | `/auth/forget-password` | Request password reset | No |
| POST | `/auth/verify-password-otp` | Verify password reset OTP | No |
| POST | `/auth/refresh-token` | Refresh access token | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Check server status | No |

## 🧪 Testing

```bash
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📁 Project Structure

```
tynimail-server/
├── src/
│   ├── config/              # Environment configuration
│   ├── constants/           # Application constants
│   ├── database/            # Database connection and migrations
│   ├── decorators/          # Custom decorators (e.g., @CurrentUser)
│   ├── dto/                 # Data Transfer Objects
│   │   ├── request/        # Request DTOs
│   │   └── response/       # Response DTOs
│   ├── filters/            # Global exception filters
│   ├── guards/             # Auth guards
│   ├── interfaces/         # TypeScript interfaces
│   ├── middlewares/        # Custom middlewares
│   ├── modules/            # Feature modules
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── jwt/           # JWT module
│   │   ├── metadata/      # Metadata module
│   │   └── health/        # Health check module
│   ├── responses/          # Response helper functions
│   ├── utils/              # Utility functions
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── .env.local              # Local environment variables
├── .env.development        # Development environment variables
├── .env.staging            # Staging environment variables
├── .env.production         # Production environment variables
├── knexfile.ts             # Knex configuration
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🔧 Common Scripts

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format

# Build the project
npm run build

# Run database migrations
npm run migrate
```

## 🔐 Authentication Flow

### 1. User Registration
```
POST /auth/register
→ User created
→ OTP sent to email
→ Returns access & refresh tokens
```

### 2. Email Verification
```
POST /auth/verify-email (with Bearer token)
→ OTP verified
→ User status updated
```

### 3. User Login
```
POST /auth/login
→ Credentials validated
→ Returns access & refresh tokens + email verification status
```

### 4. Token Refresh
```
POST /auth/refresh-token
→ Refresh token validated
→ Returns new access & refresh token pair
```

### 5. Password Reset
```
POST /auth/forget-password
→ OTP sent to email

POST /auth/verify-password-otp
→ OTP verified
→ User can set new password
```

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `local`, `development`, `staging`, `production` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `DB_NAME` | Database name | `tynimail_local` |
| `JWT_ACCESS_SECRET` | JWT access token secret | `generated_secret` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `generated_secret` |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

## 🛡️ Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication
- ✅ Separate access and refresh tokens
- ✅ Token rotation on refresh
- ✅ CORS protection
- ✅ Global validation pipes
- ✅ Custom exception handling
- ✅ Secure OTP generation

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in .env file
- Ensure database exists
- Run migrations: `npm run migrate`

### JWT Token Issues
- Verify JWT secrets are set in .env file
- Check token expiry times
- Ensure Bearer token format in Authorization header

## 📝 Notes

- **OTP Validation**: Currently using hardcoded OTP "555555" for testing. Replace with actual database validation in production.
- **Email Service**: Email sending functionality marked with TODO comments. Integrate an email service (SendGrid, AWS SES, etc.) for production.
- **Metadata Status**: Implement status updates to mark OTPs as used after verification.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is [UNLICENSED](LICENSE).

## 👥 Authors

- **Tynimail Team**

## 📞 Support

For questions and support:
- Create an issue in the repository
- Contact the development team

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Knex.js Documentation](http://knexjs.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---




Made with ❤️ by Tynimail Team
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
