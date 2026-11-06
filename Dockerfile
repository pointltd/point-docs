# The docs are plain static files served by nginx. Cloud Run sends traffic to port 8080.
ARG NODE_IMAGE=node:22-slim
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.28-alpine

FROM ${NODE_IMAGE} AS build
# pnpm comes from the "packageManager" field in package.json.
RUN npm install -g pnpm@12.16.1
WORKDIR /app
# Dependencies first so this layer is cached until the lockfile changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_ENV=production
# The Google Analytics measurement id of the docs (a public id). Empty = no analytics and no cookie banner.
ARG NUXT_PUBLIC_GA_ID=
ENV NUXT_PUBLIC_GA_ID=${NUXT_PUBLIC_GA_ID}
RUN pnpm run generate

FROM ${NGINX_IMAGE} AS prod
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 8080
