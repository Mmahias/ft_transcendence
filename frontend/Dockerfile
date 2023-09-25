FROM node:18

# Set working directory
WORKDIR /app

# Install esbuild for Linux (for cross-platforms runs)
RUN npm install @esbuild/linux-arm64

# Copy only the essential files
COPY package.json .

# Install the dependencies
RUN npm install

# Copy the rest of your app to the container
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
