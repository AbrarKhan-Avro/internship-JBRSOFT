# Use official Node image
FROM node:20-alpine

WORKDIR /app

# copy package files first for better caching
COPY package*.json ./
RUN npm install

# copy rest of the source code
COPY . .

# build for production
RUN npm run build

# use a small server to serve build
RUN npm install -g serve

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
