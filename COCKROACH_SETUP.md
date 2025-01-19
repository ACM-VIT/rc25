# CockroachDB Changefeed Setup Guide
## Prerequisites

CockroachDB Cluster: A running CockroachDB instance
SQL CLI Client: The CockroachDB cockroach sql CLI tool for database interaction
Database Credentials: Access to the following:

Host
Port
Username
Password
Database name

Webhook URL: Your webhook endpoint for integration

## Setup Instructions
1. Connect to CockroachDB
Connect to your database using the CockroachDB SQL CLI. Replace the placeholder values with your actual credentials:
```bash
cockroach sql --host=<DB_HOST> --port=<DB_PORT> --user=<DB_USER> --database=<DB_NAME>
Note: If your database requires authentication, include the --password flag and enter your password when prompted.
 ```
2. Create the Changefeed
Once connected, execute the following SQL command to create the changefeed. Replace <WEBHOOK_URL> with your webhook endpoint:
```bash
CREATE CHANGEFEED FOR TABLE "Team"
INTO 'webhook-<WEBHOOK_URL>/api/changefeed'
WITH resolved = '20s', updated;
```
3. Verify the Configuration
Confirm your changefeed setup by running:
```bash
SHOW CHANGEFEEDS;
```
This command displays all active changefeeds along with their configurations and targets.
4. Exit the CLI
When finished, exit the SQL CLI:
```bash
\q
```
Important Notes
⚠️ Avoid Duplicate Changefeeds: Do not execute the CREATE CHANGEFEED command multiple times for the same table and webhook combination, as this may result in duplicate data being sent to your webhook.