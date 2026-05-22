#!/bin/bash
set -e
echo "Installing dependencies..."
npm install
npm install --prefix server
npm install --prefix client

echo "Building server..."
npm run build --prefix server

echo "Building React client..."
npm run build --prefix client

echo "Done. Run: node dist/server/server.js"
echo "Or with PM2: pm2 start dist/server/server.js --name quiz"
