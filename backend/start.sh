#!/bin/sh
echo "Starting Hardhat node..."
# Start node in background
pnpm hardhat node &
NODE_PID=$!

# Wait for node to boot
sleep 10

echo "Compiling contracts..."
pnpm hardhat compile

echo "Deploying contracts..."
pnpm hardhat run scripts/deployAndRegister.ts --network localhost

echo "Copying artifacts..."
cp -r artifacts /shared/

# Bring the hardhat node to the foreground
fg %1
