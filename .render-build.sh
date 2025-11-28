#!/bin/bash
# Render build script
set -e

echo "Installing dependencies..."
yarn install

echo "Building TypeScript..."
yarn build

echo "Verifying build output..."
if [ ! -f "dist/server.js" ]; then
    echo "ERROR: dist/server.js not found!"
    echo "Current directory: $(pwd)"
    echo "Contents:"
    ls -la
    echo "Dist contents:"
    ls -la dist/ 2>&1 || echo "dist folder does not exist"
    exit 1
fi

echo "Build successful! dist/server.js exists."

