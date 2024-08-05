FROM node:21.6.1

# Set the working directory for the application
WORKDIR /app

# Copy package.json and package-lock.json files for API and install dependencies
COPY api/package*.json ./api/
RUN cd api && npm install

# Copy package.json and package-lock.json files for client and install dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 3000 8080

# Command to run the API server
CMD ["npm", "run", "watch"]

