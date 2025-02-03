# Schedula Frontend

React + TypeScript frontend for Schedula built with Vite and shadcn/ui.

## Setup

```bash
npm install
npm run dev  # Starts on http://localhost:5173
```

## Project Structure

```
src/
├── components/    # UI components and layouts
│   ├── ui/       # shadcn/ui components
│   └── layout/   # Layout components
├── pages/        # Page components
├── context/      # React Context
├── hooks/        # Custom hooks
└── types/        # TypeScript types
```

## Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run format   # Prettier
```

## Key Features

- JWT authentication with protected routes
- Interactive schedule builder with drag-and-drop
- Team management and preference system
- Template-based scheduling

## API Integration

```typescript
baseURL: 'http://localhost:5713'
```

## Routes

```
/                  # Home
/login             # Auth
/schedule          # View
/schedule/builder  # Create
/members           # Team
```

## Troubleshooting

API Issues:
```bash
# Verify backend
curl http://localhost:5713/health

# Clear cache & reinstall
rm -rf node_modules
npm install
```

Auth Issues:
- Clear localStorage
- Check token expiration
- Verify credentials

## Browser Support

Chrome, Firefox, Safari, Edge (latest versions)
