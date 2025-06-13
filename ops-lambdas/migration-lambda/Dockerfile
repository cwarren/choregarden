# Stage 1: Build the JAR using Gradle
FROM gradle:8.7.0-jdk21 AS builder
WORKDIR /build
COPY . .
RUN gradle shadowJar --no-daemon

# Stage 2: Lambda runtime image
FROM public.ecr.aws/lambda/java:21

# Install unzip using microdnf
RUN microdnf install -y unzip

# Unzip the build/distributions ZIP so classes are at the root and dependencies in lib/
COPY build/distributions/migration-lambda-1.0-SNAPSHOT.zip /tmp/
RUN unzip /tmp/migration-lambda-1.0-SNAPSHOT.zip -d ${LAMBDA_TASK_ROOT}

# Set the default handler (update to your actual handler class if different)
CMD ["com.choregarden.migrationlambda.MigrationHandler"]
