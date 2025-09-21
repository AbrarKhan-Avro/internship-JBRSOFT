FROM node:20-alpine

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

RUN npm install

# Copy the rest of the app (excluding node_modules via .dockerignore)
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
