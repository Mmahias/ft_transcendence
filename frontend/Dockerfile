# # Base Image
# FROM node:18-alpine AS builder

# # Set the working directory
# WORKDIR /usr/src/app

# # Copy the package.json and package-lock.json files
# COPY package*.json ./

# # Install the dependencies
# RUN npm ci

# # Copy the rest of your app's source code from your host to your image filesystem.
# COPY . .

# # Create the production build of your app
# RUN npm run build

# # Start a new stage with nginx to serve the static files
# FROM nginx:1.24.0-alpine

# # Set the environment to production
# ENV NODE_ENV production

# # Copy the static build files from the builder stage
# COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# # Make sure assets are readable by nginx
# RUN chmod -R 755 /usr/share/nginx/html

# # If you have SSL
# # COPY ./security/cert.pem /etc/nginx/ssl/cert.pem
# # COPY ./security/cert.key /etc/nginx/ssl/cert.key

# # Copy nginx configuration (if you have custom settings)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # CMD ["nginx", "-g", "daemon off;"]
# CMD ["nginx -g 'daemon off;' & npm start"]
# Utilisez une image de node.js
FROM node:14

# Définissez le répertoire de travail dans l'image
WORKDIR /app

# Copiez le package.json et le package-lock.json dans le conteneur
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez les fichiers de l'application dans le conteneur
COPY . .

# Construisez l'application React pour la production
RUN npm run build

# Exposez le port sur lequel votre application écoute
EXPOSE 3000

# Commande pour démarrer l'application React
CMD ["npm", "start"]
