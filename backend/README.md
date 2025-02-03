# Schedula Backend

Node.js/TypeScript backend service for Schedula with MySQL 9.0.1.

## Setup

```bash
npm install
cp .env.example .env
mysql -u root -p schedula < dump/dump.sql
npm run dev  # Starts server on http://localhost:5713
```

## Environment Variables

Required variables in `.env`:
```bash
# Database
DATABASE_HOST=
DATABASE_USER=root
DATABASE_NAME=schedula
DATABASE_LOCAL_PORT=3306

# Server
NODE_LOCAL_PORT=5713
FRONTEND_URL=http://localhost:5173

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5713/auth/google/callback
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
```

## Project Structure

```
src/
├── algorithms/    # Scheduling engine
├── controllers/   # Request handlers
├── models/       # Database models
├── routes/       # API routes
└── services/     # Business logic
```
## Docker

```bash
docker-compose up  # Runs MySQL on 3306 and server on 5713
```

## Troubleshooting

Database:
```bash
sudo service mysql status  # Check MySQL
mysql -u root             # Verify connection
```

Server:
```bash
lsof -i :5713            # Check port availability
npm run dev              # Check logs
```
