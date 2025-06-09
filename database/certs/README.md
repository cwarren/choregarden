# Database SSL Certificates

This folder is used for local development SSL certificates for Postgres. This means that the local development environment more closely matches the deployed application environment.

## Files
- `server.crt`: Self-signed certificate for local Postgres SSL (DO NOT COMMIT to source control)
- `server.key`: Private key for local Postgres SSL (DO NOT COMMIT to source control)
- `copy-certs-and-start.sh`: Script to copy certs, set permissions, and start Postgres with SSL in Docker Compose

## How to generate
1. You need to have openssl installed (don't forget to add it to your path too)
2. $ openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key -subj "/CN=localhost"

## Security
**Never commit `server.key` or `server.crt` to a public repository.**

