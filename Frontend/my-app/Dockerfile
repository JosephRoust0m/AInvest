# Stage 1 — Build the React app
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 — Run the Express server to serve the built app
FROM node:18
WORKDIR /app

# Copy only what we need at runtime
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY ./server.js .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
