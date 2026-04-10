FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy all source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 8080

# Start both backend and frontend
CMD ["sh", "-c", "cd backend && node server.js & npx serve -s dist -l 8080"]