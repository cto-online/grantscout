# GrantScout Frontend Setup

This project now includes a complete admin console frontend, matching the tech stack and design of GrantAtlas.

## Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **Vite** - Ultra-fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS with new engine
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Firebase** - Authentication and backend integration
- **Lucide React** - Beautiful, consistent icons

## Project Structure

```
grantscout/
├── src/                 # Backend/pipeline code
├── console/             # React admin frontend
│   ├── src/
│   │   ├── auth/       # Firebase auth & login
│   │   ├── app/        # App shell & layout
│   │   ├── screens/    # Page components
│   │   ├── lib/        # Utilities
│   │   ├── App.tsx     # Root component
│   │   ├── main.tsx    # Entry point
│   │   └── index.css   # Global styles + Tailwind
│   ├── package.json    # Frontend dependencies
│   ├── vite.config.ts  # Vite configuration
│   └── tsconfig.json   # TypeScript config
└── package.json        # Root workspace config
```

## Getting Started

### Install dependencies

```bash
npm install
```

This installs both root dependencies and console dependencies (monorepo setup).

### Set up environment variables

Copy the example file and fill in your Firebase config:

```bash
cp console/.env.example console/.env
```

You'll need Firebase project credentials:
- API Key
- Project ID  
- Auth Domain

### Run the frontend dev server

```bash
npm run dev:console
```

The admin console will be available at `http://localhost:5173`

### Run both backend and frontend

In separate terminals:

```bash
# Terminal 1 - Backend pipeline
npm run dev

# Terminal 2 - Frontend admin console
npm run dev:console
```

## Building for Production

```bash
npm run build
```

This builds both the backend and frontend. The frontend assets are in `console/dist/`.

## Features

The admin console provides:

- **Overview Dashboard** - Pipeline stats and recent activity
- **Pipeline Runs** - Monitor all extraction runs
- **Data Sources** - Manage active data providers
- **Extracted Grants** - View and filter discovered grants
- **Review Queue** - Manual review of flagged items
- **Scoring Results** - AI fit scoring visualization
- **Settings** - Configuration and preferences
- **Authentication** - Firebase-based user auth

## Design System

The console uses GrantAtlas's exact dark theme design system:

- **Colors**: Dark theme with purple accent (#9182f8)
  - Canvas: #050608 (main background)
  - Sidebar: #08090e
  - Panel: #0a0b11 (card backgrounds)
  - Card: #0d0e15 (nested containers)
  - Text: #f2f1f7 (primary), #8a8a99 (muted), #5b5b68 (faint)
  - Accent: #9182f8, hover: #a194fa
  - Status: Green (#4ade80), Yellow (#fbbf24), Red (#f87171)
- **Spacing**: Consistent 4px base unit
- **Typography**: Inter font with system fallback
- **Components**: Built with Tailwind utilities (no component library dependency)

## Development

### TypeScript

All code is fully typed. Run type checking:

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## Architecture Notes

- **Monorepo**: Uses npm workspaces to keep backend and frontend together
- **Authentication**: Firebase handles auth; backend can verify tokens
- **API Integration**: Console can call backend via Firebase Functions or REST API
- **State Management**: React Query for server state, Context for auth state
- **Styling**: Tailwind CSS v4 with vite plugin (no PostCSS needed)

## Troubleshooting

**Console won't start?**
- Ensure Node 20+: `node --version`
- Clear cache: `rm -rf console/node_modules && npm install`
- Check .env file is configured

**Build fails?**
- Run `npm run typecheck` to see type errors
- Check all imports resolve (TypeScript paths configured in tsconfig.app.json)

**Styling broken?**
- Tailwind CSS v4 uses a new Vite plugin, no PostCSS config needed
- Check vite.config.ts includes tailwindcss plugin

## Next Steps

1. Set up Firebase project and get credentials
2. Implement API routes for data fetching (currently using placeholder data)
3. Connect React Query hooks to actual API endpoints
4. Set up CI/CD for automatic deploys
5. Add unit tests for key screens and components
