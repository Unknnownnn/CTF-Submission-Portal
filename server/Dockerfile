FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies as root (image default)
RUN npm install --production=false

# Copy application files
COPY . .

# Prepare data directories and set ownership for the non-root 'node' user
RUN mkdir -p /data/submissions && chown -R node:node /data /app
USER node

EXPOSE 5000

CMD ["npm", "start"]
