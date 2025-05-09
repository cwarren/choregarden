# Backend Dockerfile
FROM node:20

WORKDIR /usr/src/app

# Install dependencies for the backend
COPY package.json ./
RUN npm install && npm install --save-dev @types/express @types/pg @types/cors

# Install TypeScript globally
RUN npm install -g typescript

# Copy the backend source code
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Set the port for the backend server
EXPOSE ${BACKEND_PORT}

# Start the backend server using the compiled JavaScript
CMD ["node", "dist/index.js"]