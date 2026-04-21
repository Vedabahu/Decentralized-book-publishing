FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN pnpm install

COPY frontend/ .

COPY ./shared /app/public/shared

RUN pnpm build

EXPOSE 3000

# Create public/shared directory for shared volume to mount
RUN mkdir -p public/shared


CMD ["pnpm", "start"]
