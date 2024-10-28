# Schedula Frontend

React + TypeScript frontend for Schedula, a shift scheduling system built with Vite, React, TypeScript, and shadcn/ui.

## Quick Start 🚀

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:3000`

## Project Structure 📁

```
src/
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/            # Layout components
│   │   └── Layout.tsx
│   ├── navigation/        # Navigation components
│   │   └── Navigation.tsx
│   ├── combobox/         
│   │   └── Combobox.tsx
│   └── date-picker/
│       └── DatePicker.tsx
├── pages/                  # Page components
│   ├── Home/
│   ├── Login/
│   ├── Members/
│   ├── Schedule/
│   │   ├── Schedule.tsx
│   │   └── ScheduleEditable.tsx
│   └── ScheduleBuilder/
│       ├── ConstraintBuilder.tsx
│       ├── ScheduleBuilder.tsx
│       └── ScheduleForm.tsx
├── context/               # React Context
│   └── AuthContext.tsx
├── hooks/                # Custom hooks
│   ├── useAuth/
│   ├── useAuthFetch.ts
│   ├── useFetch/
│   └── use-toast.ts
├── types/                # TypeScript types
│   ├── preferences.dto.ts
│   ├── schedules.dto.ts
│   ├── shifts.dto.ts
│   └── users.dto.ts
└── utils/                # Utility functions
    └── colors.ts
```

## Available Scripts 📜

```bash
# Development
npm run dev           # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## Key Features 🌟

### Authentication
- JWT-based authentication
- Protected routes
- Login persistence
- Token refresh mechanism

### Schedule Management
- Interactive schedule builder
- Drag-and-drop interface
- Constraint handling
- Template system

### Team Management
- Member overview
- Preference submission
- Vacation requests
- Shift assignments

## Component System 🧩

### UI Components
Using shadcn/ui for consistent design:
```typescript
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"
```

### Custom Components
```typescript
import { DatePicker } from "@/components/date-picker/DatePicker"
import { Combobox } from "@/components/combobox/Combobox"
```

## API Integration 🔌

Backend connection configured in `src/lib/axios/index.ts`:
```typescript
baseURL: 'http://localhost:5713',
headers: {
  'Content-Type': 'application/json'
}
```

## State Management 🔄

Using React Context for global state:
```typescript
import { AuthContext } from "@/context/AuthContext"
```

Custom hooks for data fetching:
```typescript
import { useFetch } from "@/hooks/useFetch"
import { useAuth } from "@/hooks/useAuth"
```

## Styling 🎨

Using Tailwind CSS with custom configuration:
```bash
# tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Custom configurations
    }
  }
}
```

## Development Guidelines 📝

1. **Component Creation**
   - Use TypeScript interfaces
   - Follow shadcn/ui patterns
   - Include prop documentation

2. **State Management**
   - Use context for global state
   - Local state for component-specific data
   - Custom hooks for reusable logic

3. **Styling**
   - Use Tailwind utilities
   - Follow component-based styling
   - Maintain consistency with shadcn/ui

4. **Error Handling**
   - Use ErrorBoundary components
   - Implement toast notifications
   - Proper error states in forms

## Routes Structure 🛣️

```typescript
/                  # Home
/login             # Authentication
/schedule          # Schedule view
/schedule/builder  # Schedule creation
/members           # Team management
```

## Error Handling 🚨

Using toast notifications:
```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive"
})
```

## Troubleshooting 🔍

1. **API Connection Issues**
   - Verify backend is running on port 5713
   - Check CORS configuration
   - Validate API endpoints

2. **Authentication Problems**
   - Clear localStorage
   - Check token expiration
   - Verify API credentials

3. **Build Issues**
   ```bash
   # Clear node_modules
   rm -rf node_modules
   npm install
   
   # Clear Vite cache
   npm run clean
   ```

## Browser Support 🌐

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations 📈

- Lazy loading for routes
- Optimized bundle size
- Efficient state updates
- Memoized components
