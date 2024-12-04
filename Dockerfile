FROM node:20-alpine

WORKDIR /usr/server/app

COPY ./package*.json ./

RUN npm install

COPY . .

COPY .env ./

RUN npx prisma generate

RUN npx prisma migrate dev --name init

RUN npm run build

ENV NODE_ENV=production

EXPOSE 5555

CMD ["npm", "run" ,"start"]