FROM node:18

# Set working directory
WORKDIR /app

COPY package*.json ./

# Install global and local npm packages
RUN npm i

# Install esbuild for Linux (for cross-platforms runs)
RUN if [ "$(uname -m)" = "aarch64" ]; then npm install @esbuild/linux-arm64; else npm install @esbuild/linux-x64; fi

# Install ping and curl in a single layer to reduce the total number of layers
RUN apt-get update && \
  apt-get install -y iputils-ping curl

RUN npm install -g vite

# Copy the rest of your app to the container
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the application
CMD ["npm", "start"]

# CMD ["tail", "-f", "/dev/null"]

