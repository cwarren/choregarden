# Frontend

React web application for Chore Garden with Progressive Web App capabilities.

## Quick Start

```powershell
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000` and proxy API requests to the backend at `http://localhost:5000`.

## Features

- **React 19**: Latest React features and performance improvements
- **Progressive Web App**: Installable app with offline capabilities
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern Routing**: React Router v7 for navigation
- **Cross-Device**: Works on desktop, tablet, and mobile

## Documentation

- [Frontend Documentation](./documentation/README.md) - Complete frontend documentation index
- [Architecture Overview](./documentation/overview.md) - Tech stack and architecture
- [Development Guide](./documentation/development.md) - Development patterns and workflow
- [Authentication Flow](./documentation/authentication_flow.md) - AWS Cognito integration
- [Design Decisions](./documentation/design_decisions.md) - Context and rationale for frontend-specific decisions  
- [Future Considerations](./documentation/future_considerations.md) - Planned frontend enhancements and evolution

## Development

### Testing
```powershell
npm test
```

### Building for Production
```powershell
npm run build
```

### PWA Features
The app is configured as a Progressive Web App with:
- Service worker for offline functionality
- Installable on mobile devices
- Push notification capabilities (when implemented)
- Responsive design optimized for all screen sizes

## Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── pages/         # Main page components
├── providers/     # App-level providers
└── services/      # API services and utilities
```
