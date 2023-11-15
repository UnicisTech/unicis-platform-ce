# Use the official Node.js image as the base image
FROM node:18.18.2

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the entire application to the working directory
COPY . .

# Expose the port on which your Next.js app will run
EXPOSE 4002

# Set the DATABASE_URL environment variable
ENV VAR_NAME_HERE=${VAR_NAME_HERE}
# ENV DATABASE_URL="postgresql://platform:7emp1eAppe4rance5Rang3I5BNOffice@db.unicis.tech/unicis_platform?schema=platform"

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
