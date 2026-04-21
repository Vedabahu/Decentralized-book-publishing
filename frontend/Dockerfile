FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

# Create public/shared directory for shared volume to mount
RUN mkdir -p public/shared

CMD ["pnpm", "start"]
