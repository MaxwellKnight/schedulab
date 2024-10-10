
# Scheduler

## Overview

**Scheduler** is an automated employee scheduling system designed to generate shift schedules based on employee preferences, availability, and business needs. It provides role-based authentication and authorization using JSON Web Tokens (JWT) and uses MySQL for data storage.

The project consists of a Node.js server that handles the scheduling logic, user management, and API endpoints.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Features

- **JWT Authentication**: Secure login and session management for users.
- **Role-Based Access Control (RBAC)**: Different user roles (Admin, Manager, Employee) with specific permissions.
- **Employee Preferences**: Allows employees to submit their preferences for scheduling.
- **Automated Scheduling**: Automatically generates optimal schedules based on employee availability and preferences.
- **RESTful API**: Exposes endpoints to manage users, preferences, and schedules.

## Installation

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [MySQL](https://www.mysql.com/)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MaxwellKnight/scheduler.git
   cd scheduler/server
   ```

2. **Install server dependencies**:
   ```bash
   npm install
   ```

3. **Set up MySQL database**:
   - Create a new MySQL database.
   - Update the `.env` file with your database credentials (see [Configuration](#configuration)).

4. **Run the server**:
   ```bash
   npm start
   ```

The server should now be running on `http://localhost:5713`.

## Configuration

Create a `.env` file in the `server/` directory with the following content:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=scheduler
JWT_SECRET=your_jwt_secret
PORT=5713
```

- `DB_HOST`: MySQL database host (e.g., `localhost`)
- `DB_USER`: MySQL user (e.g., `root`)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Name of the MySQL database (e.g., `scheduler`)
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Port number for the server (default is 5713)

## Usage

Once the server is running, you can interact with it via HTTP requests using tools like Postman, cURL, or any frontend client. The server exposes several API endpoints to manage users, schedules, and preferences.

### Running Locally

```bash
npm start
```

This will start the server on `http://localhost:5713)`.

### Example Requests

1. **User Registration**:
   ```bash
   POST /api/auth/register
   ```

2. **User Login**:
   ```bash
   POST /api/auth/login
   ```

3. **Get Schedule**:
   ```bash
   GET /api/schedule
   ```

## API Endpoints

| Method | Endpoint                 | Description                            |
|--------|--------------------------|----------------------------------------|
| POST   | `/api/auth/register`     | Register a new user                    |
| POST   | `/api/auth/login`        | Log in an existing user                |
| GET    | `/api/schedule`          | Get the schedule for employees         |
| POST   | `/api/schedule/generate` | Generate a new schedule                |
| PUT    | `/api/preferences`       | Update employee scheduling preferences |

## Technologies

- **Node.js**: Backend server
- **Express.js**: Web framework
- **MySQL**: Relational database
- **JWT**: Authentication
- **BCrypt**: Password hashing

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature/new-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
