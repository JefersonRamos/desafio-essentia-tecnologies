# syntax=docker/dockerfile:1

# ---- base -----------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- dev (ng serve com hot reload) ----------------------------------------
FROM base AS dev
ENV NODE_ENV=development
RUN echo 'Hello World'
# RUN npm install
COPY . .
EXPOSE 80
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "80", "--poll", "2000"]

# ---- build (Angular compilado) --------------------------------------------
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---- prod (estático servido por nginx) ------------------------------------
FROM nginx:1.27-alpine AS prod
# o builder @angular/build:application gera dist/<projeto>/browser
COPY --from=build /app/dist/web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
