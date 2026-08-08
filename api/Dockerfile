# syntax=docker/dockerfile:1

# ---- base ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- dev ----
FROM base AS dev
ENV NODE_ENV=development
RUN echo 'Hello World'
#RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- build ----
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---- prod  ----
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
