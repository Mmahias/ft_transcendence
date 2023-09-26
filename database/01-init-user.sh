#!/bin/bash
set -e

# Detect M1 Mac
if [[ $(uname -m) == "arm64" ]]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
       CREATE USER testuser;
    EOSQL
else
    echo "Not running on an M1 Mac. Skipping script execution."
fi
