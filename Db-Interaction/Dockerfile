FROM node:18-alpine

RUN addgroup -g 1001 -S appgroup \
    && adduser -S appuser -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV PORT=7000

USER appuser

EXPOSE 7000

CMD ["npm", "start"]
