package com.choregarden.migrationlambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;
import org.flywaydb.core.Flyway;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.List;

public class MigrationHandler implements RequestHandler<Object, String> {
    private static final String S3_BUCKET = System.getenv("MIGRATION_S3_BUCKET");
    private static final String S3_PREFIX = System.getenv("MIGRATION_S3_PREFIX");
    private static final String RDS_ENDPOINT = System.getenv("RDS_ENDPOINT");
    private static final String DB_SECRET_ARN = System.getenv("DB_SECRET_ARN");

    @Override
    public String handleRequest(Object input, Context context) {
        LambdaLogger logger = context.getLogger();
        try {
            logger.log("Starting migration lambda\n");
            // Download migration scripts from S3
            File migrationDir = new File("/tmp/migrations");
            migrationDir.mkdirs();
            AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();
            List<S3ObjectSummary> objects = s3.listObjectsV2(S3_BUCKET, S3_PREFIX).getObjectSummaries();
            for (S3ObjectSummary obj : objects) {
                String key = obj.getKey();
                if (key.endsWith(".sql")) {
                    S3Object s3obj = s3.getObject(S3_BUCKET, key);
                    File outFile = new File(migrationDir, key.substring(S3_PREFIX.length()));
                    outFile.getParentFile().mkdirs();
                    try (InputStream in = s3obj.getObjectContent(); FileOutputStream out = new FileOutputStream(outFile)) {
                        byte[] buf = new byte[8192];
                        int len;
                        while ((len = in.read(buf)) > 0) out.write(buf, 0, len);
                    }
                }
            }
            logger.log("Downloaded migration scripts from S3\n");
            // Fetch DB credentials from Secrets Manager
            AWSSecretsManager secretsManager = AWSSecretsManagerClientBuilder.defaultClient();
            GetSecretValueRequest getSecretValueRequest = new GetSecretValueRequest().withSecretId(DB_SECRET_ARN);
            GetSecretValueResult getSecretValueResult = secretsManager.getSecretValue(getSecretValueRequest);
            JSONObject secretJson = new JSONObject(getSecretValueResult.getSecretString());
            String dbUser = secretJson.getString("username");
            String dbPass = secretJson.getString("password");
            String dbName = secretJson.getString("dbname");
            // Build JDBC URL
            String jdbcUrl = "jdbc:postgresql://" + RDS_ENDPOINT + ":5432/" + dbName;
            // Run Flyway
            Flyway flyway = Flyway.configure()
                    .dataSource(jdbcUrl, dbUser, dbPass)
                    .locations("filesystem:/tmp/migrations")
                    .load();
            flyway.migrate();
            logger.log("Migration complete\n");
            return "Migration successful";
        } catch (Exception e) {
            logger.log("Migration failed: " + e.getMessage() + "\n");
            throw new RuntimeException(e);
        }
    }
}
