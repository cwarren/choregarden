# Chore Garden MVP

Chore Garden task and chore management system tailored for households and small co-living groups. It focuses on frictionless household setup, easy and intuitive task tracking, and flexible work lists using a priority-based and schedule-driven hybrid model.

Also, Chore Garden is an exercise in creating a table-stakes application - with infrastructure and core functionality that's robust enough for a commercial product. This can be used as a template to get a new application up and running very quickly.

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
- **Database**: PostgreSQL
- **Job Queue**: BullMQ
- **Authentication**: AWS Cognito
- **Infrastructure**: Docker, Terraform, AWS
- **CI/CD**: GitHub Actions

## Repository Structure
This monorepo will include the following:
- `backend/`: Backend services (API, job scheduler, etc.)
- `database/`: Database scripts, certs, migrations, etc.
- `frontend/`: Frontend application
- `infrastructure/`: Terraform scripts for infrastructure as code
- `shared/`: Shared utilities and types

## Core Functionality & Characteristics
- infrastructure fully spec-ed in terraform
- secure secrets handling
- CI/CD
- highly cost-aware
- protected & public API endpoints
- protected & public sections of the web site
- user account creation and management
- integration with a payment system
- basic RBAC
- basic subscription system
- robust system documentation

# Development Dependencies

These are the tools / services that I used for local development.

* nvm - for managing node installations
* node - for running tools and code
* npm - for testing, builds, etc.
* docker - for running everything locally
* aws cli - for debugging/inspection, dev session scripts, and manual deployments and similar
* terraform - to manage the infrastructure
* * requires resource that is only available in AWS provider version 5.44.0 and later.
* openssl - to create the local cert for the DB

This was developed on a Windows machine, user Powershell as my commandline tool and VSCode as my editor.