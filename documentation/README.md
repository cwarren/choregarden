# Chore Garden MVP - Project Overview

Chore Garden is a task and chore management system. It focuses on frictionless household setup, easy and intuitive task tracking, and flexible work lists using a priority-based and schedule-driven hybrid model.

Also, Chore Garden is an exercise in creating a table-stakes application - with infrastructure and core functionality that's robust enough for a commercial product. This can be used as a template to get a new application up and running very quickly.

## Documentation
- this file - General project information
- [Development Workflow](./documentation/development_workflow.md) - Development process and local setup
- [Architecture](./documentation/architecture.md) - System architecture overview
- [Design Decisions](./documentation/design_decisions.md) - Context and rationale for key decisions
- [Future Considerations](./documentation/future_considerations.md) - Planned extensions and evolution

## Features
- Dynamic chore flows
- Basic reward feedback
- Robust defaults

## Exclusions
- Advanced gamification
- Analytics

## Tech Stack
- **Backend**: Node.js (Express) + TypeScript
- **Frontend**: React + Tailwind
- **Database**: PostgreSQL, Flyway
- **Job Queue**: BullMQ
- **Authentication**: AWS Cognito
- **Infrastructure**: Docker, Terraform, AWS
- **CI/CD**: GitHub Actions

## Repository Structure
This monorepo includes the following:
- `backend/`: Backend services (API, job scheduler, etc.)
- `database/`: Database scripts, certs, migrations, etc.
- `documentation/`: Project-level documentaton (general architecture, workflows, etc).
- `frontend/`: Frontend application
- `infrastructure/`: Terraform scripts for infrastructure as code
- `ops-lambdas`: Lambdas related to operations and management rather than the app itself - e.g. a lambda to run flyway migrations
- `scripts/`: small, custom tools to aid in development (run locally by developers)
- `docs/`: Project documentation

### Documentation Structure
Every major section of this project has a /documentation folder, and each of those has
- README - general info about that part of the project and a guide to other documenatation
- design_decisions - key decisions, reasons, and alternatives with reasons not chosen
- future_considerations - potential next steps and extensions; this includes thoughts on scaling as well
- often a /development_playbooks subfolder - guides and patterns for common development needs
- other section-specific documents


## Core Functionality & Characteristics
- Infrastructure fully spec-ed in terraform
- Secure secrets handling
- CI/CD pipeline
- Highly cost-aware architecture
- Protected & public API endpoints
- Protected & public sections of the web site
- User account creation and management
- Integration with a payment system
- Basic RBAC (Role-Based Access Control)
- Basic subscription system
- Robust system documentation

## Development Environment
This project was developed on a Windows machine, using PowerShell as the command-line tool and VSCode as the editor with GitHub Copilot as an AI assistant.
