#build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18-alpine

WORKDIR /vendor

RUN npm install -g serve

# ENV PATH="/usr/local/bin:$PATH"

COPY --from=build /app/dist ./dist

EXPOSE 3002

CMD ["serve", "-s", "dist", "-l", "3002"]

# docker build -t react-vendor .
# docker run -p 5175:3002 react-vendor