FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "npm" ,"start" ]

# docker build -t serverside .
# docker run -p 4000:4000 serverside
