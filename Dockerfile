FROM node:20.11 as build

COPY frontend/package.json frontend/package-lock.json .npmrc /app/frontend/
COPY backend/package.json backend/package-lock.json .npmrc /app/backend/
COPY package.json package-lock.json .npmrc /app/

RUN --mount=type=secret,id=github_token \
    sh -c "cd /app/frontend && NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) npm ci" && \
    sh -c "cd /app/backend && NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) npm ci"

WORKDIR /app
COPY . ./

# https://github.com/webpack/webpack/issues/14532
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN sh -c "cd /app/frontend && npm run build" && \
    sh -c "cd /app/backend && npm run build"

# prepare directory for deployment
FROM node:20.11.0-alpine

# Applications
COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
EXPOSE 3000

CMD ["node", "dist/main"]
