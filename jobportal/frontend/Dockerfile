# Stage 1: Build the production files
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve using a lightweight web server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
