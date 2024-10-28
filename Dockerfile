# Use the official Node.js image as a base image
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use the official Node.js image for the production environment
FROM node:18 AS production

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src 

# Copy the env file
COPY .env.production .env

# Install only production dependencies
RUN npm install --only=production

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV TWILIO_ACCOUNT_SID=""
ENV TWILIO_AUTH_TOKEN=""
ENV TWILIO_PHONE_NUMBER=""

# Start the application (changed from dev to start for production)
CMD ["npm", "start"]