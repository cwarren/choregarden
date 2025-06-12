# ChoreGarden Flyway Migration Lambda (Java)

This folder contains the Java-based AWS Lambda function for running Flyway database migrations in the ChoreGarden infrastructure.

- The Lambda is deployed as a container image (see Dockerfile).
- Migration scripts are downloaded from S3 at runtime.
- The Lambda is intended for use in CI/CD and production environments.

## Structure
- src/ : Java source code for the Lambda handler
- Dockerfile : Container image definition
- build.gradle : Gradle build file for dependencies
- README.md : This file
