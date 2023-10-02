# Use an official Node.js runtime as the parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy packages.json and packages-lock.json then install dependencies
COPY package*.json ./

# Install global and local npm packages
RUN npm install -g prisma && \
    npm i


# Copy the rest of your application to the container
COPY . .

# Generate Prisma client and build the application
RUN npx prisma generate && \
    npm run build

# Update and install system packages in a single layer
RUN apt-get update && apt-get install -y \
    iputils-ping \
    postgresql-client

# Expose port 3030
EXPOSE 3030

# Start the application in development mode
CMD [ "sh", "run.sh" ]
# CMD ["tail", "-f", "/dev/null"]
