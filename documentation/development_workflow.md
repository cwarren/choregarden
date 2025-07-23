# Development Workflow

This document outlines the development process and workflow for Chore Garden.

## Branch Strategy

We use a simplified two-branch strategy optimized for solo development:

```
working-branch → dev → main (prod)
```

NOTE: 'working branch' is a general term that covers features, tasks, fixes, etc.

### Branch Rules
- **No direct commits** to `main` or `dev`
- All changes must go through Pull Requests
- PRs may be self-reviewed (in a solo development context)
- AI reviewer enabled when available

### Workflow Steps

1. **Create working branch** from `dev`
   ```powershell
   git checkout dev
   git pull origin dev
   git checkout -b branch-name
   git push branch-name
   ```
*NOTE*: branch names should use a consistent pattern, though I haven't yet decided what that is. Some options:
- the primary name should be clearly descriptive towards the outcome / change that this branch delivers
- work identifier prefixes - if using Jira this would be the issue key, or simimilar for other project managment tooling; I'm not yet using such tooling for this project (for now still just a dynamic todo.txt), but if/when I do then this is critical (checks would be built into commit hooks)
- feature/, task/, and fix/ prefixes - I'm not yet sure the distinction is useful
- datetime prefixes - YYYYMMDDHHMM - not sure this really adds anything, as branches are already timestamped


2. **Develop on the working branch**
   - Make commits as needed
   - Test locally

3. **Push and create PR**
   ```powershell
   git push origin branch-name
   ```
   - Create Pull Request to merge into `dev`

4. **Review and merge**
   - Review the PR
   - - self-review approval acceptable in a solo context
   - - make use of AI if available
   - - in a team context, no self-review approval
   - Merge into `dev` branch

   NOTE: the merge into the dev branch triggers the CI/CD pipeline to do a dev deployment (after tests pass etc.)

5. **Production releases**
   - When ready for production, create PR from `dev` → `main`
   - Production deployment triggers on merge to `main`

## Local Development Environment

see [setup_dev_environment.md](setup_dev_environment.md) if you're just starting.

## Daily Development

0. **Launch terminals (as needed)**
- one for scripts
- one for running services locally
- one for infrastructure changes
- - set the AWS_PROFILE
- one for git work
- one for front-end-only development
- one for manual deployments
- - get AWS login

1. **Start development environment (in scripts terminal)**
   ```powershell
   .\scripts\start-dev-resources.ps1
   ```
This spins up all the AWS resources needed.

2. **Setup local services (in local services terminal)**
   ```powershell
   # From project root
   docker-compose build
   docker-compose up
   ```
The build command is only really needed if things have changed since you last ran the app locally.

if needed, start frontend (in separate terminal) - this is useful when doing pure front-end work
   ```powershell
   cd frontend
   npm start
   ```

4. **Stop development environment (in scripts terminal)**
   ```powershell
   .\scripts\stop-dev-resources.ps1
   ```
This spins down all the AWS resources that incur on-going, passive costs

## Testing

### Backend Testing
```powershell
cd backend
npm test
```

### Frontend Testing
```powershell
cd frontend
npm test
```

### End-to-End Testing
- TBD, but in principle....
- - E2E tests run as part of CI/CD pipeline
- - Local E2E testing setup also

# CI/CD Pipeline

## Development Pipeline
- Triggers on: merge to `dev`
- Actions: build, test, deploy to dev environment

## Production Pipeline
- Triggers on: manual trigger
- Actions: build, test, deploy to production environment

## Database Migrations
- Automated via ops-lambda during deployment
- Manual local migration scripts available in `scripts/`

## Manual Deployment

Typically deployments happen via the CI/CD Pipeline, but sometimes you need to do manual deployments (e.g. to test things out when working on that pipeline, or to debug the pipeline). Also, the manual process illustrates that the pipelines are doing automaticallys.

TODO: add deployment steps here

# Troubleshooting

## Common Issues

1. **Database connection issues**
   - Verify Docker containers are running
   - Check `.env` configuration
   - Ensure migrations have been run

2. **AWS authentication issues**
   - Verify AWS CLI is configured
   - Check IAM permissions
   - Ensure correct AWS profile is active

3. **Build failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

