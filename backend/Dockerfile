# Use an official Node.js runtime as the parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package*.json to the container
COPY package*.json ./

# Install application dependencies inside the container
RUN npm install

# Copy the rest of the application to the container
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port 3000 
EXPOSE 3000

# Start the application in development mode
CMD [ "npm", "run", "start:dev" ]
