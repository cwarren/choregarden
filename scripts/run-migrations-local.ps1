# PowerShell script to run Flyway migrations against the local Postgres DB using Docker
# Loads DB connection info from the top-level .env file

# Load .env variables
$envVars = Get-Content "$PSScriptRoot/../.env" | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    @{ Key = $parts[0].Trim(); Value = $parts[1].Trim() }
}
$envMap = @{}
foreach ($item in $envVars) { $envMap[$item.Key] = $item.Value }

$DB_NAME = $envMap['POSTGRES_DB']
$DB_USER = $envMap['POSTGRES_USER']
$DB_PASS = $envMap['POSTGRES_PASSWORD']

if (-not $DB_NAME -or -not $DB_USER -or -not $DB_PASS) {
    Write-Host "Could not find required DB variables in .env."
    exit 1
}

# Run Flyway Docker image
Write-Host "Running Flyway migrations against local Postgres DB: $DB_NAME as $DB_USER..."
$migrationsPath = "$PSScriptRoot/../database/migrations"
Write-Host "Looking for migrations in: $migrationsPath"
docker run --rm -v "${migrationsPath}:/flyway/sql" flyway/flyway:10 `
    -url="jdbc:postgresql://host.docker.internal:5432/$DB_NAME" `
    -user="$DB_USER" `
    -password="$DB_PASS" `
    -connectRetries=2 migrate
