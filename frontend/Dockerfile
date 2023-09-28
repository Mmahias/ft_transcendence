FROM node:18

# Set working directory
WORKDIR /app

# Install esbuild for Linux (for cross-platforms runs)
RUN if [ "$(uname -m)" = "aarch64" ]; then npm install @esbuild/linux-arm64; else npm install @esbuild/linux-x64; fi

# Copy only the essential files
COPY package.json .

# Install the dependencies
RUN npm install

# Copy the rest of your app to the container
COPY . .

# Expose port 3001
EXPOSE 3001

CMD ["tail", "-f", "/dev/null"]


# Start the application
# CMD ["npm", "start"]
