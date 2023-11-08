# Use the official Node.js image as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the entire application to the working directory
COPY . .

# Expose the port on which your Next.js app will run
EXPOSE 3000

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
