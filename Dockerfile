# Use the official Node.js image as the base image
FROM node:22-bookworm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies (use lockfile if present)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Ensure native optional binaries exist in Linux Docker builds.
RUN case "$(node -p 'process.arch')" in \
    x64) npm install --no-save lightningcss-linux-x64-gnu@1.32.0 @tailwindcss/oxide-linux-x64-gnu@4.3.0 ;; \
    arm64) npm install --no-save lightningcss-linux-arm64-gnu@1.32.0 @tailwindcss/oxide-linux-arm64-gnu@4.3.0 ;; \
    *) echo "Unsupported architecture for native CSS binaries" && exit 1 ;; \
    esac

# Set up database schema
# RUN npx prisma db push

# Copy the entire application to the working directory
COPY . .

# Expose the port on which your Next.js app will run
EXPOSE 4002

# Set the DATABASE_URL environment variable

ARG NEXTAUTH_URL=http://localhost:4002
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
ARG BILLING_EMAIL=${BILLING_EMAIL}
ENV BILLING_EMAIL=${BILLING_EMAIL}
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unicis_platform
ENV DATABASE_URL=${DATABASE_URL}
ARG APP_URL=http://localhost:4002
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

# AuditLogs
ARG RETRACED_URL=${RETRACED_URL}
ENV RETRACED_URL=${RETRACED_URL}
ARG RETRACED_API_KEY=${RETRACED_API_KEY}
ENV RETRACED_API_KEY=${RETRACED_API_KEY}
ARG RETRACED_PROJECT_ID=${RETRACED_PROJECT_ID}
ENV RETRACED_PROJECT_ID=${RETRACED_PROJECT_ID}

# Team feature
ARG FEATURE_TEAM_SSO=${FEATURE_TEAM_SSO}
ENV FEATURE_TEAM_SSOL=${FEATURE_TEAM_SSO}
ARG FEATURE_TEAM_DSYNCL=${FEATURE_TEAM_DSYNC}
ENV FEATURE_TEAM_DSYNC=${FEATURE_TEAM_DSYNC}
ARG FEATURE_TEAM_AUDIT_LOG=${FEATURE_TEAM_AUDIT_LOG}
ENV FEATURE_TEAM_AUDIT_LOG=${FEATURE_TEAM_AUDIT_LOG}
ARG FEATURE_TEAM_WEBHOOK=${FEATURE_TEAM_WEBHOOK}
ENV FEATURE_TEAM_WEBHOOK=${FEATURE_TEAM_WEBHOOK}
ARG FEATURE_TEAM_API_KEY=${FEATURE_TEAM_API_KEY}
ENV FEATURE_TEAM_API_KEY=${FEATURE_TEAM_API_KEY}

# Resend
ARG RESEND_API_KEY=${RESEND_API_KEY}
ENV RESEND_FROM=${RESEND_FROM}


# Build the Next.js app and apply pending database migrations.
RUN npx prisma generate && npx prisma migrate deploy && npx tsx scripts/generate-openapi.ts && npx next build --webpack

# Remove dev dependencies for runtime
RUN npm prune --omit=dev

# Start the Next.js app
CMD ["npm", "start"]
