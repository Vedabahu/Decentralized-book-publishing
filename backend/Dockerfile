FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY . .

# Install dependencies
RUN pnpm install

# Expose Hardhat port
EXPOSE 8545

# Start everything
CMD ["sh", "start.sh"]
