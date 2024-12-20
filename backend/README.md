# Schedula Backend

Backend service for Schedula, built with Node.js, TypeScript, and MySQL 9.0.1.

## Quick Start 🚀

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Set up database
mysql -u root -p schedula < dump/dump.sql

# Run development server
npm run dev
```

The server will start on `http://localhost:5713`.

## Environment Variables ⚙️

Create `.env` file with these exact values:
```bash
# Database Configuration
DATABASE_HOST=
DATABASE_USER=root
DATABASE_PASSWORD=''
DATABASE_NAME=schedula
DATABASE_LOCAL_PORT=3306
DATABASE_DOCKER_PORT=3306

# Server Configuration
NODE_LOCAL_PORT=5713
NODE_DOCKER_PORT=5713
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5713/auth/google/callback
FRONTEND_URL=http://localhost:5173

# JWT Secrets
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
```

## Project Structure 📁

```
src/
├── algorithms/         # Scheduling engine
│   ├── schedule.ts    
│   └── scheduler.ts   
├── controllers/       # Request handlers
│   ├── auth.controller.ts
│   ├── preference.controller.ts
│   ├── schedule.controller.ts
│   ├── shift.controller.ts
│   ├── template.controller.ts
│   ├── user.controller.ts
│   └── vacation.controller.ts
├── interfaces/       # TypeScript types & interfaces
├── models/          # Database models
├── repositories/    # Data access layer
├── routes/          # API routes
├── services/        # Business logic
└── validations/     # Input validation
```

## Database Setup 🗄️

1. Create MySQL database
```bash
mysql -u root -p < dump/dump.sql
```

## Available Scripts 📜

```bash
# Development
npm run dev           # Start development server on port 5713
npm run build        # Build for production
npm run dev        # Start production server
```

## API Endpoints 🛣️

### Authentication
```
POST   /api/auth/login        # Login user
POST   /api/auth/register     # Register new user
```

### Users
```
GET    /api/users            # List users
GET    /api/users/:id        # Get user details
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user
```

### Schedules
```
GET    /api/schedules        # List schedules
POST   /api/schedules        # Create schedule
GET    /api/schedules/:id    # Get schedule
PUT    /api/schedules/:id    # Update schedule
DELETE /api/schedules/:id    # Delete schedule
```

### Shifts
```
GET    /api/shifts          # List shifts
POST   /api/shifts         # Create shift
PUT    /api/shifts/:id     # Update shift
DELETE /api/shifts/:id     # Delete shift
```

### Preferences
```
GET    /api/preferences    # List preferences
POST   /api/preferences   # Create preference
PUT    /api/preferences/:id  # Update preference
```

### Vacations
```
GET    /api/vacations     # List vacations
POST   /api/vacations    # Request vacation
PUT    /api/vacations/:id   # Update vacation
DELETE /api/vacations/:id   # Cancel vacation
```

## Docker Configuration 🐳

The application is configured to run with Docker using the following ports:
- MySQL: 3306 (both local and container)
- Node.js server: 5713 (both local and container)

To run with Docker:
```bash
docker-compose up
```

## Troubleshooting 🔍

Common issues and solutions:

1. Database Connection
```bash
# Check MySQL service
sudo service mysql status

# Verify connection (no password)
mysql -u root

2. Server Issues
```bash
# Check if port 5713 is available
lsof -i :5713

# Check server logs
npm run dev
```

3. CORS Issues
- Verify EXPRESS_ORIGIN_HOST and EXPRESS_ORIGIN_PORT match your frontend configuration
- Default frontend URL should be http://localhost:3000

## Security Notes 🔒

- Application uses JWT for authentication
- Access and refresh tokens are configured with the same secret (consider using different secrets in production)
- Default database has no password set (consider adding password for production)
