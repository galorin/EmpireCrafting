# Stage 1: Build the React application
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the application. The API URL will be a placeholder.
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Copy the built static files
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Set the entrypoint to our script
ENTRYPOINT ["/entrypoint.sh"]
# The command is now passed to the entrypoint
CMD ["nginx", "-g", "daemon off;"]
