# Development Environment Setup

This document provides a comprehensive guide for setting up your local development environment for Chore Garden.

## Service Prerequisites

### AWS

- AWS root account
- Create an admin account (while not strictly required, this is best practice)
- - grant that admin account broad privileges
- - logout from your root account then login with that admin account
- Create an organization
- add the management account (if not auto-added via organization creation)
- create organization accounts for dev and production

### GitHub

- a GitHub account
- ideally, Copilot enabled for your account
- access to the repo for your project (the existing choregarden project, or a clone)
- branch protection in place for main and dev branches
- set up github secrets (needed for ci-cd pipelines)
- - POSTGRES_USER
- - POSTGRES_PASSWORD
- - POSTGRES_DB
- - DEV_AWS_ACCESS_KEY
- - DEV_AWS_SECRET_ACCESS_KEY
- - PROD_AWS_ACCESS_KEY
- - PROD_AWS_SECRET_ACCESS_KEY

### Feature Flagging  / Segmentation (TBD)

### Payment Processing (TBD)

## Local Prerequisites

Install the following tools before setting up the project:
- **nvm (1.2.2)** - for managing node installations
- **node (22.13.1)** - for running tools and code
- **npm (10.9.2)** - for testing, builds, etc.
- **docker (25.0.3, build 4debf41)** - for containerization
- **docker-compose (v2.24.6-desktop.1)** - for running everything locally
- **aws cli (aws-cli/2.27.12 Python/3.13.3 Windows/11 exe/AMD64)** - for debugging/inspection, dev session scripts, and manual deployments
- **terraform (Terraform v1.11.4 on windows_386)** - to manage infrastructure (requires AWS provider version 5.44.0+)
- **openssl (3.5.0 8 Apr 2025 (Library: OpenSSL 3.5.0 8 Apr 2025))** - to create local cert for the DB
- **DBeaver (25.1.0.202506071005)** - gui utility for database interactions
- **git (2.47.1.windows.2)** - for source control

Recommended:
- **IDE** - VSCode
- **AI Coding Assistant** - GitHub Copilot

### Prereq Configuration

#### git configuration

1. Configure your username and email.
```powershell
  git config --global user.name "Your Name"
  git config --global user.email "your_email@example.com"
```

2. Set up ssh keys for simple command-line access - see https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account


3. Configure your local git to automatically set upstream branches for new branches:

```powershell
git config --global push.autoSetupRemote true
```

This avoids the "fatal: The current branch has no upstream branch" error when pushing new branches. Alternative approaches exist (like `git push --set-upstream origin branch-name` per branch), but this global configuration is the most convenient.

#### aws cli configuration

Set up your AWS credentials and profile - see https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

`output = json`

Set up profiles for 
* your admin account
* your organization -dev account
* your organization -prod account

#### local env configuration

* top-level .env
* /backend .env

NOTE: the database name (cgprime) and user (pgadmin) are semi-sensitive info. They're defined in .env, but also (as of 2025/07) hard-coded in main.tf. If you want to use a different name and user, don't forget to update main.tf as well.

#### local db cert configuration

see [/database/certs/README.md](/database/certs/README.md)

#### DBeaver configuration for local DB

1. you first need the db cert set (see previous step), and then need the local database running (see Run Local Services below).
2. start DBeaver
3. navigate to Database > New Database Connection
4. choose PostgreSQL
5. click Next (lower right)
6. fill in connection setting properties
* Main tab
* * connect by: Host (default)
* * URL: jdbc:postgresql://localhost:5432/cgprime (note: this is read-only - here as a validation check)
* * Host: localhost
* * Port: 5432
* * Database: cgprime
* * Authentication: Database Native
* * Username: pgadmin (note: this is the DB admin user, not the application user)
* * Password: <whatever you set in your local env>
* * Advanced - leave blank
* PostgreSQL tab
* * no changes here; leave all unchecked / default
* Driver Properties tab
* * no changes here; leave all unchecked / default
* SSH tab
* * no changes here; leave all unchecked / default
* SSL tab
* * no changes here; leave all unchecked / default

#### DBeaver configuration for dev deployed DB

This is a bit different than the local connection because you have to set up a SSH tunnel through a bastion. Also, this requires a successful dev deployment first, and that the deployed database is running, and that the dev bastion is running.

TODO: fill in steps here

## Initial Setup

### 1. Clone Repository

```powershell
git clone https://github.com/cwarren/choregarden.git
cd choregarden
cp sample.env .env
# Edit .env with your local configuration
```

### 2. Setup Backend

```powershell
cd backend
cp sample.env .env
# Edit .env with your local configuration
npm install
```

### 3. Setup Frontend

```powershell
cd ../frontend
npm install
```

### 4. Run Local Services

```powershell
# From project root
docker-compose build
docker-compose up
```

### 5. Run Local Migrations

```powershell
# Use migration script
.\scripts\run-migrations-local.ps1
```

## Next Steps

After completing the setup:

1. **Review the [Development Workflow](./development_workflow.md)** for branch strategy and daily development processes
2. **Check the [Architecture Overview](./architecture.md)** to understand the system structure
3. **Explore component-specific documentation** in each service's `/documentation/` folder

