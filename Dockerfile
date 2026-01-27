FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source
COPY . .

# Expose app port
EXPOSE 8081

# Start dev server
CMD ["npm", "run", "dev"]
