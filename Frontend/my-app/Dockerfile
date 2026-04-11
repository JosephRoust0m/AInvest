# Stage 1 — Build the React app
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Declare build args and pass them as env vars for Vite
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_GATEWAY_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL

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
