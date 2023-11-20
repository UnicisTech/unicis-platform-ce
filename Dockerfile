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
ENV NEXTAUTH_URL=http://dev.platform.unicis.tech
ENV NEXTAUTH_SECRET=3Ala9FTcgaUG2y4kYvKaeo2E04kmQyMeaWZb7cXSewg=
ENV SMTP_HOST=unicis.tech
ENV SMTP_PORT=587
ENV SMTP_USER=dev@unicis.tech
ENV SMTP_PASSWORD=pdmT6R6m9nCmhuzzcKgaRt7DZJ8FC
ENV SMTP_FROM=dev@unicis.tech
ENV DATABASE_URL=postgresql://platform:7emp1eAppe4rance5Rang3I5BNOffice@db.unicis.tech/unicis_platform?schema=platform
ENV APP_URL=http://dev.platform.unicis.tech
ENV SVIX_URL=https://api.eu.svix.com
ENV SVIX_API_KEY=testsk_CYQgpc0x7u_q6Vndh4DGD43lvB2OW5Z1.eu
ENV NEXT_PUBLIC_TERMS_URL='https://www.unicis.tech/terms'
ENV NEXT_PUBLIC_PRIVACY_URL='https://www.unicis.tech/privacy'

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
