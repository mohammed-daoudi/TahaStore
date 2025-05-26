# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy all backend code
COPY . .

# Install dependencies for each service
WORKDIR /app/auth-service
RUN npm install

WORKDIR /app/produits-service
RUN npm install

WORKDIR /app/commande-service
RUN npm install

# Install concurrently to run all services in one container
WORKDIR /app
RUN npm install -g concurrently

# Expose ports (adjust if needed)
EXPOSE 4000 4001 4002

# Run all services using concurrently
CMD concurrently \
  "node auth-service/index.js" \
  "node produits-service/index.js" \
  "node commande-service/index.js"
