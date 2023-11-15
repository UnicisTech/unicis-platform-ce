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
ENV NEXTAUTH_URL=http://dev.platform.unicis.tech:4002
ENV NEXTAUTH_SECRET=3Ala9FTcgaUG2y4kYvKaeo2E04kmQyMeaWZb7cXSewg=
ENV SMTP_HOST=unicis.tech
ENV SMTP_PORT=587
ENV SMTP_USER=info@unicis.tech
ENV SMTP_PASSWORD=Ch!n@5Y€51nflu3nceD3v€1opingCh!n@s
ENV SMTP_FROM=info@unicis.tech
ENV DATABASE_URL=postgresql://platform:7emp1eAppe4rance5Rang3I5BNOffice@db.unicis.tech/unicis_platform?schema=platform
ENV APP_URL=http://dev.platform.unicis.tech:4002
ENV SVIX_URL=https://api.eu.svix.com
ENV SVIX_API_KEY=testsk_CYQgpc0x7u_q6Vndh4DGD43lvB2OW5Z1.eu

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
