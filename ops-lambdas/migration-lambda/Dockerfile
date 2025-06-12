FROM public.ecr.aws/lambda/java:21

# Copy build artifacts
COPY build/libs/migration-lambda-1.0-SNAPSHOT-all.jar ${LAMBDA_TASK_ROOT}/app.jar

# Set the CMD to your handler (package.ClassName::methodName)
CMD ["com.choregarden.migrationlambda.MigrationHandler::handleRequest"]
