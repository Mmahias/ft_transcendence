#!/bin/bash

# Stop all running containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

docker system prune -af

# Generate Prisma client
cd backend
npx prisma generate
cd ..

echo "Reset complete!"
