#build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# FROM node:18 AS build

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# production stage
# FROM node:18-alpine

# WORKDIR /admin

# RUN npm install -g serve

# ENV PATH="/usr/local/bin:$PATH"

# COPY --from=build /app/dist ./dist

# EXPOSE 3001

# CMD ["serve", "-s", "dist", "-l", "3001"]

# docker build -t react-admin .
# docker run -p 5174:3001 react-admin