# SchoolOS Mobile Frontend

A mobile-first Progressive Web Application (PWA) built with React 18, TypeScript, and Tailwind CSS v4. Provides role-based access to school management features for Students, Teachers, Parents, and Admins.

## Features

- **Mobile-First Design**: Responsive UI from 320px to 1920px
- **Progressive Web App**: Installable app with offline support
- **Role-Based Access**: Tailored dashboards for Students, Teachers, Parents, and Admins
- **Offline-First**: Works offline with automatic sync when reconnected
- **Type Safety**: Full TypeScript coverage with strict mode
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <2s initial load on 4G, code splitting, lazy loading

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + CSS Variables
- **State Management**: Zustand (UI) + React Query (Server)
- **Forms**: React Hook Form + Zod
- **API Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library + Playwright
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Offline**: Workbox + IndexedDB

## Project Structure

```
src/
├── components/          # Atomic design components
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Component combinations
│   ├── organisms/      # Complex components
│   └── templates/      # Page layouts
├── features/           # Feature modules
│   ├── auth/           # Authentication
│   ├── student/        # Student portal
│   ├── teacher/        # Teacher portal
│   ├── parent/         # Parent portal
│   ├── admin/          # Admin panel
│   └── common/         # Shared features
├── hooks/              # Custom React hooks
├── services/           # API and business logic
│   ├── api/            # API client
│   ├── offline/        # Offline sync
│   ├── storage/        # Storage services
│   └── monitoring/     # Error tracking
├── store/              # Zustand stores
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env.local from .env.example
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SchoolOS
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
// Instead of:
import Button from '../../../components/atoms/Button'

// Use:
import Button from '@components/atoms/Button'
```

Available aliases:
- `@components` → `src/components`
- `@features` → `src/features`
- `@hooks` → `src/hooks`
- `@services` → `src/services`
- `@store` → `src/store`
- `@types` → `src/types`
- `@utils` → `src/utils`
- `@styles` → `src/styles`

### Tailwind CSS

Custom theme configuration in `tailwind.config.ts`:

- **Colors**: Primary (blue), Secondary (purple), Success (green), Warning (amber), Danger (red), Neutral
- **Spacing**: Safe area insets for mobile notches
- **Animations**: Fade, slide, scale, pulse effects
- **Responsive**: Mobile-first breakpoints

### TypeScript

Strict mode enabled for maximum type safety. Configuration in `tsconfig.json`.

## Testing

### Unit Tests

```bash
npm run test
```

Tests are located in `tests/unit/` and use Vitest + React Testing Library.

### Integration Tests

Located in `tests/integration/` using Vitest + Mock Service Worker (MSW).

### E2E Tests

Located in `tests/e2e/` using Playwright.

## CI/CD Pipeline

GitHub Actions workflow in `.github/workflows/ci.yml`:

1. **Lint**: ESLint + Prettier
2. **Type Check**: TypeScript
3. **Build**: Vite build
4. **Tests**: Unit tests with coverage

## Performance

- **Bundle Size**: <200KB JS, <50KB CSS (gzipped)
- **First Contentful Paint**: <1.5s on 4G
- **Largest Contentful Paint**: <2.5s on 4G
- **Code Splitting**: By route
- **Lazy Loading**: Images and non-critical resources

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Focus indicators
- Color contrast (4.5:1 minimum)
- Screen reader support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Submit pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
