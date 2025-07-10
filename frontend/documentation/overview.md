# ChoreGarden Frontend

A React-based frontend application for the ChoreGarden platform, providing user interface for chore and garden management. NOTE: 'garden' in this app is a metaphor, refering to a place in which chores grow. It represents a household, building, yard, or other context in which a user has a set of chores.

## Technology Stack

- **React 18** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **AWS Cognito** - Authentication and user management
- **JavaScript/ES6+** - Programming language

## Architecture Overview

The frontend follows a component-based architecture with clear separation of concerns:

### Directory Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts for state management
├── pages/           # Top-level page components
├── providers/       # App-level setup and initialization components
├── services/        # Business logic and API integration
└── utils/           # Utility functions and helpers
```

### Layer Responsibilities

#### **Components (`src/components/`)**
- **Purpose**: Reusable UI components
- **Scope**: Visual elements that can be used across multiple pages
- **Examples**: HeaderNavBar, FormElements, Buttons
- **Guidelines**: Should be stateless when possible, accept props for configuration

#### **Pages (`src/pages/`)**
- **Purpose**: Top-level route components that represent full pages
- **Scope**: Complete page layouts and page-specific logic
- **Examples**: AccountPage, HomePage
- **Guidelines**: Coordinate between services and components, handle page-level state

#### **Contexts (`src/contexts/`)**
- **Purpose**: Global state management using React Context
- **Scope**: Application-wide state that needs to be shared across components
- **Examples**: AuthContext for authentication state
- **Guidelines**: Keep contexts focused on specific domains, avoid massive global contexts

#### **Providers (`src/providers/`)**
- **Purpose**: App-level setup, initialization, and side effects
- **Scope**: Wrapper components that perform setup work without managing state
- **Examples**: AuthHandler for token exchange and user registration
- **Guidelines**: Handle initialization logic, side effects, and app-level configuration

#### **Services (`src/services/`)**
- **Purpose**: Business logic and external API integration
- **Scope**: Communication with backend APIs, complex business operations
- **Examples**: authService, userService
- **Guidelines**: Pure functions when possible, handle errors gracefully, provide clear interfaces

#### **Utils (`src/utils/`)**
- **Purpose**: Pure utility functions and helpers
- **Scope**: Generic functions that don't fit into services
- **Examples**: Date formatting, validation helpers
- **Guidelines**: Should be pure functions with no side effects

## Documentation

This documentation is organized into focused files for easy navigation:

- **[Authentication Flow](authentication_flow.md)** - AWS Cognito integration, token management, and protected routes
- **[Service Architecture](service_architecture.md)** - Service patterns, design principles, and API integration
- **[State Management](state_management.md)** - Context patterns, local state, and server state management
- **[Development Guide](development.md)** - Development patterns, environment setup, and workflow

### Development Playbooks

Step-by-step guides for common development tasks:

- **[Adding a New Provider](development_playbooks/adding_provider.md)** - App-level setup and initialization components
- **[Adding a New Service](development_playbooks/adding_service.md)** - Business logic and API integration

## Quick Start

### Running Locally
To run the frontend as a stand-alone, from the `/frontend` folder:
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Running Full Application
To run the full application, use docker compose from the top level of the project:
```bash
docker-compose build # build the latest version
docker-compose up    # stand up the front end, backend, and database
```

**Note**: You'll need a docker service running first. When running locally you can use the Cognito login and it will work, and the user profile data will be from the local DB.

## Project Structure

For detailed information about each aspect of the frontend architecture, see the linked documentation files above.
