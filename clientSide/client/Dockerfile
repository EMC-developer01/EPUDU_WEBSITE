#build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18-alpine

WORKDIR /client

RUN npm install -g serve

# ENV PATH="/usr/local/bin:$PATH"

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

# docker build -t react-client .
# docker run -p 5173:3000 react-client