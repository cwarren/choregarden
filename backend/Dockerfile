# Backend Dockerfile
FROM node:20

WORKDIR /usr/src/app

# Set NODE_ENV to production by default
ENV NODE_ENV=production

# Install dependencies for the backend
COPY package.json package-lock.json ./
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy the backend source code
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Copy .env.json and set CHOREGARDEN_SECRETS env variable
COPY .env.json /app/.env.json

# Add entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the port for the backend server
EXPOSE 5000

# Start the backend server using the compiled JavaScript
# CMD ["node", "dist/index.js"]
ENTRYPOINT ["/app/entrypoint.sh"]