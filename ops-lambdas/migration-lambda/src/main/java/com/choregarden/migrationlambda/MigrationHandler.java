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

import javax.sql.DataSource;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
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
            // Use the migration (admin) user for migrations
            String dbUser = secretJson.getString("POSTGRES_USER");
            String dbPass = secretJson.getString("POSTGRES_PASSWORD");
            String dbName = secretJson.getString("POSTGRES_DB");
            // Build JDBC URL
            String jdbcUrl = "jdbc:postgresql://" + RDS_ENDPOINT + "/" + dbName;

            // Log JDBC URL (mask password) and username for debugging
            logger.log("JDBC URL: " + jdbcUrl + "\n");
            logger.log("DB User: " + dbUser + "\n");

            // Explicitly load PostgreSQL JDBC driver with error handling
            try {
                Class.forName("org.postgresql.Driver");
                logger.log("PostgreSQL JDBC driver loaded successfully\n");
            } catch (ClassNotFoundException e) {
                logger.log("PostgreSQL JDBC driver not found: " + e.getMessage() + "\n");
                return "Migration failed: PostgreSQL JDBC driver not found";
            }

            // Flyway has issues building the connection string with the driver name, so we use a direct connection
            logger.log("Attempting to connect to the database\n");
            try (java.sql.Connection conn = java.sql.DriverManager.getConnection(jdbcUrl, dbUser, dbPass)) {
                if (conn.isValid(2)) {
                    logger.log("Database connection is valid\n");
                    // Run Flyway using the existing connection via DataSource
                    Flyway flyway = Flyway.configure()
                            .dataSource(new SingleConnectionDataSource(conn))
                            .locations("filesystem:/tmp/migrations")
                            .load();
                    flyway.migrate();
                    logger.log("Migration complete\n");
                    return "Migration successful";
                } else {
                    logger.log("Database connection is invalid\n");
                    return "Migration failed: Invalid database connection";
                }
            } catch (Exception e) {
                logger.log("Database connection error or migration failure: " + e.getMessage() + "\n");
                return "Migration failed: Database connection error or migration failure";
            }
        } catch (Exception e) {
            logger.log("Migration failed: " + e.getMessage() + "\n");
            throw new RuntimeException(e);
        }
    }

    // Simple DataSource wrapper for a single Connection
    static class SingleConnectionDataSource implements DataSource {
        private final Connection conn;
        public SingleConnectionDataSource(Connection conn) { this.conn = conn; }
        @Override public Connection getConnection() { return conn; }
        @Override public Connection getConnection(String u, String p) { return conn; }
        // The following methods are not needed for Flyway and can throw UnsupportedOperationException
        @Override public <T> T unwrap(Class<T> iface) { throw new UnsupportedOperationException(); }
        @Override public boolean isWrapperFor(Class<?> iface) { throw new UnsupportedOperationException(); }
        @Override public java.io.PrintWriter getLogWriter() { throw new UnsupportedOperationException(); }
        @Override public void setLogWriter(java.io.PrintWriter out) { throw new UnsupportedOperationException(); }
        @Override public void setLoginTimeout(int seconds) { throw new UnsupportedOperationException(); }
        @Override public int getLoginTimeout() { throw new UnsupportedOperationException(); }
        @Override public java.util.logging.Logger getParentLogger() { throw new UnsupportedOperationException(); }
    }
}
