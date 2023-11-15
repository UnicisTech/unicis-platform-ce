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
# ENV DATABASE_URL="postgresql://platform:7emp1eAppe4rance5Rang3I5BNOffice@db.unicis.tech/unicis_platform?schema=platform"
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV SMTP_HOST=${SMTP_HOST}
ENV SMTP_PORT=${SMTP_PORT}
ENV SMTP_USER=${SMTP_USER}
ENV SMTP_PASSWORD=${SMTP_PASSWORD}
ENV SMTP_FROM=${SMTP_FROM}
ENV DATABASE_URL=${DATABASE_URL}
ENV APP_URL=${APP_URL}
ENV SVIX_URL=${SVIX_URL}
ENV SVIX_API_KEY=${SVIX_API_KEY}

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
