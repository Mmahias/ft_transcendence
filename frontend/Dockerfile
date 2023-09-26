FROM node:18

# Set working directory
WORKDIR /app

# Install esbuild for Linux (for cross-platforms runs)
<<<<<<< HEAD
RUN if [ "$(uname -m)" = "aarch64" ]; then npm install @esbuild/linux-arm64; else npm install @esbuild/linux-x64; fi
=======
RUN npm install @esbuild/linux-arm64
>>>>>>> b5cbb09eba67d2b70242c9d02e21c07755051dea

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
