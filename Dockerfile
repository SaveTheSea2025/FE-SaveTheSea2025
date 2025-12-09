# Step 1: Build stage
FROM node:20 AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Accept ALL Vite build-time variables
ARG VITE_API_BASE_URL
ARG VITE_KAKAO_MAP_KEY
ARG VITE_MOF_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_KAKAO_MAP_KEY=$VITE_KAKAO_MAP_KEY
ENV VITE_MOF_KEY=$VITE_MOF_KEY

# Build Vite app
RUN npm run build

# Step 2: Nginx serve
FROM nginx:stable

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
