# Use the official Node.js runtime as a parent image
FROM node:18-alpine



# Create a non-root user and group early for better layer caching
RUN addgroup -g 1001 -S appgroup \
	&& adduser -S appuser -u 1001



# Set the working directory in the container
WORKDIR /app


# Change ownership of the app directory to the appuser
RUN chown -R appuser:appgroup /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# # Set environment variables
# ENV STOCK_PREDICTOR_URL=http://localhost:5000 \
# 	PORT=3000
    
# Build the TypeScript code
RUN npm run build

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]