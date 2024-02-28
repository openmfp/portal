FROM node:20.11 as build

COPY frontend/package.json package-lock.json /app/frontend/
COPY backend/package.json package-lock.json /app/backend/

WORKDIR /app

COPY . ./

# https://github.com/webpack/webpack/issues/14532
ENV NODE_OPTIONS=--openssl-legacy-provider


WORKDIR /app/frontend
RUN npm ci
RUN npm run build

WORKDIR /app/backend
RUN npm ci
RUN npm run build

# prepare directory for deployment
FROM node:20.11.0-alpine

# Applications
COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
EXPOSE 3000

CMD ["node", "dist/main"]
