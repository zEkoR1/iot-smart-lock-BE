# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate Prisma client
RUN node ./node_modules/prisma/build/index.js generate

# Build the TypeScript code
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim

WORKDIR /app

# Install OpenSSL, which is good practice for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma client and schema
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"] 