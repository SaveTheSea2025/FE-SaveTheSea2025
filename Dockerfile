# Step 1: Build stage
FROM node:18 AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Accept build-time environment variables (from Cloud Build / Cloud Run)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build Vite app using production mode
RUN npm run build

# Step 2: Nginx serve stage
FROM nginx:stable

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
