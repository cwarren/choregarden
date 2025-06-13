# ---- Build Stage ----
FROM gradle:8.7.0-jdk21 AS build
WORKDIR /workspace
COPY . .
RUN gradle clean build --no-daemon

# ---- Lambda Runtime Stage ----
FROM public.ecr.aws/lambda/java:21
RUN microdnf install -y unzip

COPY --from=build /workspace/build/distributions/migration-lambda-1.0-SNAPSHOT.zip /tmp/
RUN unzip /tmp/migration-lambda-1.0-SNAPSHOT.zip -d ${LAMBDA_TASK_ROOT}

CMD ["com.choregarden.migrationlambda.MigrationHandler"]
