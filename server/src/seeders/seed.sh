#!/bin/bash

# Database credentials
USER="root"
PASSWORD=""
DATABASE="shifty"

SQL_DIR="./src/seeders"

# Find all .sql files in the directory, excluding this script, sort them, and execute them
for file in $(find "$SQL_DIR" -type f -name "*.sql" | sort)
do
    echo "Executing $file..."
    mysql -u $USER -p$PASSWORD $DATABASE < "$file"
    if [ $? -ne 0 ]; then
        echo "Error executing $file. Exiting..."
        exit 1
    fi
done

echo "All SQL files executed successfully."

