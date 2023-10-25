# Utiliser l'image Node 18
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les packages npm localement
RUN npm i

# Installer esbuild pour Linux (pour une exécution multi-plateformes)
RUN if [ "$(uname -m)" = "aarch64" ]; then npm install @esbuild/linux-arm64; else npm install @esbuild/linux-x64; fi

# Installer ping et curl en une seule couche pour réduire le nombre total de couches
RUN apt-get update && \
  apt-get install -y iputils-ping curl

# Installer Vite globalement
RUN npm install -g vite

# Copier le reste de votre application dans le conteneur
COPY . .

# Assurez-vous que le script start.sh est exécutable
RUN chmod +x /app/start.sh

# Exposer le port 3001
EXPOSE 3001

# Démarrer l'application en utilisant le script start.sh
CMD [ "sh", "/app/start.sh" ]
