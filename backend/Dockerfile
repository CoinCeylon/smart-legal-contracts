FROM node:20.4.0-alpine
LABEL authors="PethumJeewantha"

RUN mkdir /app

RUN apk update

WORKDIR /app

COPY package*.json ./

RUN chown -R node:node /app
USER node
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3100

CMD [ "npm", "start" ]
