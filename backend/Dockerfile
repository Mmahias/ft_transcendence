# Use an official Node.js runtime as the parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Install Prisma globally
RUN npm install -g prisma

# Copy the application to the container
COPY . .

# Install application dependencies inside the container
RUN npm install

# Build the application
RUN npm run build

# Expose port 3030
EXPOSE 3030

# Start the application in development mode
CMD [ "sh", "run.sh" ]
