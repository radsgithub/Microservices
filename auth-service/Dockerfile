# Start from official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install global Nest CLI and app dependencies
RUN npm install -g @nestjs/cli && npm install

# Copy the rest of the app

COPY . .

RUN npm run build
# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]


