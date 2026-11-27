FROM node:24.22 AS build

COPY frontend/package.json frontend/build-scripts/extract-versions.js frontend/package-lock.json /app/frontend/
COPY backend/package.json backend/package-lock.json /app/backend/
COPY package.json package-lock.json /app/

WORKDIR /app
RUN npm ci

COPY . ./

RUN npm run build

FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5

ENV USER_UID=1001
ENV GROUP_UID=1001

COPY --from=build --chown=${USER_UID}:${GROUP_UID} /app/backend /app/backend
COPY --from=build --chown=${USER_UID}:${GROUP_UID} /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
EXPOSE 3000
USER ${USER_UID}:${GROUP_UID}
CMD ["node", "dist/main"]
