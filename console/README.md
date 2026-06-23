# GrantScout Admin Console

Web-based admin interface for the GrantScout grant discovery pipeline.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

You'll need:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

## Architecture

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Firebase** - Authentication & backend

## Features

- Pipeline run monitoring
- Data source management
- Grant extraction viewing
- Review queue management
- Scoring results visualization
- User settings and configuration

## License

Private - Part of GrantScout project
