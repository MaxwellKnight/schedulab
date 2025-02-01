# Schedula

Intelligent shift scheduling system that combines automated scheduling with preference management. Built with TypeScript, Node.js, and React.

*Schedule Smarter, Work Better*

![Node](https://img.shields.io/badge/node-v16+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-v4.9+-blue.svg)

## 🖼️ Interface Preview

<div align="center">
  <p>
    <img src="imgs/login-page.png" width="800"/>
    <br>
    <h3>Login Page</h3>
    Secure authentication through Google SSO, providing a seamless login experience
  </p>
</div>

## Key Features

- **Smart Scheduling**
  - Constraint-based optimization
  - Fair shift distribution
  - Conflict detection and resolution

- **Team Empowerment**
  - Preference submission system
  - Vacation management
  - Availability tracking
  - Schedule templates

- **Intuitive Interface**
  - Drag-and-drop scheduling
  - Real-time updates
  - Mobile-friendly design
  - Clear schedule visualization

## Tech Stack

- **Backend**
  - Node.js + TypeScript
  - MySQL

- **Frontend**
  - React + TypeScript
  - Tailwind CSS

## Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/maxwellknight/schedulab.git
cd schedula
```

3. **Create enviroment**
```bash
mv .env.example .env
```

4. **Start with Docker**
```bash
docker-compose up
```

See individual README files in [backend](./backend/README.md) and [frontend](./frontend/README.md) directories for detailed setup instructions.

## 📁 Project Structure

```
.
├── backend/                 # Node.js + TypeScript backend
│   ├── src/
│   │   ├── algorithms/     # Scheduling logic
│   │   ├── controllers/    # Route handlers
│   │   ├── models/        # Database models
│   │   └── services/      # Business logic
│   └── docs/              # API documentation
├── frontend/               # React + TypeScript frontend
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       └── hooks/         # Custom hooks
└── docker-compose.yml     # Docker configuration
```

## 📋 Prerequisites

- Node.js 16+
- MySQL 9.0.1+
- Docker

## 📖 Documentation

- [Backend Documentation](./backend/README.md)
  - API endpoints
  - Database schema
  - Authentication system

- [Frontend Documentation](./frontend/README.md)
  - Component structure
  - State management
  - Routing system

## 📫 Contact

For questions or feedback, please open an issue or contact the maintainer.

## 📜 License

This project is private and proprietary. All rights reserved.
