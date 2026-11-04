# syntax=docker/dockerfile:1

# ---- Stage 1: Build the Vite React application ----
FROM node:20-alpine AS build
WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ARG VITE_API_KEY=
ARG VITE_RESTAURANT_ID=17

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_RESTAURANT_ID=$VITE_RESTAURANT_ID

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: Serve static files with Nginx ----
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

