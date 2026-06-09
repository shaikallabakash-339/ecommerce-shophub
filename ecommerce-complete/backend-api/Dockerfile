FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app . 

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start"]
