FROM node:22.17 AS build

COPY frontend/package.json frontend/build-scripts/extract-versions.js frontend/package-lock.json .npmrc /app/frontend/
COPY backend/package.json backend/package-lock.json .npmrc /app/backend/
COPY package.json package-lock.json .npmrc /app/

WORKDIR /app
RUN --mount=type=secret,id=github_token \
    NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) npm ci

COPY . ./

RUN npm run build

FROM node:22.17.0-alpine

ENV USER_UID=1001
ENV GROUP_UID=1001

COPY --from=build --chown=${USER_UID}:${GROUP_UID} /app/backend /app/backend
COPY --from=build --chown=${USER_UID}:${GROUP_UID} /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
EXPOSE 3000
USER ${USER_UID}:${GROUP_UID}
CMD ["node", "dist/main"]
