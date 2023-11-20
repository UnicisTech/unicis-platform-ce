# Use the official Node.js image as the base image
FROM node:18.18.2

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Set up database schema
# RUN npx prisma db push

# Copy the entire application to the working directory
COPY . .

# Expose the port on which your Next.js app will run
EXPOSE 4002

# Set the DATABASE_URL environment variable
# ENV DATABASE_URL="postgresql://platform:7emp1eAppe4rance5Rang3I5BNOffice@db.unicis.tech/unicis_platform?schema=platform"
# DEV DB -> ENV DATABASE_URL=postgresql://unicis_platform_dev:7emp1eAppe4rance5Rang3I5BNOffice-dev@srv-captain--db-dev:5432/unicis_platform_dev?sslmode=prefer

ARG NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ARG NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ARG SMTP_HOST=${SMTP_HOST}
ENV SMTP_HOST=${SMTP_HOST}
ARG SMTP_PORT=${SMTP_PORT}
ENV SMTP_PORT=${SMTP_PORT}
ARG SMTP_USER=${SMTP_USER}
ENV SMTP_USER=${SMTP_USER}
ARG SMTP_PASSWORD=${SMTP_PASSWORD}
ENV SMTP_PASSWORD=${SMTP_PASSWORD}
ARG SMTP_FROM=${SMTP_FROM}
ENV SMTP_FROM=${SMTP_FROM}
ARG DATABASE_URL=${DATABASE_URL}
ENV DATABASE_URL=${DATABASE_URL}
ARG APP_URL=${APP_URL}
ENV APP_URL=${APP_URL}
ARG SVIX_URL=${SVIX_URL}
ENV SVIX_URL=${SVIX_URL}
ARG SVIX_API_KEY=${SVIX_API_KEY}
ENV SVIX_API_KEY=${SVIX_API_KEY}
# Users will need to confirm their email before accessing the app feature
ARG CONFIRM_EMAIL=${CONFIRM_EMAIL}
ENV CONFIRM_EMAIL=${CONFIRM_EMAIL}
# Matamo
ARG NEXT_PUBLIC_MATOMO_URL=${NEXT_PUBLIC_MATOMO_URL}
ENV NEXT_PUBLIC_MATOMO_URL=${NEXT_PUBLIC_MATOMO_URL}
ARG NEXT_PUBLIC_MATOMO_SITE_ID=${NEXT_PUBLIC_MATOMO_SITE_ID}
ENV NEXT_PUBLIC_MATOMO_SITE_ID=${NEXT_PUBLIC_MATOMO_SITE_ID}


# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
