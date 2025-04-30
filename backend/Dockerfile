# Backend Dockerfile
FROM node:20

WORKDIR /usr/src/app

# Install dependencies for the backend
COPY package.json ./
RUN npm install

# Copy the backend source code
COPY . .

# Set the port for the backend server
EXPOSE ${BACKEND_PORT}

# Start the backend server
CMD ["npm", "start"]