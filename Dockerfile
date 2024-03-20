# Step 1: Use a Node.js base image
FROM node:20-alpine

# Accept DATABASE_URL as a build argument
ARG DATABASE_URL

# Set the DATABASE_URL environment variable
ENV DATABASE_URL=${DATABASE_URL}

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Install TypeScript globally in the image for compilation
RUN npm install -g typescript

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy Prisma schema and other necessary files
COPY prisma ./prisma
COPY . .

# Step 6: Generate Prisma Client
RUN npx prisma generate

# Optional: If your application requires compiling (e.g., TypeScript)
RUN tsc

# Step 7: Expose the port your app runs on
EXPOSE 5001

# Run Prisma migrations (Adjust this step based on your workflow)
CMD npx prisma migrate deploy && node dist/server.js
