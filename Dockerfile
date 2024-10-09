FROM node:20.11 AS build

COPY frontend/package.json frontend/package-lock.json .npmrc /app/frontend/
COPY backend/package.json backend/package-lock.json .npmrc /app/backend/
COPY package.json package-lock.json .npmrc /app/

WORKDIR /app
RUN --mount=type=secret,id=github_token \
    NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) npm ci

COPY . ./

RUN npm run build

# prepare directory for deployment
FROM node:20.11.0-alpine

# Applications
COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
EXPOSE 3000

CMD ["node", "dist/main"]
