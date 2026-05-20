#!/bin/bash
set -e
echo "Installing dependencies..."
npm install
npm install --prefix server
npm install --prefix client

echo "Building React client..."
npm run build

echo "Done. Run: node server/server.js"
echo "Or with PM2: pm2 start server/server.js --name quiz"
