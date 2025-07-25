# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Chore Garden project.

## Workflows

### `ci-tests.yml` - CI Tests

Runs all tests (backend and frontend) for quality assurance.

**Triggers:**
- Pull Requests to `dev` or `main`
- Pushes to `dev` or `main`
- Manual workflow dispatch 

To manually run tests:
- GitHub UI: Go to Actions → "CI - Tests" → "Run workflow" → Select branch → "Run workflow"
- GitHub CLI: gh workflow run "CI - Tests" --ref branch-name

**Purpose:** Validate code quality before any deployment

### `deploy-dev.yml` - Development Deployment

Deploys to the development environment after successful tests.

**Triggers:**
- Automatically when `ci-tests.yml` completes successfully on `dev` branch

**Purpose:** Continuous deployment to development environment

### `deploy-prod.yml` - Production Deployment

Deploys to the production environment (manual trigger only).

**Triggers:**
- Manual workflow dispatch only

**Purpose:** Controlled production deployment

## Development Workflow

1. **Create feature branch** from `dev`
2. **Develop and commit** changes
3. **Create PR** to `dev` branch
   - ✅ Triggers: `ci-tests.yml` runs tests
   - 🚫 No deployments
4. **Merge PR** into `dev`
   - ✅ Triggers: `ci-tests.yml` runs tests
   - ✅ Then: `deploy-dev.yml` deploys to development (if tests pass)
   - 🚀 Automatically deploys to development environment

## Production Deployment

Production deployments are **manual only** for safety and control.

**Via GitHub UI:**
1. Go to repository → Actions tab
2. Select "Deploy - Production" workflow
3. Click "Run workflow" button
4. Select branch (typically `main` for production)
5. Click "Run workflow"

**Via GitHub CLI:**
```bash
gh workflow run "Deploy - Production" --ref main
```

**What runs:**
- All production deployment jobs run (frontend, backend, database)
- Note: Tests are not automatically run as part of production deployment
- Ensure recent tests have passed before triggering production deployment

## Jobs Overview

### CI Tests (`ci-tests.yml`)
| Job | Purpose |
|-----|---------|
| `test` | Run backend and frontend tests with temporary PostgreSQL |

### Development Deployment (`deploy-dev.yml`)
| Job | Purpose | Status |
|-----|---------|--------|
| `deploy-frontend-dev` | Deploy frontend to dev S3 bucket | ✅ **Active** |
| `deploy-backend-dev` | Deploy backend to dev ECS | 🚧 **Placeholder** |
| `deploy-db-dev` | Run database migrations on dev | 🚧 **Placeholder** |

### Production Deployment (`deploy-prod.yml`)
| Job | Purpose | Status |
|-----|---------|--------|
| `deploy-frontend-prod` | Deploy frontend to prod S3 bucket | 🚧 **Placeholder** |
| `deploy-backend-prod` | Deploy backend to prod ECS | 🚧 **Placeholder** |
| `deploy-db-prod` | Run database migrations on prod | 🚧 **Placeholder** |

#### Authentication

**GitHub OIDC (OpenID Connect)**

The workflows use GitHub OIDC for secure, temporary authentication with AWS:

- **No long-lived credentials**: Temporary tokens are issued for each workflow run
- **Branch restrictions**: Only specified branches can assume the deployment roles
- **Fine-grained permissions**: Each environment has its own IAM role with minimal required permissions
- **Audit trail**: All authentication attempts are logged in AWS CloudTrail

**Setup Requirements:**
1. Deploy the `iam_github_oidc` Terraform module (included in dev environment)
2. Set the `AWS_ACCOUNT_ID_DEV` and `AWS_ACCOUNT_ID_PROD` repository variables
3. Ensure your repository and branch names match the OIDC trust policy

For detailed setup instructions, see: `infrastructure/modules/iam_github_oidc/README.md`

#### Required Secrets and Variables

The workflows require these secrets and variables to be configured in repository settings:

**Repository Variables (Settings → Secrets and variables → Actions → Variables):**
- `AWS_ACCOUNT_ID_DEV` - Your choregarden-dev AWS account ID (12 digits, used for dev deployments)
- `AWS_ACCOUNT_ID_PROD` - Your choregarden-prod AWS account ID (12 digits, used for prod deployments)

**Testing (`ci-tests.yml`):**
- `POSTGRES_USER` - Test database username (secret)
- `POSTGRES_PASSWORD` - Test database password (secret)
- `POSTGRES_DB` - Test database name (secret)

**Development Deployments (`deploy-dev.yml`):**
- Uses GitHub OIDC to assume IAM role: `github-actions-dev`
- No long-lived AWS credentials required

**Production Deployments (`deploy-prod.yml`):** (TBD)
- Production OIDC role will be: `github-actions-prod` (when implemented)

#### Workflow Dependencies

- `deploy-dev.yml` depends on successful completion of `ci-tests.yml` on `dev` branch
- `deploy-prod.yml` runs independently (manual trigger only)
- All workflows can be triggered manually via workflow dispatch if needed

#### Current Implementation Status

| Component | Dev Deployment | Prod Deployment |
|-----------|----------------|-----------------|
| Frontend | ✅ **Active** - S3 sync + Terraform config update | 🚧 **Placeholder** |
| Backend | 🚧 **Placeholder** | 🚧 **Placeholder** |
| Database | 🚧 **Placeholder** | 🚧 **Placeholder** |

#### Deployment Architecture

**Development Environment:**
- Frontend: S3 bucket `choregarden-frontend-dev`
- Backend: ECS service (TBD)
- Database: RDS instance with migrations via ops-lambda (TBD)

**Production Environment:**
- Frontend: TBD
- Backend: TBD  
- Database: TBD

#### Troubleshooting

**Common Issues:**

1. **Tests failing**: Check `ci-tests.yml` job logs
2. **Dev deployment not triggering**: Ensure tests passed successfully on dev branch
3. **AWS permissions**: Verify secrets are correctly configured
4. **Terraform errors**: Check AWS credentials and Terraform state
5. **Manual prod trigger not working**: Ensure you have appropriate repository permissions

**Debugging Steps:**
1. Check the Actions tab for detailed logs of each workflow
2. Verify all required secrets are configured
3. Ensure AWS credentials have necessary permissions
4. For dev deployments, confirm the tests workflow completed successfully first
5. Check for any infrastructure changes that might affect deployment

#### Benefits of This Structure

- **Clear separation**: Each workflow has a single responsibility
- **Efficient**: Tests run once, multiple deployments can reference results
- **Safe**: Production deployments are completely separate and manual-only
- **Maintainable**: Test logic is defined once, not duplicated
- **Scalable**: Easy to add new environments (staging, UAT, etc.)
- **Secure**: Uses GitHub OIDC for AWS authentication (no long-lived credentials)

#### Future Enhancements

- Implement backend deployment automation
- Implement database migration automation  
- Add production environment configuration
- Add deployment notifications (Slack, email)
- Add rollback capabilities
- Add deployment approval gates
- Add staging environment workflows
