# GitHub OIDC Setup Instructions

This document explains how to set up GitHub OIDC authentication for the Chore Garden CI/CD pipeline.

## Prerequisites

Before setting up OIDC, you need to:

1. Deploy the infrastructure that includes the GitHub OIDC module
2. Obtain the role ARN from the Terraform outputs
3. Configure the GitHub repository with the necessary variables

## 1. Deploy Infrastructure

First, deploy the updated infrastructure to create the OIDC provider and IAM role:

```powershell
cd infrastructure\envs\dev
terraform init
terraform plan
terraform apply
```

After deployment, get the role ARN:

```powershell
terraform output github_actions_role_arn
```

## 2. Configure GitHub Repository

### Repository Variables

Set up the following repository variables in GitHub:
- Go to your repository → Settings → Secrets and variables → Actions → Variables tab
- Add these variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `AWS_ACCOUNT_ID_DEV` | Your choregarden-dev AWS account ID (12 digits) | Used for development environment role ARNs |
| `AWS_ACCOUNT_ID_PROD` | Your choregarden-prod AWS account ID (12 digits) | Used for production environment role ARNs |

**Important:** Use the dedicated environment account IDs, not your main admin account:
- **Dev environment**: Use the `choregarden-dev` AWS account ID
- **Prod environment**: Use the `choregarden-prod` AWS account ID  
- **Avoid**: Using your `cg-admin` account for application deployments

### Repository Secrets (Optional - for transition period)

During the transition, you may want to keep the existing secrets as backup:
- `DEV_AWS_ACCESS_KEY_ID` (can be removed after OIDC is working)
- `DEV_AWS_SECRET_ACCESS_KEY` (can be removed after OIDC is working)

## 3. Update GitHub Actions Workflows

The workflows have been updated to use OIDC authentication. The key changes:

### Added Permissions
```yaml
permissions:
  id-token: write   # Required for requesting the JWT
  contents: read    # Required for actions/checkout
```

### Updated AWS Credentials Step
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::${{ vars.AWS_ACCOUNT_ID_DEV }}:role/github-actions-dev
    role-session-name: github-actions-dev-deployment
    aws-region: us-east-1
```

## 4. Testing the Setup

### Test with a Simple Workflow

You can test the OIDC setup by running the development deployment workflow:

1. Go to your repository → Actions
2. Select "Deploy - Development" 
3. Click "Run workflow"
4. Select the `dev` branch
5. Click "Run workflow"

### Verify Permissions

The GitHub Actions role has been configured with these permissions:
- **S3**: Full access to the frontend bucket (`choregarden-frontend-dev`)
- **ECR**: Push/pull access to the backend repository
- **CloudFront**: Create invalidations for cache clearing
- **Terraform State**: Read/write access to state bucket (if specified)

## 5. Security Benefits

OIDC provides several security advantages over long-lived access keys:

- **No long-lived credentials**: Tokens are temporary and automatically expire
- **Fine-grained permissions**: Role can only be assumed from specific branches
- **Audit trail**: All role assumptions are logged in CloudTrail
- **Reduced attack surface**: No secrets to manage or potentially leak

## 6. Troubleshooting

### Common Issues

1. **Role assumption fails**: 
   - Verify the AWS account ID variables match your environment accounts (`AWS_ACCOUNT_ID_DEV` for choregarden-dev, `AWS_ACCOUNT_ID_PROD` for choregarden-prod)
   - Check that the repository name matches exactly (case-sensitive: `cwarren/choregarden`)
   - Ensure the branch is in the allowed list (`dev`, `main`)

2. **Permission denied errors**:
   - Check the IAM policies attached to the role
   - Verify resource ARNs in the policies match your actual resources

3. **OIDC provider not found**:
   - Ensure the infrastructure has been deployed successfully to the correct AWS account
   - Check that the OIDC provider was created in the `choregarden-dev` account

### OIDC Thumbprints

The thumbprints in the configuration (`6938fd4d98bab03faadb97b34396831e3780aea1` and `1c58a3a8518e8759bf075b76b750d4f2df264fcd`) are:
- **Public certificate fingerprints** - safe to commit to public repositories
- **Official GitHub OIDC thumbprints** - the same for all GitHub users
- **Rarely change** - only when GitHub rotates root certificates (with advance notice)
- **Used by AWS** to verify tokens actually came from GitHub

### Debug Steps

1. Check the GitHub Actions logs for detailed error messages
2. Use AWS CloudTrail to see the role assumption attempts
3. Test the role permissions using AWS CLI:
   ```powershell
   aws sts assume-role-with-web-identity `
     --role-arn arn:aws:iam::ACCOUNT_ID:role/github-actions-dev `
     --role-session-name test `
     --web-identity-token TOKEN
   ```

## 7. Future Enhancements

Consider these improvements for production:

- Add production OIDC role with separate permissions
- Implement approval workflows for production deployments
- Add notification systems for deployment status
- Set up monitoring and alerting for failed deployments

## 8. Rollback Plan

If OIDC authentication causes issues, you can temporarily revert to access keys:

1. Re-add the access key secrets to GitHub
2. Update the workflow to use the old authentication method
3. Remove the `permissions` block from the jobs
4. Debug the OIDC setup offline

The OIDC infrastructure can remain deployed without interfering with access key authentication.
