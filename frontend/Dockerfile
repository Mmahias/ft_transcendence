FROM node:18

# Set working directory
WORKDIR /app

# First, copy over files that are less likely to change.
# This ensures that the subsequent npm install will only re-run 
# if these files change (i.e., dependencies change)
COPY package*.json .

# Install the dependencies
RUN npm install

# Install esbuild for Linux (for cross-platforms runs)
RUN if [ "$(uname -m)" = "aarch64" ]; then npm install @esbuild/linux-arm64; else npm install @esbuild/linux-x64; fi

# Now, put commands that might change more frequently later in the Dockerfile

# Update the package lists for upgrades and new packages
RUN apt-get update

# Install ping and curl in a single layer to reduce the total number of layers
RUN apt-get install -y iputils-ping curl

# Copy the rest of your app to the container
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
